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

## Gotchas

- Put JSX in `.jsx` files — esbuild parses JSX across linked workspace packages; `.js` won't.
- `frames.js` is verbatim graphics — don't refactor; it's eslint/prettier-ignored.
- Root scripts call `pnpm` recursively → pnpm must be on PATH.
- "Don't touch casually" zones: token-creator `frames.js` and character-forge `i18n.js` (10 languages).
