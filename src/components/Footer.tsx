import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { CONTACT, DIVISIONS, NAV_LINKS } from "../data/content";
import { usePageBuilder } from "../context/PageBuilderContext";
import type { BuilderPage } from "../page-builder/types";

const socialLinks = [
  { icon: FaFacebookF, label: "Facebook" },
  { icon: FaInstagram, label: "Instagram" },
  { icon: FaLinkedinIn, label: "LinkedIn" },
  { icon: FaWhatsapp, label: "WhatsApp" },
];

export default function Footer({ pages = [], innerPage = false }: { pages?: BuilderPage[]; innerPage?: boolean }) {
  const { siteSettings } = usePageBuilder();
  const links = [
    ...NAV_LINKS.map((link) => ({ ...link, href: innerPage ? `/${link.href}` : link.href })),
    ...pages.filter((page) => page.status === "published" && page.showInNavigation && page.slug).map((page) => ({ href: `/pages/${page.slug}`, label: page.navigationLabel || page.title })),
  ];
  const companyName = typeof siteSettings.companyName === "string" && siteSettings.companyName ? siteSettings.companyName : "Zeonnex Group";
  const logo = typeof siteSettings.navbarLogo === "string" && siteSettings.navbarLogo ? siteSettings.navbarLogo : "/images/logo-wide.png";
  const email = typeof siteSettings.contactEmail === "string" && siteSettings.contactEmail ? siteSettings.contactEmail : CONTACT.email;
  const phone = typeof siteSettings.contactPhone === "string" && siteSettings.contactPhone ? siteSettings.contactPhone : CONTACT.phone;
  const address = typeof siteSettings.address === "string" && siteSettings.address ? siteSettings.address : CONTACT.address;
  return (
    <footer className="relative bg-blue-950 pt-16 text-blue-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#home" className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white p-0.5 shadow-lg shadow-black/15">
                <img src={logo} alt={`${companyName} logo`} className="h-full w-full object-contain" />
              </span>
              <span>
                <span className="block text-lg font-black tracking-[0.1em] text-white">ZEONNEX</span>
                <span className="mt-0.5 block text-[9px] font-bold tracking-[0.35em] text-blue-300">GROUP</span>
              </span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-blue-200/80">
              A future-ready enterprise delivering excellence in IT solutions, interior
              design, and global import-export consulting &amp; sourcing.
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#contact"
                  aria-label={`${label} — contact Zeonnex Group`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-white">Quick Links</p>
            <ul className="mt-4 space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-blue-200/80 transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-white">Our Divisions</p>
            <ul className="mt-4 space-y-2.5">
              {DIVISIONS.map((division) => (
                <li key={division.id}>
                  <a href={innerPage ? `/#${division.id}` : `#${division.id}`} className="text-sm text-blue-200/80 transition-colors hover:text-white">
                    {division.tag}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-white">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-blue-200/80">
              <li><a href={`mailto:${email}`} className="transition-colors hover:text-white">{email}</a></li>
              <li><a href={`tel:${phone.replace(/\s/g, "")}`} className="transition-colors hover:text-white">{phone}</a></li>
              <li>{address}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-blue-300/70 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
          <p>Designed with vision, value &amp; versatility.</p>
        </div>
      </div>
    </footer>
  );
}
