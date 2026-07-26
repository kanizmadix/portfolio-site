# Kanishk S — Portfolio

Next.js 16 · Tailwind CSS v4 · Framer Motion · TypeScript

## Dev

```bash
npm install
npm run dev   # http://localhost:3000
```

## Swapping your photo

Replace `/public/hero.png` with any image — keep the filename or update the `src` prop in `sections/Hero.tsx` (the `<Image src="/hero.png" …>` line). Portrait crops work best (`object-cover object-top`).

## Editing your content

**All personal data lives in `data/portfolio.ts`** — one file, fully typed. Edit there to update:

| Key | What it controls |
|---|---|
| `name`, `role`, `tagline`, `bio` | Hero text and About bio |
| `email`, `github`, `linkedin` | Nav "Hire me" link + Contact cards |
| `skills[]` | Skill pills — set `category` for colour-coding |
| `projects[]` | Project cards — `link` goes to repo or live demo |
| `experience[]` | Timeline entries |
| `certifications[]` | Cert badges in the About panel |
| `education` | Education card in About |

Replace `[YOUR-LINKEDIN-HANDLE]` in the `linkedin` field with your actual LinkedIn slug (e.g. `linkedin.com/in/kanishks`).

## Phase 2 — Scroll image sequence

See the comment block at the bottom of `sections/Hero.tsx`. In short:

1. Export JPEG frames to `/public/sequence/frame-001.jpg`, `frame-002.jpg`, …
2. Implement the `useScroll` / `useTransform` frame-index logic described in the comment.
3. Make the section taller (200–300 vh) to control playback speed.
