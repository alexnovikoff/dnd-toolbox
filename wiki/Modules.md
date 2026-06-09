# Modules

## Character Forge (`@dnd/character-forge`)

A multilingual D&D character generator (tag `#c0563f`, icon `character`, group
`creation`).

- **10 languages** preserved verbatim (`src/i18n.js`): ru, en, de, fr, es, it,
  pt, pl, ja, zh — including grammatical-gender handling for gendered languages.
- **Inputs:** name / race / class / vibe (with dice randomizers), gender and
  length toggles, language select. "Randomize all" fills name+race+class.
- **Output:** five sections (backstory, personality, goals, flaws, secret desire),
  each individually regenerable; copy-all to clipboard.
- **AI:** via the server proxy only (`src/api.js` → `/api/generate`). No key in
  the client. See [[API Proxy|API-Proxy]]. Without a key it shows a clear error.
- **Styling:** all chrome uses design-system tokens/components — the original
  hardcoded charcoal/gold hex values are gone.

## Token Creator (`@dnd/token-creator`)

Circular character tokens with procedural frames for Foundry VTT and the table
(tag `#3f93a0`, icon `token`, group `assets`).

- **10 built-in frames** (`src/frames.js`): Foundry Steel, Foundry Bronze, Gold
  Ornate, Silver Clean, Dark Iron, Wooden, Arcane, Nature, Draconic, Celestial.
  The drawing code is **verbatim** from the original tool — do not edit it (it's
  in `.prettierignore` / `.eslintignore` to stay byte-faithful). This is the one
  sanctioned exception to "no local hex": it's functional graphics.
- **Portrait:** drag-and-drop or click to upload; mouse-wheel to zoom; drag on the
  canvas to reposition.
- **Custom frames:** upload a transparent PNG, name it, and it joins the grid
  (rename/delete supported).
- **Export:** PNG at 256 / 512 / 1024 px, circular-clipped, with a custom filename.
- **Styling:** UI chrome uses the design system; the `<canvas>` reads raw colors
  from `useTheme().palette` (canvas can't consume CSS variables).

## Coming soon

Placeholders in `apps/hub/src/comingSoon.js` (NPC Generator, Loot Generator,
Tavern Builder, City Forge) render on the launcher and sidebar. Build one by
following [[Adding a Module|Adding-a-Module]] and removing its placeholder.
