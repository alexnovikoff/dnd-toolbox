# D&D Toolbox

A hub of tools for D&D Game Masters, built as a **monorepo** with a shared design
system and pluggable modules. Two tools ship today — **Character Forge** (AI
character generator) and **Token Creator** (circular tokens with procedural
frames) — with more slots already laid out in the launcher.

- **Stack:** pnpm workspaces · Vite + React 18 · JavaScript (JSX) · `react-router`
- **Design system:** `@dnd/design-system` — the single source of styling (tokens,
  themes, accents, components). See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).
- **AI proxy:** the Anthropic key lives only on the server (Variant A). The browser
  talks to `/api/generate`; the key is never bundled.
- **Free tier + BYOK:** each browser gets a few free generations on the server key
  (default 10, tracked in a signed cookie); after that the user adds their own
  Anthropic API key, which is stored only in their browser and forwarded per
  request (never logged or persisted server-side).

> Full documentation lives in the **GitHub Wiki** (source under [`wiki/`](./wiki)).

---

## Repository layout

```
dnd-toolbox/
├─ apps/hub/                 # @dnd/hub — launcher + module shell + /api proxy
│  ├─ api/generate.js        # Vercel function (Anthropic proxy)
│  └─ src/{ main, App, registry, Launcher, ModuleShell }
├─ packages/design-system/   # @dnd/design-system — tokens, theme, icons, components
└─ modules/
   ├─ character-forge/       # @dnd/character-forge
   └─ token-creator/         # @dnd/token-creator
```

---

## Quickstart

Requires **Node ≥ 18.12** and **pnpm 9** (`corepack enable` or `npm i -g pnpm`).

```bash
pnpm install

# (optional) enable the AI generator: add your Anthropic key
cp apps/hub/.env.example apps/hub/.env
# edit apps/hub/.env → ANTHROPIC_API_KEY=sk-ant-...

pnpm dev          # → http://localhost:5173
```

`pnpm dev` runs the hub. Both modules open from the launcher and work in both
themes (Obsidian / Vellum) with all six accents. Token Creator needs no key;
Character Forge needs `ANTHROPIC_API_KEY` to generate (it degrades to a clear
error message without one).

### Local Claude Code mode (optional, personal)

If you have [Claude Code](https://www.anthropic.com/claude-code) installed and
logged in, dev can run Character Forge on your Claude subscription instead of an
API key: set `LOCAL_CLAUDE=1` in `apps/hub/.env` (no `ANTHROPIC_API_KEY` needed)
and restart `pnpm dev`. Personal use only — it lives only in the Vite dev
middleware and is never deployed. See the [API Proxy](./wiki/API-Proxy.md) wiki page.

### Scripts (run from the repo root)

| Command | What it does |
|---|---|
| `pnpm dev` | Start the hub dev server (Vite) |
| `pnpm build` | Build all buildable packages (`pnpm -r build`) |
| `pnpm preview` | Preview the production build of the hub |
| `pnpm test` | Run smoke tests (Vitest) |
| `pnpm lint` | ESLint over the workspace |
| `pnpm format` | Prettier write |

---

## Adding a module

Adding a module is **exactly three things** — no edits to the sidebar or launcher:

1. Create `modules/<id>/` with a `package.json` named `@dnd/<id>` that depends on
   `@dnd/design-system` (`workspace:*`).
2. Export `{ manifest, Component }` from `modules/<id>/src/index.jsx`:
   ```jsx
   import Component from './MyTool.jsx';
   export const manifest = {
     id: 'my-tool',
     name: 'My Tool',
     description: 'What it does',
     group: 'creation',   // creation | assets | locations
     icon: 'wand',        // a name from @dnd/design-system icons
     accent: '#8a6cc0',   // permanent color tag
     status: 'ready',     // ready | soon
   };
   export { Component };
   ```
3. Register it in [`apps/hub/src/registry.js`](./apps/hub/src/registry.js): add one
   import and one array entry. If the tool had a "coming soon" placeholder in
   `apps/hub/src/comingSoon.js`, remove it.

Rules: style only through `@dnd/design-system` (no local hex except functional
graphics like token frames); add any new icon to the shared icon set; the module
must work in both themes and all accents. See the
[Adding a Module](./wiki/Adding-a-Module.md) wiki page and
[`DESIGN_SYSTEM.md §10`](./DESIGN_SYSTEM.md).

---

## Deployment (Vercel)

The proxy defaults to a Vercel Serverless Function at `apps/hub/api/generate.js`.

1. Import the repo in Vercel and set **Root Directory = `apps/hub`** (framework:
   Vite — auto-detected).
2. Add the environment variable **`ANTHROPIC_API_KEY`** (Production + Preview).
   Optional: **`FREE_GENERATIONS`** (free generations per browser on the server
   key; default `10`, `0` = always require a user key) and **`QUOTA_SECRET`**
   (HMAC secret for the quota cookie; defaults to a derivation of the API key).
3. Deploy. `apps/hub/vercel.json` adds the SPA rewrite (everything except
   `/api/*` → `index.html`) so client routes like `/tool/token-creator` work.

In local dev, `/api/generate` is served by a Vite middleware that reuses the exact
same handler (`apps/hub/api/_core.js`), so no `vercel dev` is required. Prefer a
different platform? `_core.js` is runtime-agnostic — wrap it in a Cloudflare
Worker / Netlify Function. See the [API Proxy](./wiki/API-Proxy.md) wiki page.

---

## Publishing the Wiki

The Markdown under [`wiki/`](./wiki) is formatted for the GitHub Wiki. After the
repo exists on GitHub (and the Wiki is enabled once via the web UI):

```bash
git clone https://github.com/<you>/dnd-toolbox.wiki.git
cp wiki/*.md dnd-toolbox.wiki/
cd dnd-toolbox.wiki && git add . && git commit -m "Sync wiki" && git push
```
