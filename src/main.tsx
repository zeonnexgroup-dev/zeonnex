import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Zeonnex application error", error, info);
  }

  render() {
    if (this.state.error) {
      return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><section className="max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-slate-900/5"><p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">Preview error</p><h1 className="mt-3 text-2xl font-black text-slate-900">The page could not finish loading.</h1><p className="mt-3 text-sm leading-relaxed text-slate-600">{this.state.error.message || "An unexpected browser error occurred."}</p><button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white">Reload preview</button></section></main>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><AppErrorBoundary><App /></AppErrorBoundary></StrictMode>,
);
