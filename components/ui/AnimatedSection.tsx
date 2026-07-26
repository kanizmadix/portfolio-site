"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedSection({ children, className, delay = 0 }: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? {} : {
        opacity: 0,
        y: 52,
        scale: 0.97,
        filter: "blur(8px)",
      }}
      whileInView={prefersReduced ? {} : {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.95,
        delay,
        ease: [0.22, 1, 0.36, 1],
        filter: { duration: 0.65, delay, ease: "easeOut" },
        scale: { duration: 1.05, delay, ease: [0.22, 1, 0.36, 1] },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
