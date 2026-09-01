import { HiCheckCircle, HiMiniStar } from "react-icons/hi2";
import type { BuilderBlock, BuilderPage } from "../page-builder/types";
import Hero from "./Hero";
import About from "./About";
import Divisions from "./Divisions";
import SolutionsSection from "./SolutionsSection";
import InteriorSection from "./InteriorSection";
import TradingSection from "./TradingSection";
import Industries from "./Industries";
import GlobalReach from "./GlobalReach";
import Testimonials from "./Testimonials";
import Contact from "./Contact";
import Icon from "./Icon";

type Item = Record<string, unknown>;
const text = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;
const items = (value: unknown): Item[] => Array.isArray(value) ? value.filter((item): item is Item => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : [];

function Heading({ eyebrow, title, description, dark = false }: { eyebrow?: string; title?: string; description?: string; dark?: boolean }) {
  return <div className="mx-auto max-w-2xl text-center">{eyebrow && <span className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-blue-200" : "text-blue-600"}`}>{eyebrow}</span>}{title && <h2 className={`mt-3 text-3xl font-black sm:text-4xl ${dark ? "text-white" : "text-slate-900"}`}>{title}</h2>}{description && <p className={`mt-4 leading-relaxed ${dark ? "text-blue-100/90" : "text-slate-600"}`}>{description}</p>}</div>;
}

function GenericBlock({ block }: { block: BuilderBlock }) {
  const s = block.settings;
  const sectionId = ({ "site-hero": "home", "site-about": "about", "site-divisions": "divisions", "site-solutions": "solutions", "site-interior": "interior", "site-trading": "trading", "site-contact": "contact" } as Record<string, string>)[block.id] ?? block.id;
  const title = text(s.title);
  const description = text(s.description);
  const eyebrow = text(s.eyebrow);

  if (block.type === "hero") return <section id={sectionId} className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white pb-20 pt-32 lg:pt-40"><div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10"><div><span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600">{eyebrow}</span><h1 className="mt-6 text-4xl font-black leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">{title}</h1><p className="mt-6 text-lg leading-relaxed text-slate-600">{description}</p><div className="mt-8 flex flex-wrap gap-3"><a href={text(s.primaryHref, "#contact")} className="rounded-full bg-gradient-to-r from-blue-700 to-blue-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/30">{text(s.primaryLabel, "Get started")}</a>{text(s.secondaryLabel) && <a href={text(s.secondaryHref, "#contact")} className="rounded-full border-2 border-blue-200 bg-white px-7 py-3.5 text-sm font-bold text-blue-700">{text(s.secondaryLabel)}</a>}</div></div>{text(s.image) && <img src={text(s.image)} alt={text(s.imageAlt, title)} className="h-[380px] w-full rounded-[2rem] object-cover shadow-2xl shadow-blue-900/20 sm:h-[500px]" />}</div></section>;

  if (block.type === "text") return <section id={sectionId} className="bg-white py-24"><div className="mx-auto max-w-4xl px-6 lg:px-10"><Heading eyebrow={eyebrow} title={title} description={description} /><div className="mx-auto mt-8 max-w-3xl whitespace-pre-line text-base leading-8 text-slate-600">{text(s.body)}</div></div></section>;

  if (block.type === "image") return <section id={sectionId} className="bg-blue-50/60 py-24"><div className="mx-auto max-w-6xl px-6 lg:px-10"><Heading eyebrow={eyebrow} title={title} description={description} />{text(s.image) && <figure className="mt-10 overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-900/10"><img src={text(s.image)} alt={text(s.alt, title)} className="max-h-[650px] w-full object-cover" />{text(s.caption) && <figcaption className="px-5 py-4 text-center text-sm text-slate-500">{text(s.caption)}</figcaption>}</figure>}</div></section>;

  if (block.type === "services" || block.type === "features") {
    const dark = block.type === "features";
    return <section id={sectionId} className={dark ? "bg-blue-950 py-24" : "bg-white py-24"}><div className="mx-auto max-w-7xl px-6 lg:px-10"><Heading eyebrow={eyebrow} title={title} description={description} dark={dark} /><div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items(s.items).map((item, index) => <article key={index} className={`rounded-3xl border p-6 ${dark ? "border-white/10 bg-white/5" : "border-blue-100 bg-blue-50/40"}`}><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-sky-400 text-white"><Icon name={text(item.icon, "sparkles")} className="h-6 w-6" /></span><h3 className={`mt-5 text-lg font-black ${dark ? "text-white" : "text-slate-900"}`}>{text(item.title)}</h3><p className={`mt-3 text-sm leading-relaxed ${dark ? "text-blue-100/80" : "text-slate-600"}`}>{text(item.description)}</p></article>)}</div></div></section>;
  }

  if (block.type === "cta") return <section id={sectionId} className="bg-gradient-to-br from-blue-800 via-blue-700 to-sky-600 py-24 text-white"><div className="mx-auto max-w-4xl px-6 text-center"><Heading eyebrow={eyebrow} title={title} description={description} dark /><a href={text(s.buttonHref, "#contact")} className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-bold text-blue-800 shadow-xl">{text(s.buttonLabel, "Contact us")}</a></div></section>;

  if (block.type === "contact") return <Contact content={s} />;

  if (block.type === "gallery") return <section id={sectionId} className="bg-white py-24"><div className="mx-auto max-w-7xl px-6 lg:px-10"><Heading eyebrow={eyebrow} title={title} description={description} /><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items(s.images).map((image, index) => text(image.src) && <figure key={index} className="overflow-hidden rounded-3xl bg-slate-100"><img src={text(image.src)} alt={text(image.alt, "Gallery image")} className="h-72 w-full object-cover" />{text(image.caption) && <figcaption className="px-4 py-3 text-sm text-slate-600">{text(image.caption)}</figcaption>}</figure>)}</div></div></section>;

  if (block.type === "testimonials") return <section id={sectionId} className="bg-blue-50/60 py-24"><div className="mx-auto max-w-7xl px-6 lg:px-10"><Heading eyebrow={eyebrow} title={title} description={description} /><div className="mt-12 grid gap-6 md:grid-cols-3">{items(s.items).map((item, index) => <article key={index} className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm"><div className="flex gap-1 text-amber-400">{Array.from({ length: 5 }).map((_, star) => <HiMiniStar key={star} className="h-4 w-4" />)}</div><p className="mt-4 text-sm leading-relaxed text-slate-600">“{text(item.quote)}”</p><p className="mt-6 text-sm font-bold text-slate-900">{text(item.name)}</p><p className="mt-1 text-xs text-slate-500">{text(item.role)}</p></article>)}</div></div></section>;

  if (block.type === "faq") return <section id={sectionId} className="bg-slate-50 py-24"><div className="mx-auto max-w-4xl px-6"><Heading eyebrow={eyebrow} title={title} description={description} /><div className="mt-10 space-y-3">{items(s.items).map((item, index) => <details key={index} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4"><summary className="cursor-pointer list-none text-sm font-bold text-slate-800">{text(item.question)} <span className="float-right text-blue-600">+</span></summary><p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">{text(item.answer)}</p></details>)}</div></div></section>;

  return null;
}

function BuiltInBlock({ block }: { block: BuilderBlock }) {
  const editableCoreType: Partial<Record<BuilderBlock["type"], BuilderBlock["type"]>> = {
    siteHero: "hero", siteAbout: "text", siteDivisions: "services", siteSolutions: "features", siteInterior: "features", siteTrading: "features", siteIndustries: "services", siteGlobalReach: "features", siteTestimonials: "testimonials",
  };
  const replacementType = editableCoreType[block.type];
  // Empty core-block settings preserve the original crafted marketing sections.
  // Once an editor changes a normal field, its no-code replacement is rendered.
  if (replacementType && Object.keys(block.settings).length > 0) return <GenericBlock block={{ ...block, type: replacementType }} />;
  switch (block.type) {
    case "siteHero": return <Hero />;
    case "siteAbout": return <About />;
    case "siteDivisions": return <Divisions />;
    case "siteSolutions": return <SolutionsSection />;
    case "siteInterior": return <InteriorSection />;
    case "siteTrading": return <TradingSection />;
    case "siteIndustries": return <Industries />;
    case "siteGlobalReach": return <GlobalReach />;
    case "siteTestimonials": return <Testimonials />;
    case "siteContact": return <Contact content={block.settings} />;
    default: return <GenericBlock block={block} />;
  }
}

export default function PageBuilderRenderer({ page }: { page: BuilderPage }) {
  return <>{page.blocks.filter((block) => block.visible).map((block) => <BuiltInBlock key={block.id} block={block} />)}</>;
}
