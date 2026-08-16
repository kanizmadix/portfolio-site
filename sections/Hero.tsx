"use client";
import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
  transform,
} from "framer-motion";
import portfolio from "@/data/portfolio";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Entrance variants (run once on mount — hero is never blank) ────────────
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
};
const rise = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};
const photoIn = {
  hidden: { opacity: 0, x: 56, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 1.05, ease: EASE, delay: 0.3 },
  },
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  // scrollYProgress: 0 while hero is pinned at top, 1 exactly when the sticky
  // releases (section end meets viewport end) — the full exit plays while pinned.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // ── Scroll-driven parallax exit ──────────────────────────────────────────
  // Hold everything in place for the first 30% of travel, then layers leave
  // at different speeds (parallax) while the whole stage fades out.
  //
  // IMPORTANT: these use the function form of useTransform, not the array
  // form. The array form lets framer-motion promote the animation to a native
  // WAAPI ViewTimeline, which resolves a degenerate range for this layout
  // (section at page top, taller than the viewport) and corrupts the values.
  // The function form is not keyframe-serialisable, so it always stays on the
  // correct JS-driven path.
  const nameY    = useTransform(() => transform(scrollYProgress.get(), [0, 0.3, 1], [0, 0, -180]));
  const taglineY = useTransform(() => transform(scrollYProgress.get(), [0, 0.3, 1], [0, 0, -110]));
  const photoY   = useTransform(() => transform(scrollYProgress.get(), [0, 0.3, 1], [0, 0, -55]));
  const photoScale = useTransform(() => transform(scrollYProgress.get(), [0, 0.3, 1], [1, 1, 1.1]));
  const exitOp   = useTransform(() => transform(scrollYProgress.get(), [0, 0.45, 0.85], [1, 1, 0]));
  // Scroll cue disappears as soon as the user starts scrolling
  const cueOp    = useTransform(() => transform(scrollYProgress.get(), [0, 0.08], [1, 0]));

  // Mouse-follow 3D tilt
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 120, damping: 22 });
  const springY = useSpring(rawY, { stiffness: 120, damping: 22 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-7, 7]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onMouseLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    /*
     * The outer section is 200 vh — 100 vh visible + 100 vh of scroll travel.
     * The inner sticky div stays pinned while the user scrolls through, and
     * scrollYProgress maps that travel onto the parallax-exit timeline above.
     */
    <section ref={sectionRef} className="relative h-[200vh]">
      {/* ── Sticky viewport ─────────────────────────────────────────────── */}
      <div
        className="sticky top-0 h-screen overflow-hidden dot-grid"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {/* Atmospheric glows */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_80%_at_78%_50%,rgba(99,102,241,0.24)_0%,rgba(139,92,246,0.11)_40%,transparent_70%)]" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_42%_42%_at_10%_18%,rgba(99,102,241,0.07)_0%,transparent_62%)]" />

        {/* Scroll-linked fade for the whole stage (separate from entrance) */}
        <motion.div
          className="relative z-10 h-full flex items-center px-6 md:px-16 lg:px-24"
          style={prefersReduced ? undefined : { opacity: exitOp }}
        >
          <motion.div
            className="w-full max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-16"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {/* ── Text block ─────────────────────────────────────────── */}
            <motion.div
              className="flex-1 flex flex-col justify-center"
              style={prefersReduced ? undefined : { y: nameY }}
            >
              {/* Eyebrow */}
              <motion.span
                variants={rise}
                className="inline-block text-[11px] tracking-[0.3em] uppercase text-indigo-400 font-mono mb-6"
              >
                Generative AI Engineer · Data Science Undergrad
              </motion.span>

              {/* Name */}
              <motion.h1
                variants={rise}
                className="font-extrabold tracking-tight leading-[1.0] mb-8"
                style={{ fontSize: "clamp(3.5rem, 9vw, 7rem)" }}
              >
                <span className="block text-white">Kanishk</span>
                <span className="block gradient-text">S.</span>
              </motion.h1>

              {/* Slower parallax layer — tagline, CTAs, badges */}
              <motion.div style={prefersReduced ? undefined : { y: taglineY }}>
                {/* Tagline */}
                <motion.p
                  variants={rise}
                  className="text-base md:text-lg lg:text-xl text-white/55 max-w-md leading-relaxed mb-10"
                >
                  {portfolio.tagline}
                </motion.p>

                {/* CTAs */}
                <motion.div variants={rise} className="flex flex-wrap gap-4">
                  <motion.a
                    href={`mailto:${portfolio.email}`}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative px-8 py-3.5 rounded-full text-white text-sm font-semibold overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                      boxShadow: "0 0 30px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">Get in touch</span>
                  </motion.a>

                  <motion.a
                    href={portfolio.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-3.5 rounded-full text-white/75 hover:text-white text-sm font-semibold transition-all duration-300"
                    style={{
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: "rgba(255,255,255,0.04)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    GitHub →
                  </motion.a>
                </motion.div>

                {/* Cert badges */}
                <motion.div variants={rise} className="flex flex-wrap gap-2 mt-10">
                  {["AWS Solutions Architect", "NUS AI Analytics", "IBM Data Science"].map((c) => (
                    <span
                      key={c}
                      className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-white/35 font-mono tracking-wide"
                    >
                      {c}
                    </span>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* ── Photo ──────────────────────────────────────────────── */}
            <motion.div
              className="flex-shrink-0"
              style={prefersReduced ? undefined : { y: photoY, scale: photoScale }}
            >
              <motion.div variants={photoIn}>
                {/* Idle float */}
                <motion.div
                  animate={prefersReduced ? {} : { y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* 3D tilt */}
                  <div style={{ perspective: "1000px" }}>
                    <motion.div style={prefersReduced ? {} : { rotateX, rotateY }} className="relative">
                      {/* Glow bloom */}
                      <div
                        className="absolute -inset-12 rounded-[2rem] blur-3xl pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse at center, rgba(99,102,241,0.45) 0%, rgba(139,92,246,0.20) 50%, transparent 75%)",
                        }}
                      />
                      <div
                        className="absolute -inset-6 rounded-[2rem] blur-2xl pointer-events-none opacity-60"
                        style={{
                          background:
                            "radial-gradient(ellipse at 60% 80%, rgba(167,139,250,0.30) 0%, transparent 65%)",
                        }}
                      />
                      {/* Frame */}
                      <div className="relative w-64 sm:w-72 md:w-80 lg:w-[26rem] h-[22rem] sm:h-[26rem] md:h-[30rem] lg:h-[36rem] rounded-[1.75rem] overflow-hidden border border-white/12 shadow-2xl shadow-black/70">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/hero.png`}
                          alt={portfolio.name}
                          fill
                          sizes="(min-width: 1024px) 416px, (min-width: 768px) 320px, 288px"
                          className="object-cover object-top"
                          priority
                        />
                        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll cue — fades out as soon as scrolling begins */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/30 pointer-events-none"
          style={prefersReduced ? undefined : { opacity: cueOp }}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <span className="text-[10px] tracking-[0.25em] uppercase font-mono">scroll</span>
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
            <line x1="7" y1="0" x2="7" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M1 10l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
