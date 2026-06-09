# Design System (`@dnd/design-system`)

The single source of styling for the hub and every module. The authoritative
spec is [`DESIGN_SYSTEM.md`](https://github.com/) at the repo root (high-fidelity,
final values); this page covers how to **use** it in code.

## Tokens as CSS variables

`tokens.css` defines neutral tokens per theme and a default accent block:

```css
:root[data-theme='dark']  { --ds-bg:#0f0d0a; --ds-panel:#171310; --ds-raised:#211a13;
                            --ds-text:#ece3d0; --ds-muted:#9a8e77; --ds-faint:#6b6253;
                            --ds-line2:rgba(236,227,208,.07); --ds-on-accent:#14100a; }
:root[data-theme='light'] { --ds-bg:#ece3cf; /* …Vellum… */ }
```

`ThemeProvider` sets `data-theme` on `<html>` and writes the **accent-derived**
tokens from the chosen accent via `makePalette()`:

| Token | Meaning |
|---|---|
| `--ds-accent` | accent color for the current theme |
| `--ds-accent-bright` | brighter accent (hovers) |
| `--ds-glow` | translucent accent (active/"ready" backgrounds) |
| `--ds-line` | accent hairline (active items, "ready" borders) |
| `--ds-on-accent` | text/icon on an accent fill |
| `--ds-line2` | neutral divider line |
| `--ds-danger` | error/feedback red |

**Components read `var(--ds-*)`** in inline styles. The resolved palette object is
also available via `useTheme().palette` for the few places that need a raw color
string (a `<canvas>` fill, an accent swatch) — CSS variables can't be used there.

## Themes & accents

- Themes: `dark` (Obsidian, default) and `light` (Vellum).
- Accents: `gold` (default), `crimson`, `teal`, `violet`, `emerald`, `copper` —
  each with a dark/light pair. Switch via `AppearanceControls` or
  `useTheme().setAccent(id)` / `toggleTheme()`.

## Typography

`Cinzel` (brand/headings) + `Public Sans` (UI), loaded in `apps/hub/index.html`.
Use the exported `SERIF` / `SANS` constants (mirror `--ds-font-serif` /
`--ds-font-sans`).

## Components

```js
import {
  ThemeProvider, useTheme, Icon,
  Button, BrandMark, StatusTag, IconChip, ToolCard, GoldRule,
  Sidebar, AppShell, AppearanceControls,
  Field, Select, Slider, ToggleGroup,
  SANS, SERIF, makePalette, ACCENTS,
} from '@dnd/design-system';
```

- **`Button`** — `primary` (accent fill) / `secondary` / `ghost`; optional `icon`.
- **`ToolCard`** — `feature` | `tile` | `row`; takes a manifest + `groupLabel`.
- **`AppShell`** — module frame (sidebar + breadcrumb + work area).
- **`Field` / `Select` / `Slider` / `ToggleGroup`** — form controls on `--ds-raised`.
- **`Icon`** — line icons (24×24, `currentColor`, stroke 1.6). Add new icons to
  `icons.jsx`.

## Rules

1. **Style only through the design system.** No local hex in modules — the one
   exception is *functional graphics* (e.g. the Token Creator's frame drawing).
2. **Don't animate `border-color` to `transparent`** (it can get "stuck" in some
   browsers — `DESIGN_SYSTEM.md §6`). Toggle border colors instantly; animate
   `transform` / `box-shadow` / `background`. `components.css` follows this.
3. **Work in both themes and all accents.** Never hardcode a neutral or accent.
4. A module's `accent` tag is intentionally a literal hex (theme-independent).
