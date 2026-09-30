"use client";
import { useRef, useState, useLayoutEffect } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useReducedMotion,
  transform,
  type MotionValue,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { FastForward } from "lucide-react";
import portfolio from "@/data/portfolio";
import {
  rawTokens,
  entityOrder,
  heroJson,
  ENTITY_STYLES,
  type EntityType,
} from "@/lib/heroParse";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Entrance variants for the clean hero's text/photo. Built as functions of
 * `reduced` (rather than static module constants) so a reduced-motion
 * viewer gets variants whose "hidden" state already equals "visible" and
 * whose transition duration is 0 — settling instantly — while `variants`/
 * `initial`/`animate` themselves stay constant props across renders.
 *
 * That constancy matters: this file also renders the crossfade-in from
 * `useReducedMotion()`'s SSR-mismatched initial value being corrected one
 * render later (see the Hero() component below), and toggling whether a
 * variants/initial/animate prop is even *present* (vs. a fixed object) in
 * that second render can freeze framer-motion's animation state — so these
 * props always keep the same shape; only the numbers inside change.
 */
function makeStagger(reduced: boolean) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.11, delayChildren: reduced ? 0 : 0.15 } },
  };
}
function makeRise(reduced: boolean) {
  return {
    hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 34 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.85, ease: EASE } },
  };
}
function makePhotoIn(reduced: boolean) {
  return {
    hidden: { opacity: reduced ? 1 : 0, x: reduced ? 0 : 56, scale: reduced ? 1 : 0.96 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: reduced ? 0 : 1.05, ease: EASE, delay: reduced ? 0 : 0.3 },
    },
  };
}

/**
 * Opacity + rise for one NER label in stage 2. A dedicated custom hook (not
 * an inline call inside .map) so every call site sits at a fixed, unconditional
 * position in the component body — safe under react-hooks/rules-of-hooks.
 *
 * Both values use the function form of useTransform (reads scrollYProgress
 * via .get() inside a zero-arg callback), never the array form — see this
 * repo's CLAUDE.md: the array form gets promoted to a native WAAPI
 * ViewTimeline animation, which freezes at its initial value for a pinned,
 * top-of-page section taller than the viewport like this one.
 */
function useEntityReveal(progress: MotionValue<number>, start: number, end: number) {
  const opacity = useTransform(() => transform(progress.get(), [start, end], [0, 1]));
  const y = useTransform(() => transform(progress.get(), [start, end], [8, 0]));
  return { opacity, y };
}

interface EntityReveal {
  opacity: MotionValue<number>;
  y: MotionValue<number>;
}

// One highlighted NER pill + its tiny floating label (stage 2).
function EntityPill({
  text,
  entity,
  reveal,
}: {
  text: string;
  entity: EntityType;
  reveal: EntityReveal;
}) {
  const meta = ENTITY_STYLES[entity];
  return (
    <span className="relative inline-block mx-0.5 mb-3 mt-5 align-baseline">
      <motion.span
        style={{ opacity: reveal.opacity, y: reveal.y, color: meta.color }}
        className="absolute -top-4 left-0 text-[8px] font-mono tracking-[0.18em] uppercase whitespace-nowrap"
      >
        {meta.label}
      </motion.span>
      <span
        className="px-1.5 py-0.5 rounded-md border whitespace-pre-wrap"
        style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
      >
        {text}
      </span>
    </span>
  );
}

