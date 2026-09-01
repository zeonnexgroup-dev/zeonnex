import { useEffect } from "react";
import { usePageBuilder } from "../context/PageBuilderContext";

/** Keeps browser-tab branding in sync with Site settings without page reloads. */
export default function BrandHead() {
  const { siteSettings } = usePageBuilder();
  const favicon = typeof siteSettings.favicon === "string" && siteSettings.favicon ? siteSettings.favicon : "/images/logo.png";
  const companyName = typeof siteSettings.companyName === "string" && siteSettings.companyName ? siteSettings.companyName : "Zeonnex Group";

  useEffect(() => {
    let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = favicon;
    document.title = `${companyName} | Vision. Value. Versatility.`;
  }, [companyName, favicon]);

  return null;
}
