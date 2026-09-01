import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { HiCheckCircle } from "react-icons/hi2";
import TiltCard from "./TiltCard";
import FloatingShapes from "./FloatingShapes";
import Icon from "./Icon";
import { useSiteContent } from "../context/SiteContentContext";

interface DivisionSectionProps {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  secondaryImage: string;
  icon: string;
  services: string[];
  reverse?: boolean;
  tint?: "light" | "dark";
  children?: ReactNode;
}

export default function DivisionSection({
  id,
  tag,
  title,
  description,
  image,
  secondaryImage,
  icon,
  services,
  reverse = false,
  tint = "light",
  children,
}: DivisionSectionProps) {
  const isDark = tint === "dark";
  const { content } = useSiteContent();

  return (
    <section
      id={id}
      className={`relative overflow-hidden py-24 ${
        isDark ? "bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-white" : "bg-white"
      }`}
    >
      <FloatingShapes variant="section" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: reverse ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
            className={`relative [perspective:1400px] ${reverse ? "lg:order-2" : ""}`}
          >
            <TiltCard className="rounded-[1.75rem]">
              <img
                src={image}
                alt={title}
                className="h-[340px] w-full rounded-[1.75rem] object-cover shadow-2xl shadow-blue-900/30 sm:h-[420px]"
              />
            </TiltCard>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className={`absolute -bottom-8 hidden w-48 overflow-hidden rounded-2xl border-4 border-white shadow-2xl sm:block ${
                reverse ? "-left-3 lg:-left-6" : "-right-3 lg:-right-6"
              }`}
            >
              <img src={secondaryImage} alt="" className="h-32 w-full object-cover" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: reverse ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
          >
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${
                isDark ? "bg-white/10 text-blue-200" : "bg-blue-50 text-blue-600"
              }`}
            >
              <Icon name={icon} className="h-4 w-4" />
              {tag}
            </span>
            <h2 className={`mt-4 text-3xl font-black leading-tight sm:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>
              {title}
            </h2>
            <p className={`mt-5 leading-relaxed ${isDark ? "text-blue-100/90" : "text-slate-600"}`}>{description}</p>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <div
                  key={service}
                  className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
                    isDark
                      ? "border-white/10 bg-white/5 text-blue-50"
                      : "border-blue-50 bg-blue-50/50 text-slate-700"
                  }`}
                >
                  <HiCheckCircle className={`mt-0.5 h-5 w-5 flex-none ${isDark ? "text-sky-300" : "text-blue-500"}`} />
                  {service}
                </div>
              ))}
            </div>

            {children}

            <a
              href="#contact"
              className={`mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isDark
                  ? "bg-white text-blue-800 shadow-black/20 focus-visible:ring-white focus-visible:ring-offset-blue-900"
                  : "bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-blue-500/30 focus-visible:ring-blue-500"
              }`}
            >
              {content.ui.consultationLabel} <span aria-hidden="true">→</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
