# D&D Toolbox — Wiki

A GM tool hub: one launcher, a shared design system, and pluggable modules. This
wiki is the project handbook. The styling **source of truth** is
[`DESIGN_SYSTEM.md`](https://github.com/) at the repo root — this wiki explains
how the pieces fit together and how to extend them.

## Start here

- **[Architecture](Architecture)** — monorepo layout, the module contract, routing, data flow.
- **[Design System](Design-System)** — tokens, themes, accents, components, and the rules.
- **[Adding a Module](Adding-a-Module)** — the 3-step recipe for a new tool.
- **[API Proxy](API-Proxy)** — the server-side Anthropic proxy (Variant A), env, dev vs prod.
- **[Modules](Modules)** — notes on Character Forge and Token Creator.

## TL;DR

```bash
pnpm install
cp apps/hub/.env.example apps/hub/.env   # add ANTHROPIC_API_KEY (optional)
pnpm dev                                 # http://localhost:5173
```

- Stack: **pnpm workspaces · Vite + React 18 · JSX · react-router**.
- One styling dependency: **`@dnd/design-system`**. No local hex in modules
  (except functional graphics like token frames).
- The Anthropic key lives **only on the server**; the browser calls `/api/generate`.
- New module = folder + `{ manifest, Component }` + one line in `registry.js`.
