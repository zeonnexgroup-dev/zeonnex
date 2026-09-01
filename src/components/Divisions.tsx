import { motion } from "framer-motion";
import TiltCard from "./TiltCard";
import Icon from "./Icon";
import { useSiteContent } from "../context/SiteContentContext";

export default function Divisions() {
  const { content } = useSiteContent();

  return (
    <section id="divisions" className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50/60 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">{content.divisionOverview.eyebrow}</span>
          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">{content.divisionOverview.title}</h2>
          <p className="mt-4 text-slate-600">{content.divisionOverview.description}</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {content.divisions.map((division, index) => (
            <motion.div
              key={division.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="[perspective:1200px]"
            >
              <TiltCard className="h-full rounded-3xl">
                <a
                  href={`#${division.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-900/5 transition-shadow hover:shadow-2xl hover:shadow-blue-900/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={division.image}
                      alt={division.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/10 to-transparent" />
                    <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-blue-600 shadow-lg backdrop-blur">
                      <Icon name={division.icon} className="h-6 w-6" />
                    </span>
                    <p className="absolute bottom-4 left-4 text-xs font-bold uppercase tracking-widest text-blue-200">
                      {division.tag}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-black text-slate-900">{division.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{division.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-blue-600">
                      Learn more <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </a>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
