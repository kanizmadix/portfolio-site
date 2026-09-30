"use client";
import Nav from "@/components/Nav";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Skills from "@/sections/Skills";
import Projects from "@/sections/Projects";
import Publications from "@/sections/Publications";
import Experience from "@/sections/Experience";
import Contact from "@/sections/Contact";
import Marquee from "@/components/ui/Marquee";
import TerminalMode from "@/components/modes/TerminalMode";
import PaperMode from "@/components/modes/PaperMode";
import { useThemeMode } from "@/lib/theme-context";

const techStack = [
  "Python", "LLM Pipelines", "RAG Systems", "AWS Bedrock",
  "FastAPI", "Vector Databases", "Prompt Engineering", "AI Agents",
  "PyTorch", "TensorFlow", "Docker", "FAISS", "Intelligent Document Processing",
];

export default function Home() {
  const { mode } = useThemeMode();

  if (mode === "terminal") return <TerminalMode />;
  if (mode === "paper") return <PaperMode />;

  return (
    <main className="bg-[#0a0a0a] min-h-screen text-white">
      <Nav />
      <Hero />

      {/* Marquee divider — scrolling tech stack strip */}
      <div className="py-6 border-y border-white/[0.06]">
        <Marquee items={techStack} duration={35} />
      </div>

      <About />
      <Skills />
      <Projects />
      <Publications />
      <Experience />
      <Contact />
    </main>
  );
}
