import { motion } from "framer-motion";
import { HiMiniStar } from "react-icons/hi2";
import TiltCard from "./TiltCard";
import { useSiteContent } from "../context/SiteContentContext";

export default function Testimonials() {
  const { content } = useSiteContent();

  return (
    <section className="relative bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">{content.testimonialsOverview.eyebrow}</span>
          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">{content.testimonialsOverview.title}</h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {content.testimonials.map((testimonial, index) => (
            <motion.div
              key={`${testimonial.name}-${testimonial.role}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="[perspective:1200px]"
            >
              <TiltCard className="h-full rounded-3xl">
                <article className="flex h-full flex-col rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-7 shadow-lg shadow-blue-900/5">
                  <div className="flex gap-1 text-amber-400" aria-label="Five out of five stars">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <HiMiniStar key={starIndex} aria-hidden="true" className="h-4 w-4" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                    “{testimonial.quote}”
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-sky-400 text-sm font-black text-white">
                      {testimonial.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{testimonial.name}</p>
                      <p className="text-xs text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </article>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
