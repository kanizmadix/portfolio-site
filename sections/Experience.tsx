"use client";
import { motion, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import portfolio from "@/data/portfolio";

export default function Experience() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="experience" className="px-6 md:px-16 lg:px-24 py-28 md:py-36 bg-white/[0.018] dot-grid">
      <div className="max-w-4xl mx-auto">
        <SectionHeading eyebrow="Experience" heading="Where I've worked" headingClass="mb-16" />

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-3 md:left-[2.35rem] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/60 via-indigo-500/20 to-transparent" />

          <div className="space-y-14">
            {portfolio.experience.map((item, i) => (
              <motion.div
                key={`${item.company}-${i}`}
                initial={prefersReduced ? {} : { opacity: 0, x: -24 }}
                whileInView={prefersReduced ? {} : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.52, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative pl-10 md:pl-20"
              >
                {/* Timeline dot */}
                <div className="absolute left-[5px] md:left-[30px] top-[7px] w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20 ring-offset-[3px] ring-offset-[#0a0a0a]" />

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
                  <div>
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="text-indigo-400 text-sm font-medium">{item.company}</p>
                    <p className="text-white/35 text-xs mt-0.5">{item.type} · {item.location}</p>
                  </div>
                  <span className="text-xs text-white/35 font-mono whitespace-nowrap sm:mt-0.5 shrink-0">
                    {item.period}
                  </span>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {item.bullets.map((b, j) => (
                    <li key={j} className="text-white/55 text-sm leading-relaxed flex gap-2">
                      <span className="text-indigo-400/70 mt-[3px] shrink-0">›</span>
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5">
                  {item.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300/80 font-mono"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