// Shared card shell for the three "parse" stages (raw / entity / json).
function ParseCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className="rounded-2xl border px-5 py-7 sm:px-10 sm:py-10 shadow-2xl shadow-black/40"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-1.5 mb-6 opacity-60">
          <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <span className="ml-3 text-[10px] font-mono tracking-[0.2em] uppercase text-white/30">
            {label}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const lenis = useLenis();

  // framer-motion's useReducedMotion() reads matchMedia synchronously, so on
  // the client it can already be `true` on the very first (hydrating) render
  // while the server, having no `window`, always rendered `false`. Using that
  // value directly would make the very first client render disagree with
  // the server-rendered HTML for a reduced-motion visitor. We gate it behind
  // a mount flag that starts `false` on every render (server and client
  // alike, so hydration always matches) and only flips inside
  // useLayoutEffect — a genuine post-hydration client commit, not part of
  // hydration diffing, so it updates the DOM normally — and before the
  // browser paints, so no unwanted frame of the parse story is ever visible.
  // (Every stage below also stays structurally mounted either way — see the
  // comment near the JSX — since conditionally mounting/unmounting whole
  // elements on this value, unlike varying their props, would force a hard
  // hydration remount.)
  const osReducedMotion = useReducedMotion();
  const [prefersReduced, setPrefersReduced] = useState(false);
  useLayoutEffect(() => {
    // framer-motion's useReducedMotion() is itself client-only (reads
    // matchMedia) and returns false during SSR/hydration; this syncs the
    // real value in before paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (osReducedMotion) setPrefersReduced(true);
  }, [osReducedMotion]);

  const stagger = makeStagger(prefersReduced);
  const rise = makeRise(prefersReduced);
  const photoIn = makePhotoIn(prefersReduced);

  // scrollYProgress: 0 while hero is pinned at top, 1 exactly when the sticky
  // releases (section end meets viewport end) — the full parse story plays
  // while pinned, across this single 0→1 range.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // ── Stage crossfades ─────────────────────────────────────────────────────
  // 1. raw dump        0    – 0.15
  // 2. entity highlight 0.15 – 0.45
  // 3. structured JSON  0.45 – 0.70
  // 4. clean hero       0.70 – 1.00
  // All function-form (never array-form) per this repo's CLAUDE.md.
  const stage1Op = useTransform(() => transform(scrollYProgress.get(), [0, 0.1, 0.15], [1, 1, 0]));
  const stage2Op = useTransform(() =>
    transform(scrollYProgress.get(), [0.12, 0.18, 0.42, 0.45], [0, 1, 1, 0])
  );
  const stage3Op = useTransform(() =>
    transform(scrollYProgress.get(), [0.42, 0.48, 0.67, 0.7], [0, 1, 1, 0])
  );
  const stage4Op = useTransform(() => transform(scrollYProgress.get(), [0.68, 0.8], [0, 1]));
  const stage4Y = useTransform(() => transform(scrollYProgress.get(), [0.68, 0.84], [22, 0]));
  const stage4Pointer = useTransform(() => (scrollYProgress.get() > 0.68 ? "auto" : "none"));

  // Stage-1 "freshly scanned" settle: slight blur + skew resolving to sharp.
  const stage1BlurPx = useTransform(() => transform(scrollYProgress.get(), [0, 0.06], [5, 0]));
  const stage1Filter = useMotionTemplate`blur(${stage1BlurPx}px)`;
  const stage1SkewDeg = useTransform(() => transform(scrollYProgress.get(), [0, 0.06], [-1.4, 0]));
  const stage1Transform = useMotionTemplate`skewY(${stage1SkewDeg}deg)`;

  // Scroll cue disappears as soon as the user starts scrolling
  const cueOp = useTransform(() => transform(scrollYProgress.get(), [0, 0.08], [1, 0]));

  // Per-entity label reveal, in the same order entities appear in rawTokens:
  // PERSON, ROLE, SKILL x3, CERT x2, ORG — spread across the stage-2 range.
  const personReveal = useEntityReveal(scrollYProgress, 0.15, 0.2);
  const roleReveal = useEntityReveal(scrollYProgress, 0.18, 0.23);
  const skill1Reveal = useEntityReveal(scrollYProgress, 0.21, 0.26);
  const skill2Reveal = useEntityReveal(scrollYProgress, 0.24, 0.29);
  const skill3Reveal = useEntityReveal(scrollYProgress, 0.27, 0.32);
  const cert1Reveal = useEntityReveal(scrollYProgress, 0.3, 0.35);
  const cert2Reveal = useEntityReveal(scrollYProgress, 0.33, 0.38);
  const orgReveal = useEntityReveal(scrollYProgress, 0.36, 0.41);
  const entityReveals: EntityReveal[] = [
    personReveal,
    roleReveal,
    skill1Reveal,
    skill2Reveal,
    skill3Reveal,
    cert1Reveal,
    cert2Reveal,
    orgReveal,
  ];

  // Mouse-follow 3D tilt (kept from the previous hero, unchanged)
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
  const onMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  // "Skip" — jump straight past the parse story to the settled clean hero,
  // i.e. the scroll position where this section's scrollYProgress hits 1.
  const handleSkip = () => {
    const el = sectionRef.current;
    if (!el) return;
    const target = el.offsetTop + el.offsetHeight - window.innerHeight;
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  };

  // Splitting the real name for the same two-tone treatment as before
  // ("Kanishk" / "S.") — derived from portfolio.name, not hardcoded.
  const nameParts = portfolio.name.trim().split(/\s+/);
  const firstNames = nameParts.slice(0, -1).join(" ") || nameParts[0];
  const lastInitial = nameParts[nameParts.length - 1];

  const cleanHero = (
    <motion.div
      className="w-full max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-16"
      style={{ y: prefersReduced ? 0 : stage4Y }}
    >
      {/* ── Text block ─────────────────────────────────────────── */}
      <motion.div
        className="flex-1 flex flex-col justify-center"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={rise}
          className="inline-block text-[11px] tracking-[0.3em] uppercase text-indigo-400 font-mono mb-6"
        >
          {portfolio.role}
        </motion.span>

        <motion.h1
          variants={rise}
          className="font-extrabold tracking-tight leading-[1.0] mb-8"
          style={{ fontSize: "clamp(3.5rem, 9vw, 7rem)" }}
        >
          <span className="block text-white">{firstNames}</span>
          <span className="block gradient-text">{lastInitial}.</span>
        </motion.h1>

        <motion.p
          variants={rise}
          className="text-base md:text-lg lg:text-xl text-white/55 max-w-md leading-relaxed mb-10"
        >
          {portfolio.tagline}
        </motion.p>

        <motion.div variants={rise} className="flex flex-wrap gap-4">
          <motion.a
            href={`mailto:${portfolio.email}`}
            whileHover={prefersReduced ? undefined : { scale: 1.04, y: -2 }}
            whileTap={prefersReduced ? undefined : { scale: 0.97 }}
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
            whileHover={prefersReduced ? undefined : { scale: 1.04, y: -2 }}
            whileTap={prefersReduced ? undefined : { scale: 0.97 }}
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
      </motion.div>

      {/* ── Photo ──────────────────────────────────────────────── */}
      <motion.div
        className="flex-shrink-0"
        variants={photoIn}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          animate={prefersReduced ? { y: 0 } : { y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div style={{ perspective: "1000px" }}>
            <motion.div
              style={{ rotateX: prefersReduced ? 0 : rotateX, rotateY: prefersReduced ? 0 : rotateY }}
              className="relative"
            >
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
  );

  return (
    /*
     * The outer section is 200 vh — 100 vh visible + 100 vh of scroll travel.
     * The inner sticky div stays pinned while the user scrolls through, and
     * scrollYProgress maps that travel onto the 4-stage "parse" story above.
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

        {/*
          NOTE ON prefersReduced BRANCHING BELOW: framer-motion's
          useReducedMotion() resolves synchronously from matchMedia on the
          client but always starts `false` during server rendering (no
          `window`). Conditionally mounting/unmounting whole elements on it
          (as opposed to only varying a prop already on the same element)
          would make the very first client render disagree with the
          server-rendered HTML and blow up hydration. So every stage below
          is always mounted on both server and client; only numeric style
          values (opacity/filter/transform/pointerEvents) branch on
          prefersReduced, which keeps the DOM tree identical and just makes
          stages 1-3 permanently invisible/inert for reduced-motion users —
          equivalent in effect to "skip stages 1-3 entirely, no flash".
        */}

        {/* Skip — jumps straight to the settled clean hero */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-20 right-6 md:top-24 md:right-10 z-30 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-mono tracking-wide uppercase text-white/45 hover:text-white/85 transition-colors duration-300"
          style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}
          aria-label="Skip intro animation"
        >
          Skip
          <FastForward className="w-3 h-3" strokeWidth={2} />
        </button>

        {/* Stage 1 — raw OCR-style dump */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center px-6 md:px-16 pointer-events-none"
          style={{
            opacity: prefersReduced ? 0 : stage1Op,
            filter: prefersReduced ? "none" : stage1Filter,
            transform: prefersReduced ? "none" : stage1Transform,
          }}
        >
          <ParseCard label="unstructured.raw">
            <pre className="font-mono text-[11px] sm:text-sm leading-relaxed whitespace-pre-wrap text-white/40">
              {rawTokens.map((t) => t.text).join("")}
            </pre>
          </ParseCard>
        </motion.div>

        {/* Stage 2 — named-entity highlight pass */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center px-6 md:px-16 pointer-events-none"
          style={{ opacity: prefersReduced ? 0 : stage2Op }}
        >
          <ParseCard label="entity-extraction.pass">
            <pre className="font-mono text-[11px] sm:text-sm leading-relaxed whitespace-pre-wrap text-white/55">
              {rawTokens.map((t, i) => {
                const order = entityOrder[i];
                if (!t.entity || order === null) return <span key={i}>{t.text}</span>;
                return (
                  <EntityPill key={i} text={t.text} entity={t.entity} reveal={entityReveals[order]} />
                );
              })}
            </pre>
          </ParseCard>
        </motion.div>

        {/* Stage 3 — structured JSON */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center px-6 md:px-16 pointer-events-none"
          style={{ opacity: prefersReduced ? 0 : stage3Op }}
        >
          <ParseCard label="structured.json">
            <pre className="font-mono text-[11px] sm:text-sm leading-[1.85] whitespace-pre-wrap break-words text-white/70">
              <span className="text-white/30">{"{"}</span>
              {"\n  "}
              <span style={{ color: "#a78bfa" }}>&quot;name&quot;</span>
              <span className="text-white/30">: </span>
              <span style={{ color: "#22d3ee" }}>&quot;{heroJson.name}&quot;</span>
              <span className="text-white/30">,</span>
              {"\n  "}
              <span style={{ color: "#a78bfa" }}>&quot;role&quot;</span>
              <span className="text-white/30">: </span>
              <span style={{ color: "#22d3ee" }}>&quot;{heroJson.role}&quot;</span>
              <span className="text-white/30">,</span>
              {"\n  "}
              <span style={{ color: "#a78bfa" }}>&quot;skills&quot;</span>
              <span className="text-white/30">: [</span>
              {heroJson.skills.map((s, i) => (
                <span key={s}>
                  {"\n    "}
                  <span style={{ color: "#22d3ee" }}>&quot;{s}&quot;</span>
                  <span className="text-white/30">{i < heroJson.skills.length - 1 ? "," : ""}</span>
                </span>
              ))}
              {"\n  "}
              <span className="text-white/30">],</span>
              {"\n  "}
              <span style={{ color: "#a78bfa" }}>&quot;certifications&quot;</span>
              <span className="text-white/30">: [</span>
              {heroJson.certifications.map((c, i) => (
                <span key={c}>
                  {"\n    "}
                  <span style={{ color: "#22d3ee" }}>&quot;{c}&quot;</span>
                  <span className="text-white/30">
                    {i < heroJson.certifications.length - 1 ? "," : ""}
                  </span>
                </span>
              ))}
              {"\n  "}
              <span className="text-white/30">]</span>
              {"\n"}
              <span className="text-white/30">{"}"}</span>
            </pre>
          </ParseCard>
        </motion.div>

        {/* Stage 4 — clean hero */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center px-6 md:px-16 lg:px-24"
          style={{
            opacity: prefersReduced ? 1 : stage4Op,
            pointerEvents: prefersReduced ? "auto" : stage4Pointer,
          }}
        >
          {cleanHero}
        </motion.div>

        {/* Scroll cue — fades out as soon as scrolling begins */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/30 pointer-events-none"
          style={{ opacity: prefersReduced ? 0 : cueOp }}
          animate={prefersReduced ? undefined : { y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <span className="text-[10px] tracking-[0.25em] uppercase font-mono">scroll</span>
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
            <line x1="7" y1="0" x2="7" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path
              d="M1 10l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
