import { motion } from "framer-motion";
import TiltCard from "./TiltCard";
import Icon from "./Icon";
import { useSiteContent } from "../context/SiteContentContext";

export default function About() {
  const { content } = useSiteContent();
  const { about } = content;

  return (
    <section id="about" className="relative bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative [perspective:1400px]"
          >
            <TiltCard className="rounded-3xl">
              <img
                src={about.image}
                alt="Zeonnex Group team collaborating"
                className="h-[380px] w-full rounded-3xl object-cover shadow-2xl shadow-blue-900/20 sm:h-[440px]"
              />
            </TiltCard>
            <div className="absolute -bottom-8 -right-3 hidden w-52 rounded-2xl border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-900/10 sm:block lg:-right-6">
              <p className="text-3xl font-black text-blue-700">{about.experienceValue}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{about.experienceLabel}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">{about.eyebrow}</span>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">{about.title}</h2>
            <p className="mt-5 leading-relaxed text-slate-600">{about.paragraphOne}</p>
            <p className="mt-4 leading-relaxed text-slate-600">{about.paragraphTwo}</p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {about.whyUs.map((item) => (
                <div
                  key={item.title}
                  className="group flex items-start gap-3 rounded-2xl border border-blue-50 bg-blue-50/40 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50"
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 text-white shadow-md shadow-blue-500/30">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
