"use client";

import { search, type SearchResult } from "@/lib/searchIndex";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Command, CornerDownLeft, Search as SearchIcon, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Dispatch this custom event from anywhere (e.g. a future navbar button) to
 * open the palette programmatically:
 *
 *   window.dispatchEvent(new Event("command-palette:open"));
 *
 * See wiringNotes for how components/Nav.tsx can use this.
 */
export const OPEN_COMMAND_PALETTE_EVENT = "command-palette:open";

const SUGGESTIONS = [
  "Has he built RAG on AWS?",
  "What AWS services does he use?",
  "Show his GenAI projects",
  "What certifications does he hold?",
  "How do I contact him?",
];

const SECTION_LABELS: Record<SearchResult["section"], string> = {
  about: "About",
  skills: "Skills",
  projects: "Projects",
  publications: "Publications",
  experience: "Experience",
  contact: "Contact",
};

type TraceStepId = "plan" | "retrieve" | "rank" | "compose";

interface TraceStep {
  id: TraceStepId;
  label: string;
  detail: string;
  elapsedMs: number;
}

interface RunOutcome {
  steps: TraceStep[];
  results: SearchResult[];
}

/** Runs the query through the local index, timing each stage with performance.now(). */
function runQuery(rawQuery: string): RunOutcome {
  const steps: TraceStep[] = [];

  let t0 = performance.now();
  const parsed = rawQuery.trim();
  let t1 = performance.now();
  steps.push({
    id: "plan",
    label: "plan",
    detail: parsed ? `Parsed query: "${parsed}"` : "Empty query — nothing to plan.",
    elapsedMs: t1 - t0,
  });

  t0 = performance.now();
  const rawResults = search(parsed, 5);
  t1 = performance.now();
  steps.push({
    id: "retrieve",
    label: "retrieve (top_k=5)",
    detail: rawResults.length
      ? `Found ${rawResults.length} match${rawResults.length === 1 ? "" : "es"} in the local index.`
      : "No candidates found in the local index.",
    elapsedMs: t1 - t0,
  });

  t0 = performance.now();
  const ranked = [...rawResults].sort((a, b) => b.score - a.score);
  t1 = performance.now();
  steps.push({
    id: "rank",
    label: "rank",
    detail: ranked.length
      ? ranked.map((r, i) => `#${i + 1} ${r.title} (${r.score.toFixed(2)})`).join("   ")
      : "Nothing to rank.",
    elapsedMs: t1 - t0,
  });

  t0 = performance.now();
  const composed = ranked.length
    ? `Quoting ${ranked.length} matched passage${ranked.length === 1 ? "" : "s"} from real portfolio content below — nothing generated.`
    : "No matching content — answer withheld rather than invented.";
  t1 = performance.now();
  steps.push({
    id: "compose",
    label: "compose",
    detail: composed,
    elapsedMs: t1 - t0,
  });

  return { steps, results: ranked };
}

