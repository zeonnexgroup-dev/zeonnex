import crypto from "node:crypto";
import { createClient } from "@libsql/client";
import { del, put } from "@vercel/blob";
import { DEFAULT_BUILDER, DEFAULT_SITE_SETTINGS, PERMISSION_SEEDS, ROLE_SEEDS } from "./defaults.mjs";

// Keep raw bodies available for JSON and media uploads.
export const config = { api: { bodyParser: false } };

const SESSION_COOKIE = "zeonnex_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;
let client;
let initialisePromise;

function jsonSafe(value) {
  if (typeof value === "bigint") return Number(value);
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, jsonSafe(item)]));
  return value;
}

function allowedOrigins() {
  return String(process.env.ALLOWED_ORIGIN || "").split(",").map((value) => value.trim()).filter(Boolean);
}

function requestOriginAllowed(req) {
  const origin = String(req.headers.origin || "").trim();
  if (!origin) return true;
  const configured = allowedOrigins();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const sameDeploymentOrigin = Boolean(host) && origin === `${proto}://${host}`;
  return sameDeploymentOrigin || configured.includes(origin);
}

function setCors(req, res) {
  const origin = String(req.headers.origin || "").trim();
  if (!origin || !requestOriginAllowed(req)) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
}

function assertSafeRequestOrigin(req) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method || "")) return;
  if (!requestOriginAllowed(req)) {
    const error = new Error("This request was blocked because its Origin is not allowed.");
    error.statusCode = 403;
    throw error;
  }
}

function respond(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(jsonSafe(payload)));
}

function setCookie(res, value, maxAge = SESSION_SECONDS) {
  // Secure is always enabled on Vercel/production. Allowing an HTTP cookie only
  // for a local non-production function makes `vercel dev` usable without
  // weakening deployed sessions.
  const secure = process.env.VERCEL || process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${maxAge}`);
}

function database() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    const error = new Error("Turso is not configured. Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel Project Settings → Environment Variables.");
    error.statusCode = 503;
    throw error;
  }
  if (!client) client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  return client;
}

async function execute(sql, args = []) {
  return database().execute({ sql, args });
}

function ownerSeedEmail() {
  return String(process.env.SEED_OWNER_EMAIL || "").trim().toLowerCase();
}

function assertJwtSecret() {
  const secret = process.env.JWT_SECRET || "";
  if (secret.length < 32) {
    const error = new Error("JWT_SECRET must be set to a unique value of at least 32 characters before production sign-in can be used.");
    error.statusCode = 503;
    throw error;
  }
  return secret;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${digest}`;
}

