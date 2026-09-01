import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_PAGE_BUILDER, type PageBuilderData } from "../page-builder/types";

interface BuilderContextValue {
  builder: PageBuilderData;
  siteSettings: Record<string, unknown>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

function mergeBuilder(candidate: unknown): PageBuilderData {
  if (!candidate || typeof candidate !== "object") return DEFAULT_PAGE_BUILDER;
  const value = candidate as Partial<PageBuilderData>;
  return {
    homepage: {
      ...DEFAULT_PAGE_BUILDER.homepage,
      ...value.homepage,
      blocks: value.homepage?.blocks ?? DEFAULT_PAGE_BUILDER.homepage.blocks,
    },
    pages: value.pages ?? [],
  };
}

export function PageBuilderProvider({ children }: { children: ReactNode }) {
  const [builder, setBuilder] = useState<PageBuilderData>(DEFAULT_PAGE_BUILDER);
  const [siteSettings, setSiteSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const response = await fetch("/api/public/content");
      const payload = await response.json();
      if (response.ok) {
        setBuilder(mergeBuilder(payload.pageBuilder));
        if (payload.siteSettings && typeof payload.siteSettings === "object") setSiteSettings(payload.siteSettings as Record<string, unknown>);
      }
    } catch {
      setBuilder(DEFAULT_PAGE_BUILDER);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);
  return <BuilderContext.Provider value={{ builder, siteSettings, loading, refresh }}>{children}</BuilderContext.Provider>;
}

export function usePageBuilder() {
  const context = useContext(BuilderContext);
  if (!context) throw new Error("usePageBuilder must be used inside PageBuilderProvider.");
  return context;
}
