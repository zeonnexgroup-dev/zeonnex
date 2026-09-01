import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineChatAlt2,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
} from "react-icons/hi";
import FloatingShapes from "./FloatingShapes";
import { CONTACT } from "../data/content";
import { usePageBuilder } from "../context/PageBuilderContext";

export default function Contact({ content = {} }: { content?: Record<string, unknown> }) {
  const { siteSettings } = usePageBuilder();
  const contentText = (key: string, fallback: string) => typeof content[key] === "string" && content[key] ? content[key] as string : fallback;
  const email = typeof siteSettings.contactEmail === "string" && siteSettings.contactEmail ? siteSettings.contactEmail : CONTACT.email;
  const phone = typeof siteSettings.contactPhone === "string" && siteSettings.contactPhone ? siteSettings.contactPhone : CONTACT.phone;
  const address = typeof siteSettings.address === "string" && siteSettings.address ? siteSettings.address : CONTACT.address;
  const contactItems = [
    { icon: HiOutlineMail, label: "Email", value: email, href: `mailto:${email}` },
    { icon: HiOutlinePhone, label: "Phone / WhatsApp", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: HiOutlineLocationMarker, label: "Address", value: address },
    { icon: HiOutlineChatAlt2, label: "Website", value: CONTACT.website, href: `https://${CONTACT.website}` },
  ];
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSubmitting(true);
    setError("");
    setSent(false);
    try {
      const response = await fetch("/api/public/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.get("fullName"),
          email: values.get("email"),
          enquiryType: values.get("enquiryType"),
          message: values.get("message"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "We could not send your enquiry. Please try again.");
      form.reset();
      setSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not send your enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 to-white py-24">
      <FloatingShapes variant="section" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">{contentText("eyebrow", "Get In Touch")}</span>
          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
            {contentText("title", "Let's Build Something Exceptional. Together.")}
          </h2>
          <p className="mt-4 text-slate-600">
            {contentText("description", "Whether you’re sourcing a product, upgrading your technology, or designing a space — Zeonnex Group brings vision, value, and versatility to every partnership.")}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-5 lg:col-span-2"
          >
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 text-white shadow-md shadow-blue-500/30">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</span>
                    <span className="mt-1 block text-sm font-bold text-slate-800">{item.value}</span>
                  </span>
                </>
              );

              const className = "flex items-start gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-md shadow-blue-900/5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg";

              return item.href ? (
                <a key={item.label} href={item.href} className={className}>
                  {content}
                </a>
              ) : (
                <div key={item.label} className={className}>
                  {content}
                </div>
              );
            })}
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/10 sm:p-8 lg:col-span-3"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="sr-only" htmlFor="full-name">Full name</label>
              <input
                id="full-name"
                name="fullName"
                required
                autoComplete="name"
                placeholder="Full Name"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-100"
              />
              <label className="sr-only" htmlFor="email-address">Email address</label>
              <input
                id="email-address"
                name="email"
                required
                type="email"
                autoComplete="email"
                placeholder="Email Address"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-100"
              />
            </div>
            <label className="sr-only" htmlFor="enquiry-type">Type of enquiry</label>
            <select
              id="enquiry-type"
              name="enquiryType"
              defaultValue="Zeonnex Solutions — IT & Business Products"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-100"
            >
              <option>Zeonnex Solutions — IT &amp; Business Products</option>
              <option>Zeonnex Interior — Design &amp; Fit-outs</option>
              <option>Zeonnex Hub — Import, Export &amp; Sourcing</option>
              <option>General Enquiry</option>
            </select>
            <label className="sr-only" htmlFor="message">Tell us about your requirement</label>
            <textarea
              id="message"
              name="message"
              required
              placeholder="Tell us about your requirement..."
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-3 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-blue-700 to-blue-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
              {submitting ? "Sending…" : sent ? "Send another enquiry" : contentText("buttonLabel", "Send Enquiry")}
            </button>
            {sent && <p className="text-center text-xs font-medium text-emerald-600" role="status">Your enquiry has been received. We&apos;ll get back to you shortly.</p>}
            {error && <p className="text-center text-xs font-medium text-red-600" role="alert">{error}</p>}
          </motion.form>
        </div>
      </div>
    </section>
  );
}
