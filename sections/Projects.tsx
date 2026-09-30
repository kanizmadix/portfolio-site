"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { Workflow } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
import portfolio, { type Project } from "@/data/portfolio";

// The diagram library (@xyflow/react) is only fetched once a visitor actually
// opens a "View architecture" modal — never on initial page load.
const ArchitectureDiagram = dynamic(() => import("@/components/ui/ArchitectureDiagram"), {
  ssr: false,
});

export default function Projects() {
  const prefersReduced = useReducedMotion();
  const [archProject, setArchProject] = useState<Project | null>(null);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };
  const card = {
    hidden:   { opacity: 0, y: 60 },
    visible:  { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as const } },
  };

  return (
    <section id="projects" className="px-6 md:px-16 lg:px-24 py-28 md:py-36">
      <div className="max-w-7xl mx-auto">
        <SectionHeading eyebrow="Projects" heading="Things I've built" headingClass="mb-5" />

        {/* The LLM-backed projects aren't hosted as live demos on purpose — running
            them would mean shipping my own API key. Visitors bring their own. */}
        <AnimatedSection delay={0.1}>
          <p className="text-white/45 text-sm md:text-base max-w-2xl mb-12 leading-relaxed">
            The Claude-powered projects run locally rather than as public demos — clone the repo,
            add your own{" "}
            <code className="font-mono text-white/65 text-[0.9em]">ANTHROPIC_API_KEY</code> to{" "}
            <code className="font-mono text-white/65 text-[0.9em]">.env</code>, and run it. Each repo
            has setup steps in its README.
          </p>
        </AnimatedSection>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={prefersReduced ? {} : container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {portfolio.projects.map((project) => (
            <motion.a
              key={project.name}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              variants={prefersReduced ? {} : card}
              whileHover={prefersReduced ? {} : { y: -7, transition: { duration: 0.22 } }}
              className="group flex flex-col bg-white/[0.03] border border-white/[0.08] hover:border-indigo-500/70 hover:bg-indigo-500/[0.04] hover:shadow-[0_0_40px_rgba(99,102,241,0.18)] rounded-2xl p-7 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-semibold leading-snug group-hover:text-indigo-300 transition-colors duration-200">
                  {project.name}
                </h3>
                {/* External link icon */}
                <svg
                  className="w-3.5 h-3.5 text-white/20 group-hover:text-indigo-400 flex-shrink-0 mt-0.5 transition-colors duration-200"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>

              <p className="text-white/55 text-sm leading-relaxed flex-1 mb-5">
                {project.description}
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setArchProject(project);
                }}
                aria-haspopup="dialog"
                aria-label={`View architecture diagram for ${project.name}`}
                className="relative z-10 self-start inline-flex items-center gap-1.5 text-[11px] font-mono text-indigo-300/70 hover:text-indigo-300 border border-white/10 hover:border-indigo-400/40 rounded-full px-2.5 py-1 mb-4 transition-colors duration-200"
              >
                <Workflow size={12} />
                View architecture
              </button>

              <div className="flex flex-wrap gap-1.5 mt-auto">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded bg-white/[0.055] text-white/45 font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>

      {archProject && (
        <ArchitectureDiagram
          key={archProject.name}
          project={archProject}
          onClose={() => setArchProject(null)}
        />
      )}
    </section>
  );
}
