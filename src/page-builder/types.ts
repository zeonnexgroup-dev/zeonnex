import defaultBuilder from "../../data/page-builder-default.json";

export type BlockType =
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
  type: BlockType;
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

export interface PageBuilderData {
  homepage: BuilderPage;
  pages: BuilderPage[];
}

export const DEFAULT_PAGE_BUILDER = defaultBuilder as PageBuilderData;
