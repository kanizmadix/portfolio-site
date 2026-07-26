import Nav from "@/components/Nav";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Skills from "@/sections/Skills";
import Projects from "@/sections/Projects";
import Experience from "@/sections/Experience";
import Contact from "@/sections/Contact";
import Marquee from "@/components/ui/Marquee";

const techStack = [
  "Python", "LLM Pipelines", "RAG Systems", "AWS Bedrock",
  "FastAPI", "Vector Databases", "Prompt Engineering", "AI Agents",
  "PyTorch", "TensorFlow", "Docker", "FAISS", "Intelligent Document Processing",
];

export default function Home() {
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
      <Experience />
      <Contact />
    </main>
  );
}
