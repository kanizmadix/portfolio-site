"use client";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const links = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const { scrollY, scrollYProgress } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(10,10,10,0)", "rgba(10,10,10,0.88)"]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.12]);
  // Smooth spring for the progress bar
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  return (
    <motion.header
      style={{ backgroundColor: bg }}
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-md"
    >
      {/* Scroll progress bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px] origin-left"
        style={{
          scaleX,
          background: "linear-gradient(90deg, #6366f1, #a78bfa, #22d3ee)",
        }}
      />
      <motion.div
        style={{ borderBottomColor: `rgba(255,255,255,${borderOpacity.get()})` }}
        className="border-b border-transparent"
      >
        <nav className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 h-14 flex items-center justify-between">
          <a href="#" className="text-base font-bold tracking-tight gradient-text">
            KS
          </a>
          <ul className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-sm text-white/45 hover:text-white transition-colors duration-200 font-medium"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="mailto:kanishk0070@gmail.com"
            className="text-xs px-5 py-2 rounded-full font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-px"
            style={{
              background: "linear-gradient(135deg, #6366f1, #7c3aed)",
              boxShadow: "0 0 20px rgba(99,102,241,0.25)",
            }}
          >
            Hire me
          </a>
        </nav>
      </motion.div>
    </motion.header>
  );
}
