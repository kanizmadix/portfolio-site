# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Portfolio Website (root)

The root of this repo **is** the portfolio website itself — a Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion 12 site for Kanishk S.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint    # eslint
```

### Key files

| Path | Role |
|---|---|
| `data/portfolio.ts` | Single source of truth for all content (name, bio, projects, experience, skills, certs) |
| `sections/Hero.tsx` | Sticky parallax-exit hero — entrance on load, layers drift on scroll |
| `sections/About.tsx` / `Skills.tsx` / `Projects.tsx` / `Experience.tsx` / `Contact.tsx` | Page sections |
| `components/Nav.tsx` | Fixed nav with scroll-progress bar |
| `components/ui/SmoothScroll.tsx` | Lenis smooth scroll wrapper (`anchors: true`) |
| `components/ui/Cursor.tsx` | Custom cursor (dot + trailing ring) |
| `components/ui/AnimatedSection.tsx` | `whileInView` entrance wrapper used by all non-hero sections |
| `public/hero.png` | Profile photo |

### Critical: framer-motion scroll-linked opacity

**Never use the array form of `useTransform` for scroll-linked opacity on pinned/top-of-page sections.** framer-motion 12 promotes array-form transforms to native WAAPI `ViewTimeline` animations. For a section at the top of the page taller than the viewport (like the 200vh sticky hero), the browser resolves a degenerate `contain` range and the value freezes at its initial state — invisible forever.

Use the **function form** instead — it cannot be keyframe-serialised and always stays on the correct JS-driven path:

```ts
// BAD — gets promoted to WAAPI, breaks for top-of-page pinned sections
const exitOp = useTransform(scrollYProgress, [0, 0.45, 0.85], [1, 1, 0]);

// GOOD — JS-driven, always correct
const exitOp = useTransform(() => transform(scrollYProgress.get(), [0, 0.45, 0.85], [1, 1, 0]));
```

`y`, `scale`, and other composed transforms stay on JS automatically (can't be serialised), so they work fine either way — which makes opacity-only failures very confusing to diagnose.

Also: do **not** put `scroll-behavior: smooth` on `html` when Lenis is active. Use `anchors: true` in the Lenis config instead.

---

## AI Projects (separate repositories — NOT in this repo)

These projects used to live in sub-directories here; they now each have their own
repository under `github.com/kanizmadix`. **This repo is the portfolio site only** — it has no
Python, no backend, and no API keys. The notes below are kept as reference for those repos.

They are deliberately not deployed as live demos, since running them would require shipping an
`ANTHROPIC_API_KEY`. Users clone a repo, supply their own key in `.env`, and run it locally.

| Project | What it does |
|---|---|
| `resume-generator/` | AI résumé + cover letter generator with ATS scoring and PDF export |
| `meeting-assistant/` | AI transcript analyser with 3-stage pipeline and iCalendar export |
| `document-qa/` | RAG-based document Q&A (FAISS + sentence-transformers) |
| `sql-assistant/` | Natural-language → SQL with a schema-aware prompt-cached query engine |
| `multi-agent-planner/` | 3-agent orchestration (Planner → Executor → Validator) with SSE streaming |

Additional projects: `azureawscalc/`, `opentrails/`, `super-nova/` (desktop voice, no server), `voice-nova/` (voice + Playwright browser automation).

## Commands

Every web project has a `Makefile` with identical targets:

```bash
make install        # pip install -r requirements.txt
make dev            # uvicorn main:app --reload --port 8000
make test           # pytest tests/ -q
make lint           # ruff check .
make format         # ruff check --fix . && ruff format .
make docker-build   # docker build -t <project>:latest .
make docker-run     # docker run --rm -p 8000:8000 --env-file .env <project>:latest
make clean          # remove __pycache__, .pytest_cache, etc.
```

Run a single test: `pytest tests/test_foo.py::test_bar -q`

CI (`.github/workflows/ci.yml`) runs `ruff check .` then `pytest tests/ -q` against Python 3.11 with a stub `ANTHROPIC_API_KEY=test-key-not-used`, so tests must not make live API calls.

## Shared Architecture Pattern

All web projects follow the same structure:

- **`main.py`** — FastAPI app, CORS middleware, route definitions
- **`models.py`** — Pydantic request/response schemas
- **`config.py`** — Pydantic `Settings` loaded from `.env` (only `ANTHROPIC_API_KEY` is required globally)
- **`prompts.py`** — System/user prompts; stable prefixes tagged `cache_control: {"type": "ephemeral"}` for Anthropic prompt caching
- **`logger.py`** / **`rate_limiter.py`** — Shared infra helpers (token-bucket rate limiting)
- **`storage.py`** — SQLite persistence via `sqlite3` (no ORM except in `opentrails/` which uses SQLAlchemy)
- **`templates/index.html`** — Vanilla HTML/CSS/JS frontend; no build step

Model used everywhere: `claude-sonnet-4-6`. Configured in `config.py` as `MODEL`.

## Key Architecture Decisions

**Prompt caching** — All 5 main projects apply `cache_control: {"type": "ephemeral"}` to system prompts. Cached prefix costs ~10% of normal input tokens after the first request within a 5-minute window.

**In-memory sessions vs SQLite** — `document-qa` stores FAISS indexes and `multi-agent-planner` stores run states in Python dicts (fast for demos, not persistent across restarts). Projects that need history (resume-generator, meeting-assistant, sql-assistant) use SQLite files committed alongside the app.

**SSE streaming** (`multi-agent-planner`) — The orchestrator runs agent calls in a thread pool via `asyncio.run_in_executor`, then pushes typed SSE events (`status`, `steps`, `step_result`, `validation`, `done`, `error`) to the frontend.

**SQL safety** (`sql-assistant`) — `db.py` enforces a SELECT-only whitelist and blocks any write keywords before executing generated queries against `ecommerce.db` (pre-seeded SQLite, committed to the repo).

**RAG pipeline** (`document-qa`) — PDF → PyMuPDF text → 500-char chunks (50-char overlap) → `all-MiniLM-L6-v2` embeddings → FAISS index → top-k retrieval → Claude Q&A with citations.

**3-stage meeting pipeline** (`meeting-assistant`) — Transcript Parser → Summarizer → Action Extractor. Each stage is a separate Claude call; output is a structured `MeetingAnalysis` Pydantic model.

## Linting Config

All projects share the same `pyproject.toml` ruff config:
- Line length: 110
- Target: Python 3.11
- Enabled rule sets: `E`, `F`, `W`, `I`, `B`, `UP`
- Ignored: `E501` (long lines), `B008` (FastAPI `Depends` defaults)

## Running Multiple Projects Simultaneously

All projects default to port 8000. To run more than one at a time, override the port:

```bash
uvicorn main:app --reload --port 8001
```
