# Zeonnex Group — Vercel Website + Secure CMS

A production-ready React/Vite website and secure admin CMS for Zeonnex Group. It is designed to deploy from the **repository root** to Vercel, with persistent data in **Turso remote SQLite** and uploaded files in **Vercel Blob**.

## What is included

- Public Zeonnex Group marketing website
- Secure `/admin` sign-in screen and signed HttpOnly cookie sessions
- Server-enforced role-based access control (RBAC)
- One-time Owner bootstrap from private Vercel environment variables
- scrypt password hashing; resetting a password invalidates existing sessions for that user
- Editable roles and granular permissions
- Default editable roles: **Owner**, **Admin**, **Content Editor**, **Sales Manager**, and **Viewer**
- Visual homepage and unlimited custom-page builder
- Drag-and-drop section ordering
- Business blocks: Hero, Text, Image, Services, Features, CTA, Gallery, Testimonials, Contact and FAQ
- Draft/published custom pages at `/pages/<slug>`
- Media library backed by Vercel Blob
- Public contact form and protected enquiries workspace
- Editable contact details, navbar/footer logo, and browser favicon
- A physical `/admin/index.html` build entry plus Vercel SPA fallback for reliable direct `/admin` visits

## Architecture

```text
Browser → Vercel static Vite site
              ├─ /admin and public pages
              └─ /api/* → api/[...path].mjs Vercel Function
                                  ├─ Turso/libSQL (content, users, roles, enquiries)
                                  └─ Vercel Blob (media files)
```

Do **not** use a local SQLite file for a Vercel deployment. Vercel Functions have an ephemeral filesystem; Turso is the persistent SQLite-compatible database used by this project.

## Prerequisites

- Node.js 20.19+ (or 22.12+)
- A Vercel account/project
- A Turso database and credentials
- A Vercel Blob store (required for uploads)

## Environment variables — required before first production deploy

In **Vercel → Project → Settings → Environment Variables**, add the following values. Use real private values; never commit them to Git.

| Variable | Purpose |
| --- | --- |
| `TURSO_DATABASE_URL` | Your `libsql://...` Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token for that database |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token used by the Media Library |
| `JWT_SECRET` | A unique random session-signing secret, **at least 32 characters** |
| `SEED_OWNER_EMAIL` | Email address for the initial Owner account |
| `SEED_OWNER_PASSWORD` | Private initial Owner password, **at least 12 characters** |
| `OPEN_ADMIN_MODE` | Set to `false` or omit it in Production |

Copy `.env.example` locally only if you are using `vercel dev`; do not copy a real `.env` file into source control.

Generate a strong session secret, for example:

```bash
openssl rand -base64 48
```

### First Owner account

On the function's first configured request, it creates the Owner account from `SEED_OWNER_EMAIL` and `SEED_OWNER_PASSWORD` only when that email does not already exist. There is intentionally **no public or source-controlled default password**.

1. Configure all required variables in Vercel.
2. Deploy or redeploy.
3. Open `https://your-domain.example/admin`.
4. Sign in with the private Owner credentials you supplied in Vercel.
5. Create team users inside **Users & roles** and give each a separate initial password.

Changing the seed password later does not overwrite an existing Owner password. Use the Users & roles password-reset control while signed in instead.

## Default roles and permissions

All roles are editable by an account with `roles.manage`.

| Role | Default capabilities |
| --- | --- |
| Owner | All CMS, settings, media, enquiries, users, roles and permissions |
| Admin | All operational capabilities except editing roles/permissions |
| Content Editor | Dashboard, website content, publishing custom pages and media |
| Sales Manager | Dashboard and contact enquiries |
| Viewer | Dashboard only |

The frontend hides unavailable workspace areas, but the Vercel Function is the authority: every protected API operation checks the signed session and permission on the server.

A user manager without `roles.manage` cannot assign a role whose permissions exceed their own. This prevents an Admin account from assigning itself or another user an Owner-level role.

## Deploying on Vercel

1. Create or connect a Turso database. Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to the Vercel project.
2. Create/connect a Vercel Blob store. Vercel provides `BLOB_READ_WRITE_TOKEN`.
3. Add `JWT_SECRET`, `SEED_OWNER_EMAIL`, and `SEED_OWNER_PASSWORD` as private environment variables.
4. Set `OPEN_ADMIN_MODE=false` (or leave it unset) for Production.
5. Import the Git repository into Vercel.
6. In **Project Settings → General**, make sure **Root Directory** is the repository root (`./` or blank), not a nested folder.
7. Use the **Vite** framework preset. The included `vercel.json` supplies the build command, output directory and SPA rewrite.
8. Deploy the latest commit. For Preview deployments, use separate Turso/Blob credentials where possible.
9. Verify `https://your-domain.example/api/health`. A configured secure deployment reports `"authentication":"required"` and `"openAdmin":false`.
10. Open `/admin` and sign in with the Owner account created from your environment variables.

## Local development

Install dependencies and run the public Vite interface:

```bash
npm install
npm run dev
```

For the Vercel Function and secure admin API locally, configure a private local `.env` with the values from `.env.example`, then run Vercel's local runtime:

```bash
npx vercel dev
```

The Vercel runtime is recommended for admin testing because it executes `api/[...path].mjs` and connects to Turso exactly as the deployment does.

## Content workflow

1. Sign in at `/admin` with a user that has `content.edit`.
2. Use **Page builder** to open the homepage or a custom page.
3. Add blocks, drag to reorder, and edit the normal text fields in the sidebar.
4. Create additional pages in **Custom pages**.
5. Publish custom pages with the `pages.publish` permission.
6. Use **Media library** to upload images/documents, then copy a media URL into a visual block.
7. Use **Settings** (requires `settings.manage`) to update business details, logo and favicon.
8. Save each content or settings change. Data is written to Turso.

## Security notes

- Sessions are signed with `JWT_SECRET`, stored in `HttpOnly`, `SameSite=Lax` cookies, and expire after 12 hours.
- Passwords use Node.js `scrypt` hashes; plaintext passwords are never stored or returned by the API.
- Password reset increments a server-side session version and invalidates the user's prior signed sessions.
- Unsafe requests with a browser `Origin` outside the deployment origin are rejected. If a separately hosted approved frontend is required, set `ALLOWED_ORIGIN` to its exact origin (or a comma-separated allowlist).
- `OPEN_ADMIN_MODE=true` is a local/development recovery option only. The function refuses this bypass when Vercel is in the Production environment.
- Do not put Owner credentials, Turso tokens, Blob tokens, or `JWT_SECRET` in source code, GitHub, screenshots, or client-side JavaScript.

## Important root layout

These files must be placed directly at the Git/Vercel project root:

```text
api/[...path].mjs
api/defaults.mjs
admin/index.html
package.json
vercel.json
src/
public/
```

The supplied deployment ZIP has **no enclosing project folder**. Extract its contents directly into the repository root before committing or uploading.

### If `/admin` or `/api/health` returns 404

1. Confirm the files above are at the repository root, not inside an extra extracted folder.
2. Confirm Vercel's Root Directory is blank or `./`.
3. Confirm the deployment is from the branch/commit containing `api/[...path].mjs` and `vercel.json`.
4. Redeploy that commit with the build cache cleared.
5. Check Vercel Function logs for missing Turso environment variables.

## Git hygiene

`.gitignore` excludes generated Vite output, `node_modules`, local `.env` files, local SQLite files, and uploaded media. Commit the source files and `.env.example`, but never real secrets or generated database files.
