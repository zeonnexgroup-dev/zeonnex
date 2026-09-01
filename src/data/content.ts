import defaultContent from "../../data/default-content.json";

export interface PermissionLikeContent {
  title: string;
  description: string;
  icon: string;
}

export type BuilderBlockType =
  | "siteHero"
  | "siteAbout"
  | "siteDivisions"
  | "siteSolutions"
  | "siteInterior"
  | "siteTrading"
  | "siteIndustries"
  | "siteGlobalReach"
  | "siteTestimonials"
  | "siteContact"
  | "hero"
  | "text"
  | "image"
  | "services"
  | "features"
  | "cta"
  | "gallery"
  | "testimonials"
  | "contact"
  | "faq";

export interface BuilderBlock {
  id: string;
  type: BuilderBlockType;
  label: string;
  visible: boolean;
  settings: Record<string, unknown>;
}

export interface BuilderPage {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  showInNavigation: boolean;
  navigationLabel: string;
  blocks: BuilderBlock[];
}

export interface SiteContent {
  settings: {
    companyName: string;
    brandName: string;
    brandSuffix: string;
    logo: string;
    tagline: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    website: string;
  };
  navigation: { label: string; href: string }[];
  divisionOverview: {
    eyebrow: string;
    title: string;
    description: string;
  };
  industriesOverview: {
    eyebrow: string;
    title: string;
    description: string;
  };
  testimonialsOverview: {
    eyebrow: string;
    title: string;
  };
  ui: {
    letsTalkLabel: string;
    bookConsultationLabel: string;
    learnMoreLabel: string;
    consultationLabel: string;
    quickLinksLabel: string;
    divisionsFooterLabel: string;
    footerContactLabel: string;
    adminLoginLabel: string;
  };
  hero: {
    badge: string;
    headingPrefix: string;
    headingHighlight: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    image: string;
    cardEyebrow: string;
    cardTitle: string;
    transparencyValue: string;
    transparencyLabel: string;
    stats: { value: string; suffix: string; label: string }[];
  };
  about: {
    eyebrow: string;
    title: string;
    paragraphOne: string;
    paragraphTwo: string;
    image: string;
    experienceValue: string;
    experienceLabel: string;
    whyUs: PermissionLikeContent[];
  };
  divisions: {
    id: string;
    tag: string;
    title: string;
    description: string;
    image: string;
    secondaryImage: string;
    icon: string;
    tint: "light" | "dark";
    services: string[];
  }[];
  industries: { title: string; icon: string }[];
  globalReach: {
    eyebrow: string;
    title: string;
    description: string;
    hubs: { name: string; desc: string; top: string; left: string }[];
  };
  testimonials: { name: string; role: string; quote: string }[];
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    enquiryOptions: string[];
  };
  pageBuilder: {
    homepage: BuilderPage;
    pages: BuilderPage[];
  };
  footer: {
    description: string;
    tagline: string;
  };
}

export const DEFAULT_SITE_CONTENT = defaultContent as SiteContent;

// These exports maintain compatibility for components that use the default fallback data.
export const NAV_LINKS = DEFAULT_SITE_CONTENT.navigation;
export const DIVISIONS = DEFAULT_SITE_CONTENT.divisions;
export const INDUSTRIES = DEFAULT_SITE_CONTENT.industries;
export const STATS = DEFAULT_SITE_CONTENT.hero.stats;
export const WHY_US = DEFAULT_SITE_CONTENT.about.whyUs;
export const TESTIMONIALS = DEFAULT_SITE_CONTENT.testimonials;
export const CONTACT = DEFAULT_SITE_CONTENT.settings;
