"use client";
import { ComponentType } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";

// Real brand logos via react-icons
import {
  SiPython, SiJavascript, SiR, SiTensorflow, SiPytorch,
  SiFastapi, SiScikitlearn, SiPandas, SiNumpy, SiDocker,
  SiAnthropic, SiMysql,
} from "react-icons/si";

// Lucide for AWS services + AI/GenAI concepts (no Simple Icons exist for these)
import {
  Cloud, Zap, Database, HardDrive, GitBranch,
  Brain, Search, Layers, Sparkles, FileSearch, Network, Bot, BarChart3, Cpu,
  Plug, Workflow, Waypoints, TerminalSquare, ScrollText,
} from "lucide-react";

interface Skill {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: ComponentType<any>;
  color: string;
}

// ── Primary: the daily stack — cloud, data, Python, and the GenAI/agent
// engineering skills the "GenAI Engineer" title is actually built on. ──
const primarySkills: Skill[] = [
  // Python / backend
  { name: "Python",              icon: SiPython,       color: "#4B8BBE" },
  { name: "FastAPI",             icon: SiFastapi,       color: "#00D4AA" },
  // Cloud
  { name: "AWS",                 icon: Cloud,           color: "#FF9900" },
  { name: "Bedrock",             icon: Brain,           color: "#FF9900" },
  { name: "Lambda",              icon: Zap,             color: "#FF9900" },
  { name: "DynamoDB",            icon: Database,        color: "#4F8EF7" },
  { name: "S3",                  icon: HardDrive,       color: "#7FC042" },
  { name: "Step Fn.",            icon: GitBranch,       color: "#FF4B6E" },
  // Data
  { name: "SQL",                 icon: SiMysql,         color: "#4479A1" },
  { name: "Power BI",            icon: BarChart3,       color: "#F2C811" },
  { name: "Data Eng.",           icon: Workflow,        color: "#0EA5E9" },
  // GenAI, agents & the engineering practices around them
  { name: "Generative AI",       icon: Cpu,             color: "#818CF8" },
  { name: "Prompt Eng.",         icon: Sparkles,        color: "#6366F1" },
  { name: "RAG",                 icon: Search,          color: "#A78BFA" },
  { name: "LLM Pipelines",       icon: Layers,          color: "#8B5CF6" },
  { name: "IDP",                 icon: FileSearch,      color: "#EC4899" },
  { name: "Vector DB",           icon: Network,         color: "#14B8A6" },
  { name: "AI Agents",           icon: Bot,             color: "#10B981" },
  { name: "MCP",                 icon: Plug,            color: "#38BDF8" },
  { name: "Agentic Workflows",   icon: Waypoints,       color: "#F59E0B" },
  { name: "Harness Eng.",        icon: TerminalSquare,  color: "#F472B6" },
  { name: "Context Eng.",        icon: ScrollText,      color: "#34D399" },
  { name: "Anthropic",           icon: SiAnthropic,     color: "#F0A500" },
];

// ── Secondary: frontend + everything else — comfortable with these, but
// they're not the core of the day-to-day work above. ──
const secondarySkills: Skill[] = [
  { name: "JavaScript / MERN",  icon: SiJavascript,  color: "#F7DF1E" },
  { name: "R",                  icon: SiR,           color: "#276DC3" },
  { name: "TensorFlow",         icon: SiTensorflow,  color: "#FF6F00" },
  { name: "PyTorch",            icon: SiPytorch,     color: "#EE4C2C" },
  { name: "Scikit-Learn",       icon: SiScikitlearn, color: "#F7931E" },
  { name: "Pandas",             icon: SiPandas,      color: "#E070A0" },
  { name: "NumPy",              icon: SiNumpy,       color: "#4DABCF" },
  { name: "Docker",             icon: SiDocker,      color: "#2496ED" },
];

function PrimaryTile({ skill, i, reduced }: { skill: Skill; i: number; reduced: boolean }) {
  const Icon = skill.icon;
  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, scale: 0.65, y: 32 }}
      whileInView={reduced ? {} : { opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.45, delay: i * 0.035, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Float + hover layer — runs continuously */}
      <motion.div
        animate={reduced ? {} : { y: [0, -(4 + (i % 7) * 1.1), 0] }}
        transition={reduced ? {} : {
          duration: 2.4 + (i % 6) * 0.45,
          repeat: Infinity,
          ease: "easeInOut",
          delay: (i % 9) * 0.3,
        }}
        whileHover={reduced ? {} : { scale: 1.13, y: -12 }}
        className="flex flex-col items-center gap-2.5 py-4 px-2 rounded-2xl cursor-default select-none"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = `${skill.color}12`;
          el.style.borderColor = `${skill.color}45`;
          el.style.boxShadow = `0 0 28px ${skill.color}30`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "rgba(255,255,255,0.04)";
          el.style.borderColor = "rgba(255,255,255,0.07)";
          el.style.boxShadow = "none";
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${skill.color}18`, border: `1.5px solid ${skill.color}35` }}
        >
          <Icon size={22} color={skill.color} />
        </div>
        <span className="text-[9px] sm:text-[10px] text-white/50 text-center leading-tight font-medium px-1">
          {skill.name}
        </span>
      </motion.div>
    </motion.div>
  );
}

function SecondaryChip({ skill, i, reduced }: { skill: Skill; i: number; reduced: boolean }) {
  const Icon = skill.icon;
  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 14 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-2 pl-2 pr-3.5 py-2 rounded-full select-none"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ background: `${skill.color}15` }}
      >
        <Icon size={13} color={skill.color} />
      </div>
      <span className="text-[11px] text-white/45 font-medium whitespace-nowrap">{skill.name}</span>
    </motion.div>
  );
}

export default function Skills() {
  const prefersReduced = !!useReducedMotion();

  return (
    <section
      id="skills"
      className="relative px-6 md:px-16 lg:px-24 py-28 md:py-36 bg-white/[0.018] dot-grid overflow-hidden"
    >
      {/* Ambient glow orbs */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(99,102,241,0.07)_0%,transparent_70%)] pointer-events-none blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[radial-gradient(ellipse,rgba(139,92,246,0.05)_0%,transparent_70%)] pointer-events-none blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHeading eyebrow="Skills" heading="What I work with" headingClass="mb-10" />

        {/* ── Primary: cloud, data, Python & the GenAI/agent stack ── */}
        <p className="text-[10px] tracking-[0.22em] uppercase text-white/25 font-mono mb-5">
          Core stack — cloud · data · GenAI &amp; agent engineering
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 gap-3 md:gap-4 mb-16">
          {primarySkills.map((skill, i) => (
            <PrimaryTile key={skill.name} skill={skill} i={i} reduced={prefersReduced} />
          ))}
        </div>

        {/* ── Secondary: frontend + everything else ── */}
        <p className="text-[10px] tracking-[0.22em] uppercase text-white/25 font-mono mb-5">
          Also comfortable with — frontend &amp; other tooling
        </p>
        <div className="flex flex-wrap gap-2.5">
          {secondarySkills.map((skill, i) => (
            <SecondaryChip key={skill.name} skill={skill} i={i} reduced={prefersReduced} />
          ))}
        </div>
      </div>
    </section>
  );
}
