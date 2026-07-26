"use client";
import { motion, useReducedMotion } from "framer-motion";

interface Props {
  eyebrow: string;
  heading: string;
  headingClass?: string;
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const eyebrowItem = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// Masked slide-up reveal — h2 slides in from below its overflow-hidden container
const headingItem = {
  hidden: { y: "115%", opacity: 1 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.88, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function SectionHeading({ eyebrow, heading, headingClass = "mb-12" }: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      variants={prefersReduced ? {} : container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {/* Eyebrow — simple fade+lift */}
      <motion.span
        variants={prefersReduced ? {} : eyebrowItem}
        className="text-xs tracking-[0.28em] uppercase text-indigo-400 font-mono block"
      >
        {eyebrow}
      </motion.span>

      {/* Heading — overflow-hidden masks the slide-up, creating a "pull from floor" reveal */}
      <div className="overflow-hidden">
        <motion.h2
          variants={prefersReduced ? {} : headingItem}
          className={`font-bold mt-3 ${headingClass}`}
          style={{
            fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          {heading}
        </motion.h2>
      </div>
    </motion.div>
  );
}
