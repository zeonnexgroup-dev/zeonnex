import { motion } from "framer-motion";
import Icon from "./Icon";
import { useSiteContent } from "../context/SiteContentContext";

export default function Industries() {
  const { content } = useSiteContent();

  return (
    <section className="relative bg-blue-50/60 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">{content.industriesOverview.eyebrow}</span>
          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">{content.industriesOverview.title}</h2>
          <p className="mt-4 text-slate-600">{content.industriesOverview.description}</p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {content.industries.map((industry, index) => (
            <motion.div
              key={industry.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              whileHover={{ y: -6 }}
              className="group flex flex-col items-center gap-4 rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-md shadow-blue-900/5 transition-shadow hover:shadow-xl hover:shadow-blue-900/10"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-sky-400 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110 group-hover:rotate-6">
                <Icon name={industry.icon} className="h-7 w-7" />
              </span>
              <p className="text-sm font-bold text-slate-800">{industry.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
