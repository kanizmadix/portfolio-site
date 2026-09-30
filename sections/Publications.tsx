"use client";
import { motion, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import portfolio from "@/data/portfolio";

export default function Publications() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="publications" className="px-6 md:px-16 lg:px-24 py-28 md:py-36">
      <div className="max-w-4xl mx-auto">
        <SectionHeading eyebrow="Publications" heading="Things I've written" headingClass="mb-12" />

        <div className="space-y-3">
          {portfolio.publications.map((pub, i) => (
            <motion.div
              key={pub.title}
              initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
              whileInView={prefersReduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-6 py-5 bg-white/[0.025] border border-white/[0.08] rounded-2xl"
            >
              <span className="text-indigo-400 font-mono text-xs shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-white/75 text-sm md:text-[15px] leading-snug flex-1">{pub.title}</p>
              {pub.relatedProject && (
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300/70 font-mono uppercase tracking-wide shrink-0 self-start sm:self-center">
                  {pub.relatedProject}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
