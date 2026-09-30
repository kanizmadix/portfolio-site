"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import portfolio from "@/data/portfolio";
import type { Project } from "@/data/portfolio";

// ── helpers ──────────────────────────────────────────────────────────────

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Case-insensitive fuzzy match: prefers a substring hit, falls back to an
 *  in-order subsequence match (so "magp" still finds "Multi-Agent AI Planner"). */
function fuzzyFindProject(query: string): Project | null {
  const q = normalize(query);
  if (!q) return null;

  let best: { project: Project; score: number } | null = null;

  for (const project of portfolio.projects) {
    const name = normalize(project.name);
    let score = -1;

    if (name.includes(q)) {
      score = 1000 - name.length;
    } else {
      let qi = 0;
      for (let i = 0; i < name.length && qi < q.length; i++) {
        if (name[i] === q[qi]) qi++;
      }
      if (qi === q.length) {
        score = 500 - name.length;
      }
    }

    if (score > -1 && (!best || score > best.score)) {
      best = { project, score };
    }
  }

  return best?.project ?? null;
}

function longestCommonPrefix(values: string[]): string {
  if (values.length === 0) return "";
  let prefix = values[0];
  for (const value of values.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < value.length && prefix[i].toLowerCase() === value[i].toLowerCase()) {
      i++;
    }
    prefix = prefix.slice(0, i);
  }
  return prefix;
}

const CAT_PREFIX = "cat projects/";
const KNOWN_COMMANDS = [
  "help",
  "whoami",
  "ls projects",
  CAT_PREFIX,
  "skills --graph",
  "contact",
  "sudo hire kanishk",
];

function completeInput(current: string): string {
  const lower = current.toLowerCase();

  if (lower.startsWith(CAT_PREFIX)) {
    const partial = current.slice(CAT_PREFIX.length);
    const partialNorm = normalize(partial);
    const matches = portfolio.projects
      .map((p) => p.name)
      .filter((name) => normalize(name).startsWith(partialNorm));

    if (matches.length === 1) return `${CAT_PREFIX}${matches[0]}`;
    if (matches.length > 1) return `${CAT_PREFIX}${longestCommonPrefix(matches)}`;
    return current;
  }

  const matches = KNOWN_COMMANDS.filter((c) => c.startsWith(lower));
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) return longestCommonPrefix(matches);
  return current;
}

function skillsGraphLines(): string[] {
  const order: string[] = [];
  const grouped = new Map<string, string[]>();

  for (const skill of portfolio.skills) {
    if (!grouped.has(skill.category)) {
      grouped.set(skill.category, []);
      order.push(skill.category);
    }
    grouped.get(skill.category)!.push(skill.name);
  }

  const lines: string[] = [];
  order.forEach((category, i) => {
    if (i > 0) lines.push("");
    lines.push(`${category}:`);
    lines.push(`  ${grouped.get(category)!.join(", ")}`);
  });
  return lines;
}

function contactLines(): string[] {
  const rows: [string, string | undefined][] = [
    ["Email", portfolio.email],
    ["GitHub", portfolio.github],
    ["LinkedIn", portfolio.linkedin],
    ["Medium", portfolio.medium],
  ];
  const present = rows.filter((row): row is [string, string] => !!row[1]);
  const width = Math.max(...present.map(([label]) => label.length)) + 1;
  return present.map(([label, value]) => `${(label + ":").padEnd(width + 1)}${value}`);
}

function hireEasterEgg(): string[] {
  return [
    "[sudo] password for visitor: ********",
    "Permission granted.",
    "",
    "Booting hiring.exe ...",
    `Loading ${portfolio.role} skill set ... done`,
    "Compiling project portfolio ... done",
    "Provisioning enthusiasm ... done",
    "",
    `${portfolio.name} is open to opportunities in Generative AI engineering.`,
    "",
    `Get in touch: ${portfolio.email}`,
  ];
}

const HELP_LINES = [
  "Available commands:",
  "  help                   Show this help message",
  "  whoami                 Display identity summary",
  "  ls projects            List all projects",
  "  cat projects/<name>    Show details for a project",
  "  skills --graph         List skills grouped by category",
  "  contact                Show contact information",
  "  sudo hire kanishk     ???",
];

function runCommand(raw: string): string[] {
  const trimmed = raw.trim();
  if (trimmed === "") return [];

  const lower = trimmed.toLowerCase();

  if (lower === "help") return HELP_LINES;
  if (lower === "whoami") return [portfolio.name, portfolio.role, portfolio.tagline];
  if (lower === "ls projects") return portfolio.projects.map((p) => p.name);

  if (lower.startsWith(CAT_PREFIX)) {
    const query = trimmed.slice(CAT_PREFIX.length).trim();
    const project = fuzzyFindProject(query);
    if (!project) {
      return [`cat: projects/${query}: No such file or directory`];
    }
    return [
      project.name,
      "",
      project.description,
      "",
      `tech: ${project.tech.join(", ")}`,
      `link: ${project.link}`,
    ];
  }

  if (lower === "skills --graph") return skillsGraphLines();
  if (lower === "contact") return contactLines();
  if (lower === "sudo hire kanishk") return hireEasterEgg();

  return [`command not found: ${trimmed}. Type 'help'.`];
}

