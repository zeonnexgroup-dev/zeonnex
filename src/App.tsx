import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageBuilderRenderer from "./components/PageBuilderRenderer";
import BrandHead from "./components/BrandHead";
import { PageBuilderProvider, usePageBuilder } from "./context/PageBuilderContext";
import { SiteContentProvider } from "./context/SiteContentContext";

// Keep the large admin workspace out of the public-site bundle. This also makes
// the public homepage resilient if an admin-only feature is being updated.
const AdminGate = lazy(() => import("./admin/AdminGate"));

function NotFound() {
  return <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Zeonnex Group</p><h1 className="mt-3 text-4xl font-black text-slate-900">This page is not available.</h1><p className="mt-3 text-slate-500">It may still be a draft or the address may have changed.</p><a href="/" className="mt-7 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white">Back to homepage</a></div></div>;
}

function Site() {
  const { builder, loading } = usePageBuilder();
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const customSlug = pathname.startsWith("/pages/") ? decodeURIComponent(pathname.slice("/pages/".length)) : null;
  const page = customSlug ? builder.pages.find((item) => item.slug === customSlug && item.status === "published") : builder.homepage;

  if (customSlug && loading) return <div className="flex min-h-screen items-center justify-center bg-white text-sm font-bold text-slate-500">Loading page…</div>;
  if (!page || (pathname !== "/" && !customSlug)) return <NotFound />;

  const innerPage = Boolean(customSlug);
  return <div className="min-h-screen bg-white font-sans text-slate-900 antialiased"><Navbar pages={builder.pages} innerPage={innerPage} /><main><PageBuilderRenderer page={page} /></main><Footer pages={builder.pages} innerPage={innerPage} /></div>;
}

function AppContents() {
  if (window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/")) {
    return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-bold text-slate-500">Opening Zeonnex workspace…</div>}><AdminGate /></Suspense>;
  }
  return <Site />;
}

export default function App() {
  return <SiteContentProvider><PageBuilderProvider><BrandHead /><AppContents /></PageBuilderProvider></SiteContentProvider>;
}
