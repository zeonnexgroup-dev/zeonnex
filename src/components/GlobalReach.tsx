import { motion } from "framer-motion";
import { useSiteContent } from "../context/SiteContentContext";

export default function GlobalReach() {
  const { content } = useSiteContent();
  const { globalReach } = content;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 to-blue-900 py-24 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_35%)]"
      />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-300">{globalReach.eyebrow}</span>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{globalReach.title}</h2>
            <p className="mt-5 leading-relaxed text-blue-100/90">{globalReach.description}</p>

            <div className="mt-8 space-y-4">
              {globalReach.hubs.map((hub, index) => (
                <motion.div
                  key={hub.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-sky-300 text-sm font-black text-blue-950">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold">{hub.name}</p>
                    <p className="text-sm text-blue-100/80">{hub.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto aspect-square w-full max-w-md [perspective:1200px]"
            aria-label={`${content.settings.companyName} connects ${globalReach.hubs.map((hub) => hub.name).join(", ")}`}
            role="img"
          >
            <div
              className="relative h-full w-full rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_30%,rgba(96,165,250,0.35),rgba(15,45,110,0.1)_60%)] shadow-2xl"
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-4 rounded-full border border-dashed border-blue-300/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                aria-hidden="true"
                className="absolute inset-10 rounded-full border border-blue-300/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <div aria-hidden="true" className="absolute inset-[21%] rounded-full border border-blue-200/15" />
              <div aria-hidden="true" className="absolute left-1/2 top-[13%] h-[74%] w-px bg-blue-200/15" />
              <div aria-hidden="true" className="absolute left-[13%] top-1/2 h-px w-[74%] bg-blue-200/15" />
              {globalReach.hubs.map((hub, index) => (
                <motion.span
                  key={hub.name}
                  aria-hidden="true"
                  className="absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sky-300 shadow-[0_0_20px_6px_rgba(125,211,252,0.5)]"
                  style={{ top: hub.top, left: hub.left }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
                >
                  <span className="absolute -top-7 whitespace-nowrap rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-blue-800 shadow">
                    {hub.name}
                  </span>
                </motion.span>
              ))}
              <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-lg">🌐</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
