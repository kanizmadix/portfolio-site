"use client";
import { motion } from "framer-motion";

interface Props {
  items: string[];
  separator?: string;
  duration?: number;
  reverse?: boolean;
  className?: string;
  itemClass?: string;
}

export default function Marquee({
  items,
  separator = "·",
  duration = 32,
  reverse = false,
  className = "",
  itemClass = "text-white/18 text-[11px] tracking-[0.28em] uppercase font-mono",
}: Props) {
  // Duplicate for seamless loop — animate exactly -50% to loop one full set
  const doubled = [...items, ...items];

  return (
    <div className={`overflow-hidden select-none ${className}`} aria-hidden="true">
      <motion.div
        className="flex items-center gap-10 w-max"
        animate={{ x: reverse ? ["0%", "50%"] : ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity, repeatType: "loop" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-10 flex-shrink-0">
            <span className={itemClass}>{item}</span>
            <span className="text-indigo-500/30 text-base">{separator}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
