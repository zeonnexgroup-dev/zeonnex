import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { HiArrowPath, HiLockClosed, HiOutlineShieldCheck } from "react-icons/hi2";
import AdminApp from "./AdminApp";

export interface AdminSessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

type GateState = "checking" | "signin" | "unavailable" | "ready";

export default function AdminGate() {
  const [state, setState] = useState<GateState>("checking");
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [serviceMessage, setServiceMessage] = useState("");

  const checkSession = async () => {
    setState("checking");
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.user) {
        setUser(payload.user as AdminSessionUser);
        setState("ready");
        return;
      }
      if (response.status === 401) {
        setUser(null);
        setState("signin");
        return;
      }
      setServiceMessage(payload.message || "The admin service is not available yet.");
      setState("unavailable");
    } catch {
      setServiceMessage("The admin service could not be reached. Check the Vercel function deployment and environment variables.");
      setState("unavailable");
    }
  };

  useEffect(() => { void checkSession(); }, []);

  const signOut = async () => {
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch { /* local state still clears */ }
    setUser(null);
    setState("signin");
  };

  if (state === "checking") return <FullScreen><HiArrowPath className="mx-auto h-8 w-8 animate-spin text-blue-500" /><p className="mt-4 text-sm font-bold text-slate-600">Checking secure workspace access…</p></FullScreen>;
  if (state === "unavailable") return <Unavailable message={serviceMessage} onRetry={checkSession} />;
  if (state === "signin") return <SignIn onSignedIn={(nextUser) => { setUser(nextUser); setState("ready"); }} onUnavailable={(message) => { setServiceMessage(message); setState("unavailable"); }} />;
  return <AdminApp user={user!} onLogout={signOut} />;
}

function FullScreen({ children }: { children: ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">{children}</main>;
}

function Unavailable({ message, onRetry }: { message: string; onRetry: () => Promise<void> }) {
  return <FullScreen><section className="max-w-lg rounded-3xl border border-amber-100 bg-white p-8 shadow-xl shadow-slate-900/5"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><HiOutlineShieldCheck className="h-6 w-6" /></span><p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-amber-600">Admin setup required</p><h1 className="mt-2 text-2xl font-black text-slate-900">The secure admin service needs configuration.</h1><p className="mt-4 text-sm leading-relaxed text-slate-600">{message}</p><p className="mt-4 text-xs leading-relaxed text-slate-500">Add the Turso and JWT environment variables in Vercel, then redeploy. See the project README for the exact names.</p><button type="button" onClick={() => void onRetry()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white"><HiArrowPath className="h-4 w-4" />Try again</button></section></FullScreen>;
}

function SignIn({ onSignedIn, onUnavailable }: { onSignedIn: (user: AdminSessionUser) => void; onUnavailable: (message: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const payload = await response.json().catch(() => ({}));
      if (response.status === 503) { onUnavailable(payload.message || "The secure admin service needs configuration."); return; }
      if (!response.ok || !payload.user) throw new Error(payload.message || "We could not sign you in.");
      onSignedIn(payload.user as AdminSessionUser);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not sign you in.");
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-5 py-12 text-white"><div aria-hidden="true" className="absolute -left-24 top-0 h-[32rem] w-[32rem] rounded-full bg-blue-600/30 blur-3xl" /><div aria-hidden="true" className="absolute -bottom-40 -right-24 h-[36rem] w-[36rem] rounded-full bg-sky-500/20 blur-3xl" /><section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/95 shadow-2xl shadow-black/40 lg:grid-cols-[0.95fr_1.05fr]"><div className="hidden bg-gradient-to-br from-blue-800 via-blue-700 to-sky-600 p-10 lg:block"><a href="/" className="inline-flex items-center gap-3 rounded-xl"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-0.5 shadow-lg shadow-blue-950/20"><img src="/images/logo-wide.png" alt="Zeonnex Group" className="h-full w-full object-contain" /></span><span><span className="block text-lg font-black tracking-[0.14em]">ZEONNEX</span><span className="mt-1 block text-[9px] font-bold tracking-[0.32em] text-blue-100">ADMIN CONSOLE</span></span></a><div className="mt-24"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10"><HiOutlineShieldCheck className="h-6 w-6" /></span><h1 className="mt-6 text-4xl font-black leading-tight">Your business, securely in your control.</h1><p className="mt-5 max-w-sm text-sm leading-relaxed text-blue-100">Manage website content, media, enquiries and team permissions from one secure workspace.</p></div></div><section className="p-7 text-slate-900 sm:p-10 lg:p-12"><a href="/" className="inline-flex text-xs font-bold text-blue-700 hover:text-blue-900 lg:hidden">← Back to public website</a><p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-blue-600 lg:mt-0">Secure access</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Sign in to your workspace</h2><p className="mt-3 text-sm leading-relaxed text-slate-500">Use the Owner or team account created in the admin environment settings.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="block"><span className="text-sm font-bold text-slate-700">Email address</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@company.com" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" /></label><label className="block"><span className="text-sm font-bold text-slate-700">Password</span><input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="••••••••••••" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" /></label>{error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}<button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 disabled:cursor-wait disabled:opacity-70"><HiLockClosed className="h-4 w-4" />{submitting ? "Signing in…" : "Sign in securely"}</button></form><p className="mt-7 text-center text-xs text-slate-400">Protected by signed, HttpOnly sessions and role-based access control.</p></section></section></main>;
}