export default function CommandPalette() {
  const prefersReduced = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [visibleStepCount, setVisibleStepCount] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearRevealTimers = useCallback(() => {
    revealTimersRef.current.forEach((t) => clearTimeout(t));
    revealTimersRef.current = [];
  }, []);

  const execute = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      clearRevealTimers();

      const { steps: newSteps, results: newResults } = runQuery(value);
      setHasRun(true);
      setSteps(newSteps);
      setResults(newResults);

      if (prefersReduced) {
        setVisibleStepCount(newSteps.length);
        return;
      }

      setVisibleStepCount(0);
      newSteps.forEach((_, i) => {
        const timer = setTimeout(
          () => setVisibleStepCount((c) => Math.max(c, i + 1)),
          200 * (i + 1)
        );
        revealTimersRef.current.push(timer);
      });
    },
    [prefersReduced, clearRevealTimers]
  );

  // Tracks open/closed synchronously for the keydown handler below, so a
  // second Cmd+K press can decide open-vs-close without a functional setState
  // toggle (which would have no room to also run the close-time resets).
  const isOpenRef = useRef(false);

  const resetQueryState = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    clearRevealTimers();
    setSteps([]);
    setResults([]);
    setVisibleStepCount(0);
    setHasRun(false);
  }, [clearRevealTimers]);

  const close = useCallback(() => {
    isOpenRef.current = false;
    setIsOpen(false);
    setQuery("");
    resetQueryState();
  }, [resetQueryState]);

  const open = useCallback(() => {
    isOpenRef.current = true;
    setIsOpen(true);
  }, []);

  // Cmd+K / Ctrl+K to open, Escape to close, plus a custom event any future
  // trigger (e.g. a navbar button) can dispatch to open the palette.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpenRef.current) close();
        else open();
      } else if (e.key === "Escape" && isOpenRef.current) {
        close();
      }
    }
    function onExternalOpen() {
      open();
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, onExternalOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, onExternalOpen);
    };
  }, [open, close]);

  // Autofocus the input whenever the palette opens. All state resets happen
  // in close()/handleQueryChange() (event handlers), not here, so this effect
  // never needs to call setState itself.
  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // Lock background scroll while open; always restore on close/unmount.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Unmount safety net only — clears any pending debounce/reveal timers.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      clearRevealTimers();
    };
  }, [clearRevealTimers]);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      resetQueryState();
      return;
    }
    debounceRef.current = setTimeout(() => execute(value), 150);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      execute(query);
    }
  }

  function handleSuggestionClick(suggestion: string) {
    setQuery(suggestion);
    execute(suggestion);
  }

  function handleResultLinkClick() {
    close();
  }

  const visibleSteps = steps.slice(0, visibleStepCount);
  const showEmptyState = hasRun && visibleStepCount >= steps.length && results.length === 0;
  const showResults = visibleStepCount >= steps.length && results.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-[12vh] md:pt-[16vh]"
          style={{ paddingTop: "max(12vh, env(safe-area-inset-top, 0px))" }}
          initial={prefersReduced ? undefined : { opacity: 0 }}
          animate={prefersReduced ? undefined : { opacity: 1 }}
          exit={prefersReduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Ask my portfolio"
            className="relative w-full max-w-xl rounded-2xl border overflow-hidden"
            style={{
              background: "rgba(16,16,20,0.92)",
              borderColor: "rgba(255,255,255,0.1)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
            }}
            initial={prefersReduced ? undefined : { opacity: 0, y: -16, scale: 0.98 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {/* Header / input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <SearchIcon size={18} className="shrink-0 text-indigo-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask about projects, experience, skills, certifications…"
                aria-label="Ask my portfolio"
                autoComplete="off"
                spellCheck={false}
                className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-white/35 text-[#ededed]"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close command palette"
                className="shrink-0 rounded-md p-1.5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              {!query.trim() && (
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40 mb-3">
                    <Sparkles size={13} className="text-cyan-300" />
                    Try asking
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        className="text-xs md:text-sm rounded-full border px-3 py-1.5 transition-colors text-left"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          borderColor: "rgba(255,255,255,0.08)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                          e.currentTarget.style.borderColor = "rgba(129,140,248,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim() && (
                <div className="space-y-4">
                  {/* Agent trace */}
                  <ol className="space-y-1.5">
                    <AnimatePresence initial={false}>
                      {visibleSteps.map((step) => (
                        <motion.li
                          key={step.id}
                          initial={prefersReduced ? undefined : { opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className="flex items-start gap-2.5 text-xs md:text-[13px] font-mono"
                        >
                          <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                          <span className="shrink-0 text-indigo-300">{step.label}</span>
                          <span className="text-white/45 truncate">{step.detail}</span>
                          <span className="ml-auto shrink-0 text-white/30 tabular-nums">
                            {step.elapsedMs < 0.1 ? "<0.1" : step.elapsedMs.toFixed(1)}ms
                          </span>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ol>

                  {/* Results */}
                  {showResults && (
                    <div className="space-y-2.5 pt-1">
                      {results.map((r) => (
                        <a
                          key={r.id}
                          href={`#${r.section}`}
                          onClick={handleResultLinkClick}
                          className="block rounded-xl border px-4 py-3 transition-colors group"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            borderColor: "rgba(255,255,255,0.08)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                            e.currentTarget.style.borderColor = "rgba(129,140,248,0.35)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                          }}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1.5">
                            <span className="text-sm font-semibold">{r.title}</span>
                            <span
                              className="flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                              style={{
                                background: "rgba(99,102,241,0.14)",
                                color: "#a5b4fc",
                                border: "1px solid rgba(129,140,248,0.3)",
                              }}
                            >
                              {SECTION_LABELS[r.section]}
                              <ArrowUpRight
                                size={10}
                                className="opacity-60 group-hover:opacity-100 transition-opacity"
                              />
                            </span>
                          </div>
                          <p className="text-xs md:text-[13px] text-white/60 leading-relaxed">
                            {r.text}
                          </p>
                        </a>
                      ))}
                    </div>
                  )}

                  {showEmptyState && (
                    <div className="text-center py-6">
                      <p className="text-sm text-white/55">
                        Nothing in the portfolio matches that — try rephrasing, or ask about
                        projects, experience, skills, certifications, publications, or contact.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-white/10 text-[11px] text-white/35">
              <span>Runs locally in your browser — no LLM calls, just search over this page&apos;s real content.</span>
              <span className="hidden md:flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-0.5 rounded border border-white/10 px-1.5 py-0.5">
                  <CornerDownLeft size={10} /> enter
                </span>
                <span className="flex items-center gap-0.5 rounded border border-white/10 px-1.5 py-0.5">
                  <Command size={10} />K
                </span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
