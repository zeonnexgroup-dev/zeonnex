import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "../data/content";

interface SiteContentContextValue {
  content: SiteContent;
  loading: boolean;
  refreshContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

function mergeWithDefaults(candidate: unknown): SiteContent {
  if (!candidate || typeof candidate !== "object") return DEFAULT_SITE_CONTENT;
  const incoming = candidate as Partial<SiteContent>;

  return {
    ...DEFAULT_SITE_CONTENT,
    ...incoming,
    settings: { ...DEFAULT_SITE_CONTENT.settings, ...incoming.settings },
    divisionOverview: { ...DEFAULT_SITE_CONTENT.divisionOverview, ...incoming.divisionOverview },
    industriesOverview: { ...DEFAULT_SITE_CONTENT.industriesOverview, ...incoming.industriesOverview },
    testimonialsOverview: { ...DEFAULT_SITE_CONTENT.testimonialsOverview, ...incoming.testimonialsOverview },
    ui: { ...DEFAULT_SITE_CONTENT.ui, ...incoming.ui },
    hero: { ...DEFAULT_SITE_CONTENT.hero, ...incoming.hero },
    about: { ...DEFAULT_SITE_CONTENT.about, ...incoming.about },
    globalReach: { ...DEFAULT_SITE_CONTENT.globalReach, ...incoming.globalReach },
    contact: { ...DEFAULT_SITE_CONTENT.contact, ...incoming.contact },
    pageBuilder: {
      ...DEFAULT_SITE_CONTENT.pageBuilder,
      ...incoming.pageBuilder,
      homepage: {
        ...DEFAULT_SITE_CONTENT.pageBuilder.homepage,
        ...incoming.pageBuilder?.homepage,
        blocks: incoming.pageBuilder?.homepage?.blocks ?? DEFAULT_SITE_CONTENT.pageBuilder.homepage.blocks,
      },
      pages: incoming.pageBuilder?.pages ?? DEFAULT_SITE_CONTENT.pageBuilder.pages,
    },
    footer: { ...DEFAULT_SITE_CONTENT.footer, ...incoming.footer },
    navigation: incoming.navigation ?? DEFAULT_SITE_CONTENT.navigation,
    divisions: incoming.divisions ?? DEFAULT_SITE_CONTENT.divisions,
    industries: incoming.industries ?? DEFAULT_SITE_CONTENT.industries,
    testimonials: incoming.testimonials ?? DEFAULT_SITE_CONTENT.testimonials,
  } as SiteContent;
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  const refreshContent = async () => {
    try {
      const response = await fetch("/api/public/content");
      if (!response.ok) throw new Error("Could not load published content.");
      const payload = (await response.json()) as { content?: unknown };
      setContent(mergeWithDefaults(payload.content));
    } catch {
      // The marketing site keeps its built-in content if the admin API is offline.
      setContent(DEFAULT_SITE_CONTENT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshContent();
  }, []);

  const value = useMemo(() => ({ content, loading, refreshContent }), [content, loading]);
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) throw new Error("useSiteContent must be used inside SiteContentProvider.");
  return context;
}
