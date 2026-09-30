"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useThemeMode, type ThemeMode } from "@/lib/theme-context";

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "pro", label: "Pro" },
  { value: "terminal", label: "Terminal" },
  { value: "paper", label: "Paper" },
];

export default function ThemeSwitcher() {
  const { mode, setMode } = useThemeMode();
  const prefersReduced = useReducedMotion();

  return (
    <div
      role="tablist"
      aria-label="Site mode"
      // A solid dark pill regardless of what's behind it — this floats above
      // all three modes, including the light Paper background, where a
      // near-transparent white/[0.03] fill would be invisible.
      className="inline-flex items-center gap-0.5 rounded-full border border-white/15 bg-[rgba(10,10,10,0.85)] backdrop-blur-md p-0.5 text-xs shadow-lg shadow-black/30"
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === mode;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setMode(opt.value)}
            className={`relative rounded-full px-2.5 py-1 font-medium transition-colors duration-200 ${
              active ? "text-white" : "text-white/45 hover:text-white/80"
            }`}
          >
            {active && (
              <motion.span
                layoutId={prefersReduced ? undefined : "theme-switcher-active"}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 -z-10 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                  boxShadow: "0 0 12px rgba(99,102,241,0.35)",
                }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