function verifyPassword(password, stored) {
  const [scheme, salt, digest] = String(stored || "").split("$");
  if (scheme !== "scrypt" || !salt || !digest) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  const left = Buffer.from(candidate, "hex");
  const right = Buffer.from(digest, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signSession(user) {
  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = toBase64Url(JSON.stringify({ sub: String(user.id), sv: Number(user.sessionVersion || 0), iat: now, exp: now + SESSION_SECONDS }));
  const signature = crypto.createHmac("sha256", assertJwtSecret()).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function verifySession(token) {
  // Surface a missing/weak production secret as configuration failure instead
  // of silently treating it as an ordinary signed-out browser.
  const secret = assertJwtSecret();
  try {
    const [header, payload, signature] = String(token || "").split(".");
    if (!header || !payload || !signature) return null;
    const expected = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const decoded = JSON.parse(fromBase64Url(payload));
    if (!decoded?.sub || !decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

function requestToken(req) {
  const authorization = req.headers.authorization || "";
  if (authorization.startsWith("Bearer ")) return authorization.slice(7).trim();
  const cookies = String(req.headers.cookie || "").split(";").map((item) => item.trim());
  const item = cookies.find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`));
  return item ? decodeURIComponent(item.slice(SESSION_COOKIE.length + 1)) : null;
}

function openMode() {
  // The bypass exists only for a local/development recovery workflow. Vercel
  // Production is never allowed to turn off authentication by accident.
  return process.env.OPEN_ADMIN_MODE === "true" && process.env.VERCEL_ENV !== "production" && process.env.NODE_ENV !== "production";
}

async function initialise() {
  if (initialisePromise) return initialisePromise;
  initialisePromise = (async () => {
    const schema = [
      "CREATE TABLE IF NOT EXISTS app_content (content_key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
      "CREATE TABLE IF NOT EXISTS enquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, enquiry_type TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
      "CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL UNIQUE, original_name TEXT NOT NULL, mime_type TEXT NOT NULL, size INTEGER NOT NULL, url TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
      "CREATE TABLE IF NOT EXISTS roles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, description TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#2563eb')",
      "CREATE TABLE IF NOT EXISTS permissions (id INTEGER PRIMARY KEY AUTOINCREMENT, permission_key TEXT NOT NULL UNIQUE, label TEXT NOT NULL, permission_group TEXT NOT NULL)",
      "CREATE TABLE IF NOT EXISTS role_permissions (role_id INTEGER NOT NULL, permission_id INTEGER NOT NULL, PRIMARY KEY (role_id, permission_id))",
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, role_id INTEGER, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    ];
    for (const statement of schema) await execute(statement);
    try { await execute("ALTER TABLE users ADD COLUMN password_hash TEXT"); } catch (error) { if (!/duplicate column/i.test(String(error?.message || ""))) throw error; }
    try { await execute("ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0"); } catch (error) { if (!/duplicate column/i.test(String(error?.message || ""))) throw error; }
    await execute("INSERT OR IGNORE INTO app_content (content_key, value) VALUES (?, ?)", ["page_builder", JSON.stringify(DEFAULT_BUILDER)]);
    await execute("INSERT OR IGNORE INTO app_content (content_key, value) VALUES (?, ?)", ["site_settings", JSON.stringify(DEFAULT_SITE_SETTINGS)]);
    for (const [name, description, color] of ROLE_SEEDS) await execute("INSERT OR IGNORE INTO roles (name, description, color) VALUES (?, ?, ?)", [name, description, color]);
    for (const [key, label, group] of PERMISSION_SEEDS) await execute("INSERT OR IGNORE INTO permissions (permission_key, label, permission_group) VALUES (?, ?, ?)", [key, label, group]);

    const roles = (await execute("SELECT id, name FROM roles")).rows;
    const permissions = (await execute("SELECT id, permission_key FROM permissions")).rows;
    const grants = {
      Owner: new Set(permissions.map((permission) => permission.permission_key)),
      Admin: new Set(permissions.map((permission) => permission.permission_key).filter((key) => key !== "roles.manage")),
      "Content Editor": new Set(["dashboard.view", "content.edit", "pages.publish", "media.manage"]),
      "Sales Manager": new Set(["dashboard.view", "enquiries.manage"]),
      Viewer: new Set(["dashboard.view"]),
    };
    for (const role of roles) {
      for (const permission of permissions) {
        if (grants[role.name]?.has(permission.permission_key)) await execute("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)", [role.id, permission.id]);
      }
    }

    const email = ownerSeedEmail();
    const seedPassword = String(process.env.SEED_OWNER_PASSWORD || "");
    if (email && seedPassword.length >= 12) {
      const owner = (await execute("SELECT id FROM roles WHERE name = 'Owner' LIMIT 1")).rows[0];
      const user = (await execute("SELECT id, password_hash FROM users WHERE email = ? LIMIT 1", [email])).rows[0];
      if (!user) await execute("INSERT INTO users (name, email, role_id, password_hash) VALUES (?, ?, ?, ?)", ["Owner", email, owner.id, hashPassword(seedPassword)]);
      else if (!user.password_hash) await execute("UPDATE users SET password_hash = ?, role_id = ? WHERE id = ?", [hashPassword(seedPassword), owner.id, user.id]);
    }
  })().catch((error) => {
    initialisePromise = undefined;
    throw error;
  });
  return initialisePromise;
}

async function assertSignInAccountAvailable() {
  const account = (await execute("SELECT id FROM users WHERE password_hash IS NOT NULL LIMIT 1")).rows[0];
  if (!account && (!ownerSeedEmail() || !strongPassword(String(process.env.SEED_OWNER_PASSWORD || "")))) {
    const error = new Error("No Owner account is configured yet. Set SEED_OWNER_EMAIL and a private SEED_OWNER_PASSWORD of at least 12 characters, then redeploy.");
    error.statusCode = 503;
    throw error;
  }
}

async function rawBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === "string") return Buffer.from(req.body);
    return Buffer.from(JSON.stringify(req.body));
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function requestJson(req) {
  const raw = await rawBody(req);
  if (raw.length > 2_000_000) throw Object.assign(new Error("Request is too large."), { statusCode: 413 });
  return raw.length ? JSON.parse(raw.toString("utf8")) : {};
}

function safeField(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function safeLink(value) {
  const link = String(value ?? "").trim();
  return !link || link.startsWith("#") || /^\/(?!\/)/.test(link) || /^(https?:\/\/|mailto:|tel:)/i.test(link);
}

function safeAssetUrl(value) {
  const url = String(value ?? "").trim();
  return !url || /^\/(?!\/)/.test(url) || /^https?:\/\//i.test(url);
}

function safeBuilderReferences(value) {
  if (Array.isArray(value)) return value.every(safeBuilderReferences);
  if (!value || typeof value !== "object") return true;
  return Object.entries(value).every(([key, child]) => {
    if (typeof child === "string") {
      if (/href$/i.test(key)) return safeLink(child);
      if (["image", "src"].includes(key)) return safeAssetUrl(child);
    }
    return safeBuilderReferences(child);
  });
}

function normaliseSiteSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const settings = {
    companyName: safeField(value.companyName || DEFAULT_SITE_SETTINGS.companyName, 160),
    contactEmail: safeField(value.contactEmail || DEFAULT_SITE_SETTINGS.contactEmail, 180),
    contactPhone: safeField(value.contactPhone || DEFAULT_SITE_SETTINGS.contactPhone, 80),
    address: safeField(value.address || DEFAULT_SITE_SETTINGS.address, 300),
    navbarLogo: safeField(value.navbarLogo || "", 2048),
    favicon: safeField(value.favicon || "", 2048),
  };
  if (!safeAssetUrl(settings.navbarLogo) || !safeAssetUrl(settings.favicon)) return null;
  return settings;
}

function strongPassword(password) {
  return typeof password === "string" && password.length >= 12;
}

function parseBuilder(value) {
  if (!value || typeof value !== "object") return structuredClone(DEFAULT_BUILDER);
  return {
    homepage: { ...DEFAULT_BUILDER.homepage, ...value.homepage, blocks: Array.isArray(value.homepage?.blocks) ? value.homepage.blocks : DEFAULT_BUILDER.homepage.blocks },
    pages: Array.isArray(value.pages) ? value.pages : [],
  };
}

function validBuilder(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.pages)) return false;
  const validBlock = (block) => block && typeof block === "object" && typeof block.id === "string" && block.id.length > 0 && block.id.length <= 120 && typeof block.type === "string" && block.type.length <= 80 && typeof block.label === "string" && block.label.length <= 180 && typeof block.visible === "boolean" && block.settings && typeof block.settings === "object" && !Array.isArray(block.settings) && safeBuilderReferences(block.settings);
  const validPage = (page, homepage = false) => page && typeof page === "object" && typeof page.id === "string" && page.id.length > 0 && page.id.length <= 120 && typeof page.title === "string" && page.title.length <= 180 && typeof page.slug === "string" && (homepage ? page.slug === "" : /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug)) && ["draft", "published"].includes(page.status) && typeof page.showInNavigation === "boolean" && typeof page.navigationLabel === "string" && page.navigationLabel.length <= 180 && Array.isArray(page.blocks) && page.blocks.every(validBlock);
  if (!validPage(value.homepage, true)) return false;
  const slugs = new Set();
  const ids = new Set([value.homepage.id]);
  return value.pages.every((page) => {
    if (!validPage(page) || slugs.has(page.slug) || ids.has(page.id)) return false;
    slugs.add(page.slug); ids.add(page.id);
    return true;
  });
}

async function getContent() {
  const rows = (await execute("SELECT content_key, value FROM app_content WHERE content_key IN ('page_builder', 'site_settings')")).rows;
  const values = Object.fromEntries(rows.map((row) => [row.content_key, row.value]));
  let pageBuilder = DEFAULT_BUILDER;
  let siteSettings = DEFAULT_SITE_SETTINGS;
  try { pageBuilder = parseBuilder(JSON.parse(values.page_builder)); } catch { /* use defaults */ }
  try { siteSettings = { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(values.site_settings) }; } catch { /* use defaults */ }
  return { pageBuilder, siteSettings };
}

async function adminUser(userId) {
  const user = (await execute("SELECT users.id, users.name, users.email, users.status, users.session_version AS sessionVersion, roles.name AS role FROM users LEFT JOIN roles ON roles.id = users.role_id WHERE users.id = ? LIMIT 1", [Number(userId)])).rows[0];
  if (!user || user.status !== "active") return null;
  const permissions = (await execute("SELECT permissions.permission_key FROM role_permissions JOIN permissions ON permissions.id = role_permissions.permission_id JOIN users ON users.role_id = role_permissions.role_id WHERE users.id = ?", [Number(userId)])).rows.map((row) => row.permission_key);
  return { id: Number(user.id), name: user.name, email: user.email, role: user.role || "Viewer", permissions, sessionVersion: Number(user.sessionVersion || 0) };
}

function publicSessionUser(user) {
  const { sessionVersion, ...profile } = user;
  return profile;
}

async function requireAuth(req, res, permission) {
  if (openMode()) return { id: 0, name: "Development Owner", email: "development@localhost", role: "Owner", permissions: PERMISSION_SEEDS.map(([key]) => key) };
  const session = verifySession(requestToken(req));
  if (!session) { respond(res, 401, { message: "Authentication is required." }); return null; }
  const user = await adminUser(session.sub);
  if (!user || Number(session.sv || 0) !== Number(user.sessionVersion || 0)) { respond(res, 401, { message: "Your session is no longer valid." }); return null; }
  const required = Array.isArray(permission) ? permission : permission ? [permission] : [];
  if (required.length && !required.some((key) => user.permissions.includes(key))) { respond(res, 403, { message: "You do not have permission to perform this action." }); return null; }
  return user;
}

async function setRolePermissions(roleId, values) {
  const ids = Array.isArray(values) ? [...new Set(values.map(Number).filter((id) => Number.isInteger(id) && id > 0))] : [];
  const available = new Set((await execute("SELECT id FROM permissions")).rows.map((row) => Number(row.id)));
  await execute("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);
  for (const permissionId of ids.filter((id) => available.has(id))) await execute("INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)", [roleId, permissionId]);
}

async function siteSettingsPayload() {
  const row = (await execute("SELECT value FROM app_content WHERE content_key = 'site_settings' LIMIT 1")).rows[0];
  try { return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(row?.value || "{}") }; } catch { return structuredClone(DEFAULT_SITE_SETTINGS); }
}

function publishedPageChanges(previous, next) {
  const oldById = new Map((previous?.pages || []).map((page) => [page.id, page]));
  const nextById = new Map((next?.pages || []).map((page) => [page.id, page]));
  const ids = new Set([...oldById.keys(), ...nextById.keys()]);
  return [...ids].some((id) => {
    const before = oldById.get(id); const after = nextById.get(id);
    return (before?.status === "published" || after?.status === "published") && JSON.stringify(before) !== JSON.stringify(after);
  });
}

async function permissionKeysForRole(roleId) {
  return (await execute("SELECT permissions.permission_key FROM role_permissions JOIN permissions ON permissions.id = role_permissions.permission_id WHERE role_permissions.role_id = ?", [roleId])).rows.map((row) => row.permission_key);
}

async function assertAssignableRole(actor, roleId) {
  const role = (await execute("SELECT id, name FROM roles WHERE id = ? LIMIT 1", [roleId])).rows[0];
  if (!role) {
    const error = new Error("Choose a valid role."); error.statusCode = 400; throw error;
  }
  // A user manager without role-management power may only grant roles whose
  // permissions are already a subset of their own. This prevents assigning an
  // Owner or another more-privileged role to escalate access.
  if (!actor.permissions.includes("roles.manage")) {
    const permissions = await permissionKeysForRole(role.id);
    if (permissions.some((key) => !actor.permissions.includes(key))) {
      const error = new Error("You cannot assign a role with permissions above your own."); error.statusCode = 403; throw error;
    }
  }
  return role;
}

async function assertManageableUser(actor, userId) {
  const target = (await execute("SELECT id, role_id AS roleId FROM users WHERE id = ? LIMIT 1", [userId])).rows[0];
  if (!target) {
    const error = new Error("User not found."); error.statusCode = 404; throw error;
  }
  if (target.roleId) await assertAssignableRole(actor, Number(target.roleId));
  return target;
}

async function accessPayload(actor) {
  const canManageRoles = actor.permissions.includes("roles.manage");
  const canManageUsers = actor.permissions.includes("users.manage");
  const roleRows = (await execute("SELECT id, name, description, color FROM roles ORDER BY id")).rows;
  const roles = [];
  for (const role of roleRows) {
    const permissionIds = canManageRoles ? (await execute("SELECT permission_id FROM role_permissions WHERE role_id = ? ORDER BY permission_id", [role.id])).rows.map((item) => Number(item.permission_id)) : [];
    roles.push({ ...role, permissionIds });
  }
  const permissions = canManageRoles ? (await execute("SELECT id, permission_key AS permissionKey, label, permission_group AS permissionGroup FROM permissions ORDER BY permission_group, id")).rows : [];
  const users = canManageUsers ? (await execute("SELECT users.id, users.name, users.email, users.status, users.role_id AS roleId, users.created_at AS createdAt, roles.name AS role FROM users LEFT JOIN roles ON roles.id = users.role_id ORDER BY users.id")).rows : [];
  return { roles, permissions, users, enforcement: openMode() ? "temporarily-disabled" : "enabled" };
}

function parseMultipart(buffer, contentType) {
  const boundaryMatch = /boundary=([^;]+)/i.exec(contentType || "");
  if (!boundaryMatch) return null;
  const boundary = Buffer.from(`--${boundaryMatch[1].trim().replace(/^"|"$/g, "")}`);
  const pieces = buffer.toString("binary").split(boundary.toString("binary"));
  for (const piece of pieces) {
    const part = Buffer.from(piece, "binary");
    const separator = part.indexOf(Buffer.from("\r\n\r\n"));
    if (separator === -1) continue;
    const header = part.subarray(0, separator).toString("utf8");
    const disposition = /Content-Disposition:\s*form-data;[^\r\n]*name="file"[^\r\n]*filename="([^"]*)"/i.exec(header);
    if (!disposition) continue;
    let data = part.subarray(separator + 4);
    if (data.subarray(-2).equals(Buffer.from("\r\n"))) data = data.subarray(0, -2);
    const type = /Content-Type:\s*([^\r\n;]+)/i.exec(header)?.[1]?.trim() || "application/octet-stream";
    return { filename: disposition[1], type, data };
  }
  return null;
}

async function handleMediaUpload(req, res) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return respond(res, 503, { message: "Media uploads need a Vercel Blob store. Connect Blob and set BLOB_READ_WRITE_TOKEN." });
  const body = await rawBody(req);
  if (body.length > 5 * 1024 * 1024 + 32 * 1024) return respond(res, 413, { message: "Files must be 5 MB or smaller." });
  const file = parseMultipart(body, req.headers["content-type"]);
  if (!file?.filename || !file.data.length) return respond(res, 400, { message: "Choose a file first." });
  if (file.data.length > 5 * 1024 * 1024) return respond(res, 413, { message: "Files must be 5 MB or smaller." });
  const originalName = file.filename.split(/[\\/]/).pop().replace(/[^a-zA-Z0-9._-]/g, "-") || "upload";
  const blobName = `media/${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${originalName}`;
  const blob = await put(blobName, file.data, { access: "public", contentType: file.type, token: process.env.BLOB_READ_WRITE_TOKEN });
  const result = await execute("INSERT INTO media (filename, original_name, mime_type, size, url) VALUES (?, ?, ?, ?, ?)", [blob.pathname, originalName, file.type, file.data.length, blob.url]);
  return respond(res, 201, { media: { id: Number(result.lastInsertRowid), originalName, mimeType: file.type, size: file.data.length, url: blob.url, createdAt: new Date().toISOString() } });
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") { res.statusCode = 204; return res.end(); }
  const pathname = new URL(req.url || "/api", "http://localhost").pathname.replace(/\/+$/, "") || "/api";
  try {
    assertSafeRequestOrigin(req);
    await initialise();

    if (req.method === "GET" && (pathname === "/api" || pathname === "/api/health")) return respond(res, 200, { ok: true, openAdmin: openMode(), database: "turso", authentication: openMode() ? "bypassed" : "required" });
    if (req.method === "GET" && pathname === "/api/public/content") return respond(res, 200, await getContent());
    if (req.method === "POST" && pathname === "/api/public/enquiries") {
      const body = await requestJson(req); const name = safeField(body.name, 120); const email = safeField(body.email, 180); const enquiryType = safeField(body.enquiryType || "General Enquiry", 160); const message = safeField(body.message, 5000);
      if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || message.length < 5) return respond(res, 400, { message: "Enter a name, email and message." });
      const result = await execute("INSERT INTO enquiries (name, email, enquiry_type, message) VALUES (?, ?, ?, ?)", [name, email, enquiryType, message]);
      return respond(res, 201, { id: Number(result.lastInsertRowid), message: "Enquiry received." });
    }

    if (req.method === "POST" && pathname === "/api/auth/login") {
      if (openMode()) return respond(res, 400, { message: "Open admin mode is enabled. Disable OPEN_ADMIN_MODE to use sign-in." });
      assertJwtSecret();
      await assertSignInAccountAvailable();
      const body = await requestJson(req); const email = safeField(body.email, 180).toLowerCase(); const password = String(body.password || "");
      const record = (await execute("SELECT id, password_hash FROM users WHERE email = ? AND status = 'active' LIMIT 1", [email])).rows[0];
      if (!record || !verifyPassword(password, record.password_hash)) return respond(res, 401, { message: "Incorrect email or password." });
      const user = await adminUser(record.id);
      const token = signSession(user); setCookie(res, token);
      return respond(res, 200, { user: publicSessionUser(user) });
    }
    if (req.method === "GET" && pathname === "/api/auth/me") {
      const user = await requireAuth(req, res); if (!user) return;
      return respond(res, 200, { user: publicSessionUser(user) });
    }
    if (req.method === "POST" && pathname === "/api/auth/logout") { setCookie(res, "", 0); return respond(res, 200, { ok: true }); }

    if (req.method === "GET" && pathname === "/api/content") { const user = await requireAuth(req, res, "content.edit"); if (!user) return; return respond(res, 200, await getContent()); }
    if (req.method === "PUT" && pathname === "/api/content") {
      const user = await requireAuth(req, res, "content.edit"); if (!user) return;
      const body = await requestJson(req); if (!validBuilder(body?.pageBuilder)) return respond(res, 400, { message: "Page builder data is incomplete or contains an unsupported link." });
      const existing = await getContent();
      if (!user.permissions.includes("pages.publish") && publishedPageChanges(existing.pageBuilder, body.pageBuilder)) return respond(res, 403, { message: "The Publish pages permission is required to change a published custom page." });
      const serialized = JSON.stringify(body.pageBuilder); if (serialized.length > 1_900_000) return respond(res, 413, { message: "Builder content is too large." });
      await execute("UPDATE app_content SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE content_key = 'page_builder'", [serialized]);
      return respond(res, 200, await getContent());
    }

    if (req.method === "GET" && pathname === "/api/settings") { const user = await requireAuth(req, res, "settings.manage"); if (!user) return; return respond(res, 200, { siteSettings: await siteSettingsPayload() }); }
    if (req.method === "PUT" && pathname === "/api/settings") {
      const user = await requireAuth(req, res, "settings.manage"); if (!user) return;
      const body = await requestJson(req); const settings = normaliseSiteSettings(body?.siteSettings);
      if (!settings) return respond(res, 400, { message: "Site settings are incomplete or contain an unsupported asset URL." });
      const serialized = JSON.stringify(settings); if (serialized.length > 100_000) return respond(res, 413, { message: "Site settings are too large." });
      await execute("UPDATE app_content SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE content_key = 'site_settings'", [serialized]);
      return respond(res, 200, { siteSettings: await siteSettingsPayload() });
    }

    if (req.method === "GET" && pathname === "/api/access") { const user = await requireAuth(req, res, ["users.manage", "roles.manage"]); if (!user) return; return respond(res, 200, await accessPayload(user)); }
    if (req.method === "POST" && pathname === "/api/roles") {
      const user = await requireAuth(req, res, "roles.manage"); if (!user) return;
      const body = await requestJson(req); const name = safeField(body.name, 80); const description = safeField(body.description, 500); const color = /^#[0-9a-f]{6}$/i.test(safeField(body.color, 7)) ? safeField(body.color, 7) : "#2563eb";
      if (name.length < 2 || description.length < 3) return respond(res, 400, { message: "Enter a role name and description." });
      const result = await execute("INSERT INTO roles (name, description, color) VALUES (?, ?, ?)", [name, description, color]); const id = Number(result.lastInsertRowid); await setRolePermissions(id, body.permissionIds); return respond(res, 201, { id });
    }
    const roleMatch = /^\/api\/roles\/(\d+)$/.exec(pathname);
    if (req.method === "PATCH" && roleMatch) {
      const user = await requireAuth(req, res, "roles.manage"); if (!user) return;
      const body = await requestJson(req); const id = Number(roleMatch[1]); const name = safeField(body.name, 80); const description = safeField(body.description, 500); const color = /^#[0-9a-f]{6}$/i.test(safeField(body.color, 7)) ? safeField(body.color, 7) : "#2563eb";
      if (name.length < 2 || description.length < 3) return respond(res, 400, { message: "Enter a role name and description." });
      const result = await execute("UPDATE roles SET name = ?, description = ?, color = ? WHERE id = ?", [name, description, color, id]); if (!result.rowsAffected) return respond(res, 404, { message: "Role not found." }); if (Array.isArray(body.permissionIds)) await setRolePermissions(id, body.permissionIds); return respond(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/users") {
      const actor = await requireAuth(req, res, "users.manage"); if (!actor) return;
      const body = await requestJson(req); const name = safeField(body.name, 120); const email = safeField(body.email, 180).toLowerCase(); const roleId = Number(body.roleId); const password = String(body.password || "");
      if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) return respond(res, 400, { message: "Enter a valid user name and email." });
      if (!strongPassword(password)) return respond(res, 400, { message: "Set an initial password of at least 12 characters." });
      await assertAssignableRole(actor, roleId);
      const result = await execute("INSERT INTO users (name, email, role_id, password_hash) VALUES (?, ?, ?, ?)", [name, email, roleId, hashPassword(password)]); return respond(res, 201, { id: Number(result.lastInsertRowid) });
    }
    const userMatch = /^\/api\/users\/(\d+)$/.exec(pathname);
    if (req.method === "PATCH" && userMatch) {
      const actor = await requireAuth(req, res, "users.manage"); if (!actor) return;
      const body = await requestJson(req); const id = Number(userMatch[1]); const name = safeField(body.name, 120); const email = safeField(body.email, 180).toLowerCase(); const roleId = Number(body.roleId); const status = body.status === "inactive" ? "inactive" : "active"; const password = String(body.password || "");
      if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) return respond(res, 400, { message: "Enter a valid user name and email." });
      if (password && !strongPassword(password)) return respond(res, 400, { message: "New passwords must be at least 12 characters." });
      await assertManageableUser(actor, id);
      await assertAssignableRole(actor, roleId);
      const result = password ? await execute("UPDATE users SET name = ?, email = ?, role_id = ?, status = ?, password_hash = ?, session_version = session_version + 1 WHERE id = ?", [name, email, roleId, status, hashPassword(password), id]) : await execute("UPDATE users SET name = ?, email = ?, role_id = ?, status = ? WHERE id = ?", [name, email, roleId, status, id]);
      if (!result.rowsAffected) return respond(res, 404, { message: "User not found." }); return respond(res, 200, { ok: true });
    }

    if (req.method === "GET" && pathname === "/api/enquiries") { const user = await requireAuth(req, res, "enquiries.manage"); if (!user) return; const rows = (await execute("SELECT id, name, email, enquiry_type AS enquiryType, message, status, created_at AS createdAt FROM enquiries ORDER BY id DESC")).rows; return respond(res, 200, { enquiries: rows }); }
    const enquiryMatch = /^\/api\/enquiries\/(\d+)$/.exec(pathname);
    if (req.method === "PATCH" && enquiryMatch) { const user = await requireAuth(req, res, "enquiries.manage"); if (!user) return; const body = await requestJson(req); if (!["new", "in-progress", "resolved", "archived"].includes(body.status)) return respond(res, 400, { message: "Invalid status." }); await execute("UPDATE enquiries SET status = ? WHERE id = ?", [body.status, Number(enquiryMatch[1])]); return respond(res, 200, { ok: true }); }

    if (req.method === "GET" && pathname === "/api/media") { const user = await requireAuth(req, res, "media.manage"); if (!user) return; const rows = (await execute("SELECT id, original_name AS originalName, mime_type AS mimeType, size, url, created_at AS createdAt FROM media ORDER BY id DESC")).rows; return respond(res, 200, { media: rows }); }
    if (req.method === "POST" && pathname === "/api/media") { const user = await requireAuth(req, res, "media.manage"); if (!user) return; return handleMediaUpload(req, res); }
    const mediaMatch = /^\/api\/media\/(\d+)$/.exec(pathname);
    if (req.method === "DELETE" && mediaMatch) {
      const user = await requireAuth(req, res, "media.manage"); if (!user) return;
      const row = (await execute("SELECT url FROM media WHERE id = ?", [Number(mediaMatch[1])])).rows[0]; if (!row) return respond(res, 404, { message: "File not found." });
      if (process.env.BLOB_READ_WRITE_TOKEN) await del(row.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      await execute("DELETE FROM media WHERE id = ?", [Number(mediaMatch[1])]); res.statusCode = 204; return res.end();
    }

    return respond(res, 404, { message: "API endpoint not found." });
  } catch (error) {
    const message = error?.message || "Server error.";
    const status = error?.statusCode || (/UNIQUE constraint/i.test(message) ? 400 : 500);
    if (status >= 500 && !error?.statusCode) console.error("Zeonnex API error", error);
    // Explicit operational errors (for example missing Turso/JWT bootstrap
    // configuration) are safe and actionable. Unexpected server failures are
    // deliberately reduced to a generic response.
    const exposeMessage = Boolean(error?.statusCode) || status < 500;
    return respond(res, status, { message: exposeMessage ? message : "Server error." });
  }
}
