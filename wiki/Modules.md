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

## Tavern Builder (`@dnd/tavern-builder`)

A bilingual tavern generator for the GM (tag `#b07a3f`, icon `tavern`, group
`locations`), built from the `design_handoff_tavern_builder/` package (layout A
«Кабинет мастера»).

- **Table-driven, no AI for generation:** `src/data.js` (curated RU/EN content
  tables) + `src/engine.js` (pure generation logic). The handoff originals are
  preserved; the pools were later extended with curated bilingual entries
  (30 adjectives × 34 nouns, 30 rumors/patrons, 20 traits/quirks/secrets …) —
  `data.test.js` guards the table shape. Both files are hand-formatted
  (`.prettierignore`).
- **Four name templates:** «Прилагательное + Существительное» («Пьяный
  Грифон»), «У Барлена» (owner genitive / _Barlen’s_), «Котёл и Корона»
  (_The Cauldron & Crown_) and «Три Кружки» (_The Three Tankards_, numeral
  agrees with RU gender). Taverns saved before templates render via the
  adj+noun fallback.
- **Five blocks** — identity (name + sign + atmosphere), menu (kitchen/cellar
  with prices by wealth tier), owner & staff (with a DM secret), patrons
  (2 + settlement size), rumors (with true/partly/false chips `#4fb487` /
  `#c9a84c` / `#d06a52` — functional graphics, like token frames).
- **Locks + rerolls:** each block can be locked (🔒 survives "Generate" and
  parameter changes); per-block reroll regenerates only that block.
- **Instant language switch:** every table entry carries both locales, so
  РУС/ENG never rerolls; UI chrome stays Russian. RU tavern names agree
  adjective gender with the noun («Пьяная Кружка», but «Пьяный Грифон»).
- **AI only for "Оживить описание":** 2–3 sentences of read-aloud text via the
  server proxy (`mode: "tavern_enliven"` → `{ text }`); the result is stored
  with its language and reset when the identity block rerolls. Quota/BYOK rules
  are the same as Character Forge. See [[API Proxy|API-Proxy]].
- **State** (`params`, `lang`, `locks`, `tavern`) persists in localStorage under
  `ddtb_tavern`.

## Coming soon

Placeholders in `apps/hub/src/comingSoon.js` (NPC Generator, Loot Generator,
City Forge) render on the launcher and sidebar. Build one by following
[[Adding a Module|Adding-a-Module]] and removing its placeholder.