// ── component ────────────────────────────────────────────────────────────

interface Entry {
  id: number;
  kind: "banner" | "input" | "output";
  text: string;
}

const PROMPT_HOST = `${(portfolio.name.split(" ")[0] || "guest").toLowerCase()}@portfolio`;

export default function TerminalMode() {
  const prefersReduced = useReducedMotion();
  const nextId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [fadeStyle, setFadeStyle] = useState<{ opacity: number; transition: string }>({
    opacity: 1,
    transition: "none",
  });
  const [entries, setEntries] = useState<Entry[]>(() => [
    { id: -1, kind: "banner", text: `Portfolio Terminal — type 'help' to get started.` },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  // Mode-switch entrance: a subtle fade, skipped entirely under
  // prefers-reduced-motion. This lives outside the normal AnimatedSection
  // tree, so it checks the media query directly.
  useEffect(() => {
    let reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      reduced = false;
    }
    if (reduced) {
      // Triggers a CSS-transition-driven fade-in on mount; matchMedia is
      // client-only so this can't run during the lazy useState initializer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFadeStyle({ opacity: 1, transition: "none" });
      return;
    }
    setFadeStyle({ opacity: 0, transition: "none" });
    const raf = requestAnimationFrame(() => {
      setFadeStyle({ opacity: 1, transition: "opacity 0.4s ease" });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const appendEntry = useCallback((kind: Entry["kind"], text: string) => {
    nextId.current += 1;
    // Capture as a plain value, not a read of the ref inside the updater —
    // when appendEntry is called twice synchronously (input then output),
    // both setEntries updaters would otherwise run after the ref has already
    // been incremented twice, reading the same final value for both entries
    // and producing a duplicate React key.
    const id = nextId.current;
    setEntries((prev) => [...prev, { id, kind, text }]);
  }, []);

  const submit = useCallback(() => {
    const raw = inputValue;
    const trimmed = raw.trim();

    appendEntry("input", raw);

    if (trimmed !== "") {
      setCmdHistory((h) => [...h, trimmed]);
      const output = runCommand(raw);
      if (output.length > 0) {
        appendEntry("output", output.join("\n"));
      }
    }

    setHistoryIndex(null);
    setDraft("");
    setInputValue("");
  }, [inputValue, appendEntry]);

  const navigateHistory = useCallback(
    (direction: -1 | 1) => {
      if (cmdHistory.length === 0) return;

      if (direction === -1) {
        if (historyIndex === null) {
          setDraft(inputValue);
          const idx = cmdHistory.length - 1;
          setHistoryIndex(idx);
          setInputValue(cmdHistory[idx]);
        } else if (historyIndex > 0) {
          const idx = historyIndex - 1;
          setHistoryIndex(idx);
          setInputValue(cmdHistory[idx]);
        }
      } else {
        if (historyIndex === null) return;
        if (historyIndex < cmdHistory.length - 1) {
          const idx = historyIndex + 1;
          setHistoryIndex(idx);
          setInputValue(cmdHistory[idx]);
        } else {
          setHistoryIndex(null);
          setInputValue(draft);
        }
      }
    },
    [cmdHistory, historyIndex, inputValue, draft]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        navigateHistory(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        navigateHistory(1);
      } else if (e.key === "Tab") {
        e.preventDefault();
        setInputValue((current) => completeInput(current));
      }
    },
    [submit, navigateHistory]
  );

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col bg-[#0a0a0a] font-mono text-[13px] text-[#ededed] sm:text-sm"
      style={fadeStyle}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs text-white/40">
        <span className="h-2.5 w-2.5 rounded-full bg-[#6366f1]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#a78bfa]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#22d3ee]/70" />
        <span className="ml-2">{PROMPT_HOST} — terminal</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={prefersReduced ? undefined : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mb-1.5"
          >
            {entry.kind === "input" ? (
              <div>
                <span className="text-cyan-400">{PROMPT_HOST}</span>
                <span className="text-white/40">:~$ </span>
                <span>{entry.text}</span>
              </div>
            ) : (
              <pre className={`whitespace-pre-wrap font-mono ${entry.kind === "banner" ? "text-white/40" : "text-[#ededed]/90"}`}>
                {entry.text}
              </pre>
            )}
          </motion.div>
        ))}
      </div>

      {/* Extra bottom padding on narrow viewports reserves room for the
          fixed ThemeSwitcher pill (bottom-right, layout.tsx) so it doesn't
          sit on top of the input row's tap/click target. */}
      <div className="border-t border-white/10 px-4 py-3 pb-16 sm:pb-3">
        <label className="flex items-center gap-2">
          <span className="text-cyan-400 shrink-0">{PROMPT_HOST}</span>
          <span className="text-white/40 shrink-0">:~$</span>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal command input"
            className="flex-1 bg-transparent outline-none text-[#ededed] caret-[#818cf8] min-w-0"
          />
        </label>
      </div>
    </div>
  );
}
