"use client";
import { motion, useReducedMotion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import portfolio from "@/data/portfolio";

const stats = [
  { value: "1+", label: "Years at AIVAR" },
  { value: "9+", label: "AI Projects Shipped" },
  { value: "8.9", label: "CGPA" },
  { value: "3×", label: "Certified" },
];

export default function About() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="about" className="relative px-6 md:px-16 lg:px-24 py-32 md:py-48 overflow-hidden">
      {/* Glow orbs */}
      <div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 65%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeading eyebrow="About" heading="Who I am" headingClass="mb-16" />

        {/* Large statement text */}
        <AnimatedSection delay={0.1} className="mb-16">
          <p
            className="font-light leading-[1.4] text-white/70 max-w-5xl"
            style={{ fontSize: "clamp(1.25rem, 2.8vw, 2.1rem)" }}
          >
            I design and ship{" "}
            <span className="text-white font-medium">LLM-powered production systems</span> —
            RAG pipelines, intelligent document processors, and multi-agent workflows.
            Every project starts with structured thinking and ends with{" "}
            <span className="gradient-text font-medium">code running on AWS</span>.
          </p>
        </AnimatedSection>

        {/* Stats bar */}
        <AnimatedSection delay={0.18} className="mb-16">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.055)" }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                className="px-8 py-9"
                style={{ background: "#0a0a0a" }}
              >
                <div
                  className="font-extrabold gradient-text mb-1.5"
                  style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", lineHeight: 1 }}
                >
                  {s.value}
                </div>
                <div className="text-[10px] text-white/28 uppercase tracking-[0.2em] font-mono">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Certifications + details */}
        <AnimatedSection delay={0.28}>
          <div className="grid md:grid-cols-5 gap-10 items-start">
            {/* Certs */}
            <div className="md:col-span-3 space-y-4">
              <p className="text-[10px] tracking-[0.22em] uppercase text-white/25 mb-5 font-mono">
                Certifications
              </p>
              {portfolio.certifications.map((cert) => (
                <div key={cert} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0" />
                  <span className="text-sm text-white/55 leading-snug">{cert}</span>
                </div>
              ))}
            </div>

            {/* Card */}
            <div className="md:col-span-2 space-y-5 text-sm bg-white/[0.025] border border-white/[0.08] rounded-2xl p-6">
              <div>
                <p className="text-[9px] tracking-[0.24em] uppercase text-white/22 mb-2 font-mono">
                  Education
                </p>
                <p className="text-white font-medium">{portfolio.education.degree}</p>
                <p className="text-white/50 text-[13px]">{portfolio.education.institution}</p>
                <p className="text-white/25 text-[11px] font-mono mt-1">
                  {portfolio.education.period} · CGPA {portfolio.education.cgpa}
                </p>
              </div>
              <div className="border-t border-white/[0.07] pt-4">
                <p className="text-[9px] tracking-[0.24em] uppercase text-white/22 mb-2 font-mono">
                  Location
                </p>
                <p className="text-white/50">{portfolio.location}</p>
              </div>
              <div className="border-t border-white/[0.07] pt-4">
                <p className="text-[9px] tracking-[0.24em] uppercase text-white/22 mb-2 font-mono">
                  Contact
                </p>
                <a
                  href={`mailto:${portfolio.email}`}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                >
                  {portfolio.email}
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
