# D&D Toolbox

pnpm + Vite + React 18 monorepo: a D&D GM tool **hub** with a shared **design system**
and pluggable **modules**. JavaScript/JSX (no TypeScript).

## Commands

Requires pnpm on PATH (`corepack enable`).

```bash
pnpm install
pnpm dev      # hub dev server → http://localhost:5173
pnpm build    # pnpm -r build (all packages)
pnpm test     # vitest smoke tests
pnpm lint     # eslint .
pnpm format   # prettier --write .
```

## Architecture

Workspaces: `apps/*`, `packages/*`, `modules/*` (`pnpm-workspace.yaml`).

- `apps/hub` (`@dnd/hub`) — host: launcher, module shell, routing, server proxy.
- `packages/design-system` (`@dnd/design-system`) — the **only** source of style.
- `modules/*` — tools: `token-creator`, `character-forge`.

Dependency direction is one-way: **hub + modules → design-system**, never reverse.
Modules never import each other; the hub composes them via the registry.

## Adding a module (the core extensibility contract)

1. `modules/<id>/src/index.jsx` exports `{ manifest, Component }` (copy an existing module).
2. Add one import + array entry in `apps/hub/src/registry.js`; drop its `comingSoon.js`
   placeholder if it had one.

Launcher and sidebar rebuild themselves from manifests. See `wiki/Adding-a-Module.md`.

## Key files

- `apps/hub/src/registry.js` — single module-registration point.
- `apps/hub/api/_core.js` — Anthropic logic, shared by the Vercel function
  (`api/generate.js`) and the Vite dev middleware (`api/dev-middleware.js`).
- `packages/design-system/src/tokens.css` + `theme.jsx` — token vars + ThemeProvider/useTheme.
- `DESIGN_SYSTEM.md` (root) — authoritative style values.

## Styling rules (non-negotiable)

- **No hardcoded colors in modules** — use `var(--ds-*)` tokens or design-system
  components. Only exception: functional canvas graphics (token frames).
- **Never animate `border-color` to `transparent`** (transition sticks in some browsers).
  Animate `transform`/`box-shadow`/`background`; switch border-color instantly.
- Themes = CSS vars set by `ThemeProvider` on `<html>`. `useTheme()` →
  `{ theme, accent, palette, toggleTheme, setAccent }`; use `palette` (resolved object)
  only where raw color strings are needed (canvas, swatches). Persisted to localStorage:
  `ddtb_theme`, `ddtb_accent`.

## Secrets / API

Anthropic key is **server-only** (`ANTHROPIC_API_KEY`). The client calls only
`/api/generate` — never put the key, model id, or messages in client code. Dev uses a
Vite middleware proxy (no `vercel dev` needed). `.env` is gitignored; copy
`apps/hub/.env.example`.

Free tier + BYOK: each browser gets `FREE_GENERATIONS` (default 10) on the server
key, counted in a signed cookie (`apps/hub/api/_quota.js`); after that the client
sends the user's own key via `x-user-api-key` (stored in localStorage
`ddtb_user_key`, forwarded in-memory only — never log it). Quota exhausted →
`402 free_quota_exhausted`; bad user key → `401 invalid_user_key`.

## Deployment

- Production: **https://dnd-toolbox-hub.vercel.app** (Vercel project
  `dnd-toolbox-hub`, team `alex-novikov-s-projects`, Root Directory `apps/hub`,
  env `ANTHROPIC_API_KEY` set there).
- **Every push to `main` auto-deploys production.** Run tests/lint/build locally
  before pushing.
- Deployment protection is OFF — the site and `/api/generate` are public. Abuse
  backstops: free-quota cookie + per-IP rate limit + Anthropic console spend cap.
- GitHub Wiki sources live in `wiki/`; publish by copying `wiki/*.md` into a clone
  of `dnd-toolbox.wiki.git` and pushing (branch `master`).
- Planned (handoff brief ready): local Claude Code dev backend —
  `docs/local-claude-mode-handoff.md`.

Smoke-check in dev (no key needed):
`curl -X POST localhost:5173/api/generate -d '{"mode":"full","name":"x","lang":"en"}'`
→ `500` "ANTHROPIC_API_KEY is not set" (wiring OK); `GET` → `405`.

## Gotchas

- Put JSX in `.jsx` files — esbuild parses JSX across linked workspace packages; `.js` won't.
- `frames.js` is verbatim graphics — don't refactor; it's eslint/prettier-ignored.
- Root scripts call `pnpm` recursively → pnpm must be on PATH.
- "Don't touch casually" zones: token-creator `frames.js` and character-forge `i18n.js` (10 languages).
- Desktop-first: the ~680px module column needs viewport ≳1100px beside the 232px sidebar; narrower clips horizontally — widen before responsive/screenshot checks.
- **Never `git add -A` / `git add .`** — stage explicit paths (`git add <file>`). A stray SSH key once got swept into a commit this way; keys/secrets are gitignored but don't rely on it.
