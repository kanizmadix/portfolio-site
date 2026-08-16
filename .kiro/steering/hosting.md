# Hosting & deployment

Everything Kanishk S ships publicly runs on GitHub Pages under the `kanizmadix`
account, free, with no server and no API keys in any deployment. This file is the
source of truth for how that is wired.

## Live URLs

| Site | URL | Source of the deployed files |
|---|---|---|
| Portfolio | https://kanizmadix.github.io/portfolio-site/ | Next.js static export -> `out/` |
| Résumé Generator | https://kanizmadix.github.io/ai-resume-generator/ | `host/` |
| SQL Assistant | https://kanizmadix.github.io/ai-sql-assistant/ | `host/` |
| Multi-Agent Planner | https://kanizmadix.github.io/ai-multi-agent-planner/ | `host/` |
| Document Q&A | https://kanizmadix.github.io/ai-document-qa/ | `host/` |
| OpenTrails | https://kanizmadix.github.io/opentrails/ | `host/` |
| Nova (multilingual) | https://kanizmadix.github.io/super-nova/ | `host/` |
| Nova (desktop control) | https://kanizmadix.github.io/voice-nova/ | `host/` |

All eight have Pages enabled with `build_type=workflow` (set via
`gh api --method POST /repos/kanizmadix/<repo>/pages -f build_type=workflow`).

## The core constraint

GitHub Pages is a static file CDN. It runs no Python, so none of the FastAPI
projects can actually execute there. Visitors clone the repo, add their own
`ANTHROPIC_API_KEY`, and run it locally. **No key of Kanishk's is ever deployed.**

Each project therefore gets a static *showcase page*, not a working app. Every page
states this plainly in a "Why this page isn't the app itself" section rather than
implying a live demo.

## Rule: never touch functionality code

Deploy assets live only in `host/` plus `.github/workflows/pages.yml`. Each of the
seven project commits added exactly four files and modified zero existing ones.
Verify any future change the same way:

```bash
git diff --name-only HEAD~1 HEAD --diff-filter=M | grep -v '^host/'   # must be empty
```

## How the project pages deploy

Each of the seven repos has:

```
host/index.html    self-contained page, no build step, no dependencies
host/styles.css    shared stylesheet (identical across all seven)
host/.nojekyll     belt-and-braces; Pages' artifact deploy skips Jekyll anyway
.github/workflows/pages.yml
```

`pages.yml` uploads `host/` straight to Pages via
`configure-pages@v5` -> `upload-pages-artifact@v3` -> `deploy-pages@v4`. It triggers
only on pushes touching `host/**` or the workflow itself, plus `workflow_dispatch`,
so it stays out of the way of the pre-existing `ci.yml` in each repo.

Asset paths inside `host/index.html` are **relative** (`styles.css`, `#quickstart`),
which is why these pages need no basePath despite being served from a `/<repo>`
subpath. Keep them relative.

To edit a page, edit `host/index.html` directly and push — it's plain HTML. Design
tokens live in `:root` in `host/styles.css`: dark `#08080b` background, indigo
`#8b8bf8` accent, amber `#fbbf24` for the API-key warnings.

## How the portfolio deploys

`portfolio-site` is Next.js 16 with `output: "export"`. `next.config.ts`:

- `basePath`/`assetPrefix` are `/portfolio-site` **only** when `GITHUB_PAGES === "true"`,
  which is set solely in the deploy workflow. Local `npm run dev` stays at the root.
- `images: { unoptimized: true }` because the Image optimizer needs a running server.
- `env: { NEXT_PUBLIC_BASE_PATH: basePath }` exists for one reason, see the gotcha below.
- `trailingSlash: true` so Pages resolves routes without a rewrite layer.

`.github/workflows/deploy.yml` builds with `GITHUB_PAGES=true` and uploads `out/`.

All personal data is in `data/portfolio.ts`. Contact cards derive their visible
label from the URL via `displayUrl()` in `sections/Contact.tsx`, and cards with an
empty URL are filtered out instead of rendering a dead link.

## Gotchas that cost time

1. **`unoptimized` images skip basePath.** `next/image` does not prefix the `src`
   when `unoptimized: true`, so `/hero.png` would 404 at `/portfolio-site/`.
   `sections/Hero.tsx` prefixes it manually with `NEXT_PUBLIC_BASE_PATH`. Any new
   `/public` image referenced through `next/image` needs the same treatment.
2. **`npm run start` no longer works** in portfolio-site. `next start` needs a
   server and `output: "export"` doesn't produce one. Use `npm run dev`, or serve
   `out/` with any static file server.
3. **Never split an SVG `path` across concatenated string literals.** Doing so
   silently drops the spaces between coordinate pairs and corrupts the glyph. The
   GitHub icon broke this way; keep long paths on one line.
4. **`gh` has two accounts** logged in: `kanishk-aivar` and `kanizmadix`. All of
   these repos belong to `kanizmadix`, so pushes and Pages API calls need
   `gh auth switch -u kanizmadix` first. The active account is currently
   `kanizmadix` (switched away from `kanishk-aivar`).
5. **`ai-multi-agent-planner` CI is red and was already red** before any of this
   work. The `Lint` step fails on `agents/*.py`; unrelated to `host/`.

## Verify a deploy

```bash
gh run list -R kanizmadix/<repo> --workflow "Deploy showcase page" --limit 1
curl -s -o /dev/null -w '%{http_code}' https://kanizmadix.github.io/<repo>/
```

A green workflow is not proof the site works. Always curl the real URL, and check
`styles.css` resolves too.

## Content accuracy

Showcase page copy was derived by reading each repo's actual source, not its README,
because several READMEs are stale or overstated:

- `ai-resume-generator`'s README documents 2 endpoints; `main.py` exposes 8.
- `voice-nova`'s `dashboard/index.html` polls `localhost:8000/history`, an endpoint
  no code in that repo implements. The page says so rather than implying it works.
- `voice-nova` imports `pyttsx3` but omits it from `requirements.txt`, so the
  quickstart installs it explicitly.
- Unverifiable README claims (e.g. "~90% cheaper") were deliberately left out.

Keep this standard: if a claim isn't in the code, it doesn't go on the page.

## Commits that set this up

Revert targets if any of this needs undoing:

| Repo | Commit | What it did |
|---|---|---|
| portfolio-site | `8c7c8b7` | Pages deploy via static export; real LinkedIn/GitHub URLs |
| portfolio-site | `c803b3b` | Cards point at showcase pages; added OpenTrails + both Nova cards |
| ai-resume-generator | `9f63941` | `host/` page + `pages.yml` |
| ai-sql-assistant | `3581f5a` | `host/` page + `pages.yml` |
| ai-multi-agent-planner | `0868568` | `host/` page + `pages.yml` |
| ai-document-qa | `a994df9` | `host/` page + `pages.yml` |
| opentrails | `fb19a41` | `host/` page + `pages.yml` |
| super-nova | `fa5a26d` | `host/` page + `pages.yml` |
| voice-nova | `9d21743` | `host/` page + `pages.yml` |

## Open items

- The `/portfolio-site` subpath exists only because of the repo name. Renaming the
  repo to `kanizmadix.github.io` would serve it at the domain root and let the
  basePath config be deleted entirely. Not done — a rename breaks existing links.
- `Movie-Recommender-System-master` and `Formula1` have no showcase page; their
  portfolio cards link straight to the repos.
- If a genuinely clickable demo is ever wanted, it needs a Python-capable host
  (Render, Fly.io, Hugging Face Spaces) plus a per-request key field in the UI so
  the visitor supplies their own key. That is a code change in each repo.
