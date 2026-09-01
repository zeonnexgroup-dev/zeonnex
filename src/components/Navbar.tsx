import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiArrowRight, HiBars3, HiXMark } from "react-icons/hi2";
import { NAV_LINKS } from "../data/content";
import type { BuilderPage } from "../page-builder/types";
import { usePageBuilder } from "../context/PageBuilderContext";

export default function Navbar({ pages = [], innerPage = false }: { pages?: BuilderPage[]; innerPage?: boolean }) {
  const { siteSettings } = usePageBuilder();
  const logo = typeof siteSettings.navbarLogo === "string" && siteSettings.navbarLogo ? siteSettings.navbarLogo : "/images/logo-wide.png";
  const companyName = typeof siteSettings.companyName === "string" && siteSettings.companyName ? siteSettings.companyName : "Zeonnex Group";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const customLinks = pages.filter((page) => page.status === "published" && page.showInNavigation && page.slug).map((page) => ({ href: `/pages/${page.slug}`, label: page.navigationLabel || page.title }));
  const links = [...NAV_LINKS.map((link) => ({ ...link, href: innerPage ? `/${link.href}` : link.href })), ...customLinks];

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 12);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const closeMenu = () => setOpen(false);
  const contactLink = innerPage ? "/#contact" : "#contact";

  return <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-blue-100/80 bg-white/95 py-2 shadow-lg shadow-blue-950/5 backdrop-blur-xl" : "bg-white/75 py-3 backdrop-blur-md"}`}>
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 lg:px-10">
      <a href="/" aria-label={`${companyName} home`} className="group flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
        <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105 sm:h-13 sm:w-13"><img src={logo} alt={`${companyName} logo`} className="h-full w-full object-contain p-0.5" /></span>
        <span className="leading-none"><span className="block text-[15px] font-black tracking-[0.14em] text-slate-950 sm:text-base">ZEONNEX</span><span className="mt-1 block text-[9px] font-bold tracking-[0.3em] text-blue-600 sm:text-[10px]">GROUP</span></span>
      </a>
      <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary navigation">{links.map((link) => <a key={link.href} href={link.href} className="rounded-lg px-2.5 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700">{link.label}</a>)}</nav>
      <div className="flex items-center gap-2"><a href={contactLink} className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-105 lg:inline-flex">Let's Talk <HiArrowRight className="h-3.5 w-3.5" /></a><button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((current) => !current)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-700 shadow-sm transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 xl:hidden">{open ? <HiXMark className="h-5 w-5" /> : <HiBars3 className="h-5 w-5" />}</button></div>
    </div>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="absolute inset-x-0 top-full border-b border-blue-100 bg-white px-6 pb-6 pt-3 shadow-xl shadow-blue-950/10 xl:hidden"><nav className="mx-auto grid max-w-7xl gap-1" aria-label="Mobile navigation">{links.map((link, index) => <motion.a key={link.href} href={link.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.035 }} onClick={closeMenu} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700">{link.label}</motion.a>)}<a href={contactLink} onClick={closeMenu} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25">Book a Consultation <HiArrowRight className="h-4 w-4" /></a></nav></motion.div>}</AnimatePresence>
  </header>;
}
