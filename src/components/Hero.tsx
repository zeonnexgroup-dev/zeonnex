import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";
import FloatingShapes from "./FloatingShapes";
import TiltCard from "./TiltCard";
import { useSiteContent } from "../context/SiteContentContext";

export default function Hero() {
  const { content } = useSiteContent();
  const { hero } = content;

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white pb-20 pt-32 lg:pb-28 lg:pt-40"
    >
      <FloatingShapes variant="hero" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600">
            {hero.badge}
          </span>
          <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {hero.headingPrefix}
            <span className="block bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400 bg-clip-text text-transparent">
              {hero.headingHighlight}
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">{hero.description}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href={hero.primaryCtaHref}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {hero.primaryCtaLabel}
              <HiArrowRight className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={hero.secondaryCtaHref}
              className="inline-flex items-center gap-2 rounded-full border-2 border-blue-200 bg-white px-7 py-3.5 text-sm font-bold text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {hero.secondaryCtaLabel}
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
            {hero.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-black text-blue-700 sm:text-3xl">
                  {stat.value}
                  <span className="text-blue-400">{stat.suffix}</span>
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative [perspective:1500px]"
        >
          <TiltCard className="rounded-[2rem]">
            <div className="relative overflow-hidden rounded-[2rem] border border-white shadow-2xl shadow-blue-900/20">
              <img
                src={hero.image}
                alt="Consulting meeting with Zeonnex Group experts"
                className="h-[420px] w-full object-cover sm:h-[500px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 via-blue-900/0 to-transparent" />
            </div>
          </TiltCard>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ transform: "translateZ(60px)" }}
            className="absolute -left-4 bottom-8 w-56 rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-2xl shadow-blue-900/20 backdrop-blur-md sm:-left-10"
          >
            <p className="text-xs font-semibold text-slate-500">{hero.cardEyebrow}</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{hero.cardTitle}</p>
            <div aria-hidden="true" className="mt-2 flex -space-x-2">
              {["bg-blue-500", "bg-blue-400", "bg-sky-400", "bg-blue-700"].map((color, index) => (
                <span key={index} className={`h-6 w-6 rounded-full border-2 border-white ${color}`} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute -right-2 -top-6 rounded-2xl border border-blue-100 bg-white/90 px-5 py-3 shadow-2xl shadow-blue-900/20 backdrop-blur-md sm:-right-8"
          >
            <p className="text-xl font-black text-blue-700">{hero.transparencyValue}</p>
            <p className="text-[11px] font-medium text-slate-500">{hero.transparencyLabel}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
