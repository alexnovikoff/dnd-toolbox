# Architecture

## Workspace

A **pnpm workspace** with three kinds of package:

```
apps/hub             @dnd/hub             host app: launcher + module shell + /api proxy
packages/design-system  @dnd/design-system  shared tokens / theme / icons / components
modules/*            @dnd/<module>        a tool: exports { manifest, Component }
```

`pnpm-workspace.yaml` globs `apps/*`, `packages/*`, `modules/*`. Packages are
consumed as **source** (no build step) — their `package.json` `exports`/`main`
point at `src/`. Vite (with `@vitejs/plugin-react`) transforms the JSX directly;
because pnpm symlinks resolve to real paths under `packages/`/`modules/`, the
React plugin processes them like first-party code. `apps/hub/vite.config.js` sets
`server.fs.allow` to the workspace root so those sources can be served in dev.

Only `@dnd/hub` is an application (has Vite + a `build`). The design system and
modules are libraries.

## Module contract

Every module's `src/index.jsx` exports exactly:

```jsx
export const manifest = { id, name, description, group, icon, accent, status };
export { Component };  // default React component for the tool body
```

- `group`: `creation | assets | locations` (a key; the hub maps it to a label).
- `icon`: a name from the shared icon set.
- `accent`: the module's **permanent color tag** (a literal hex, theme-independent).
- `status`: `ready | soon`.

## The hub

- **`registry.js`** imports each module namespace and exposes `MODULES`,
  `manifests`, and `getModule(id)`. This is the *only* place a module is wired in.
- **`comingSoon.js`** holds placeholder manifests (NPC/Loot/Tavern/City) so the
  launcher shows the full set; remove a placeholder when its real module ships.
- **`Launcher.jsx`** = the home grid: hero, "Готовы к работе" (ready modules,
  `feature` cards), "Скоро в наборе" (`tile` cards), top bar with search +
  `AppearanceControls`.
- **`ModuleShell.jsx`** wraps a module in `AppShell` (grouped sidebar + breadcrumb
  + work area), building the sidebar groups from all manifests.

## Routing

`react-router` (`BrowserRouter`):

| Path | Screen |
|---|---|
| `/` | Launcher |
| `/tool/:id` | `ModuleShell` → the module's `Component` |
| `*` | redirect to `/` |

Unknown or not-yet-built ids redirect home. (The prototype kept the view in
`localStorage`; production uses the URL so deep links, back/forward, and reloads
work.)

## Theme state

`ThemeProvider` (in the design system) holds `theme` (`dark`/`light`) and `accent`
(id), writes the `--ds-*` CSS variables onto `<html>`, and persists both to
`localStorage` (`ddtb_theme`, `ddtb_accent`). `useTheme()` exposes
`{ theme, accent, palette, toggleTheme, setAccent }`.

## Data flow (Character Forge)

```
CharacterForge → api.js → POST /api/generate → _core.js → Anthropic Messages API
```

The browser sends only generation parameters. `_core.js` builds the prompt and
calls Anthropic with the server-side key. See [[API Proxy|API-Proxy]].

## Tooling

ESLint + Prettier at the root; Vitest smoke tests (jsdom) per package; GitHub
Actions runs install → lint → `pnpm -r build` → test.
