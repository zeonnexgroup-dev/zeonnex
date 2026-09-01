export const DEFAULT_BUILDER = {
  homepage: {
    id: "homepage",
    title: "Home page",
    slug: "",
    status: "published",
    showInNavigation: false,
    navigationLabel: "Home",
    blocks: [
      { id: "site-hero", type: "siteHero", label: "Homepage Hero", visible: true, settings: {} },
      { id: "site-about", type: "siteAbout", label: "About Section", visible: true, settings: {} },
      { id: "site-divisions", type: "siteDivisions", label: "Division Overview", visible: true, settings: {} },
      { id: "site-solutions", type: "siteSolutions", label: "Solutions Division", visible: true, settings: {} },
      { id: "site-interior", type: "siteInterior", label: "Interior Division", visible: true, settings: {} },
      { id: "site-trading", type: "siteTrading", label: "Trading Division", visible: true, settings: {} },
      { id: "site-industries", type: "siteIndustries", label: "Industries", visible: true, settings: {} },
      { id: "site-global", type: "siteGlobalReach", label: "Global Reach", visible: true, settings: {} },
      { id: "site-testimonials", type: "siteTestimonials", label: "Testimonials", visible: true, settings: {} },
      { id: "site-contact", type: "siteContact", label: "Contact", visible: true, settings: {} },
    ],
  },
  pages: [],
};

export const DEFAULT_SITE_SETTINGS = {
  companyName: "Zeonnex Group",
  contactEmail: "info@zeonnex.com",
  contactPhone: "+974 4400 0000",
  address: "Doha, Qatar",
  navbarLogo: "/images/logo-wide.png",
  favicon: "/images/logo.png",
};

export const ROLE_SEEDS = [
  ["Owner", "Full control of the secure workspace, users, roles and permissions.", "#7c3aed"],
  ["Admin", "Manages content, media, enquiries, settings and team users.", "#2563eb"],
  ["Content Editor", "Creates, edits and publishes website content and media.", "#059669"],
  ["Sales Manager", "Reviews and manages incoming contact enquiries.", "#d97706"],
  ["Viewer", "Read-only dashboard access.", "#64748b"],
];

export const PERMISSION_SEEDS = [
  ["dashboard.view", "View dashboard", "Dashboard"],
  ["content.edit", "Edit website content", "Content"],
  ["pages.publish", "Publish pages", "Content"],
  ["media.manage", "Manage media library", "Media"],
  ["enquiries.manage", "Manage enquiries", "Sales"],
  ["users.manage", "Manage users", "Access"],
  ["roles.manage", "Manage roles and permissions", "Access"],
  ["settings.manage", "Manage site settings", "System"],
];
