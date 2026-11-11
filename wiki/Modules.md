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
  (rename/delete supported). The portrait is limited to the frame's outer
  silhouette, read from its alpha channel (`src/frame-mask.js`), so it never shows
  on the transparent background around the frame.
- **Export:** PNG at 256 / 512 / 1024 px, clipped to the frame (circular for
  built-in frames). The filename is prefilled from the portrait's (`hero.png` →
  `hero_token`) and can be edited; loading another portrait replaces it.
- **Styling:** UI chrome uses the design system; the `<canvas>` reads raw colors
  from `useTheme().palette` (canvas can't consume CSS variables).

## Tavern Builder (`@dnd/tavern-builder`)

A bilingual tavern generator for the GM (tag `#b07a3f`, icon `tavern`, group
`locations`), built from the `reference_sources/design_handoff_tavern_builder/` package (layout A
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

## NPC Generator (`@dnd/npc-generator`)

A bilingual NPC generator for the GM (tag `#8a6cc0`, icon `npc`, group
`creation`). The main roll is instant and free; AI is an optional extra step.

- **Table-driven main roll:** `src/tables/*.js` (original RU/EN content, hand
  formatted, `.prettierignore`) + `src/engine.js` (pure logic). `data.test.js`
  guards the table shape and the size of every tone/occupation pool.
- **Three levels, one NPC:** every field is rolled up front and the level only
  decides how much is shown, so a passer-by the players latch onto grows into a
  key NPC without a reroll.
  - _Прохожий:_ who, name, occupation, detail, manner, attitude, current want.
  - _Постоянный:_ adds what they know, secret, leverage, background, hook.
  - _Ключевой:_ adds what happens if the party stays out of it, what they can
    offer, what works in conversation, allies and enemies, stock SRD stat block.
- **Filters, all optional:** occupation circle (nine of them), race (eleven),
  gender, tone (everyday, grim, comic, mystic). They apply to the next roll and
  never reroll the current NPC.
- **Fit over randomness:** entries can be tagged by tone (`t`) and occupation
  circle (`c`). `pickFit` only draws entries that fit and favours the specific
  ones, which is what keeps table-rolled NPCs coherent. Each specific entry adds
  5% to their share, up to 60%, so a circle with two of them can't repeat them
  on every other roll.
- **Who can carry an entry:** `minYears` and `maxYears` count years since coming
  of age, `raceOnly` ties a detail to one race, `hair` skips scaly races, `beard`
  skips women and beardless races, and `fighter` splits tactics between those who
  fight for a living and those who don't. A rerolled person is picked to agree
  with what the card holds; an unlocked detail that no longer suits them is
  replaced instead of pinning their race or gender.
- **Allies and enemies:** two lists joined into one line, tagged by occupation
  circle like «Знает», so a forester and a court schemer keep different company.
- **Russian grammar:** `{m|f}` markers (`Служил{|а}`, `сборщи{к|ца}`) resolve at
  display time from the NPC's gender. Write new entries in the present tense
  or mark every gendered word.
- **Locks + rerolls:** per field. A new race or gender also renames the NPC and
  a new occupation moves the stat block and swaps a tactic that no longer fits,
  unless those fields are locked.
- **AI step («Углубить с ИИ»):** the button appears only once an NPC exists and
  every run goes through a Да/Нет question with an optional hint. Via the server
  proxy (`mode: "npc_deepen"` → `{ fields }`). It ties the draft into one person
  and adds a spoken line; locked fields, identity, attitude and the stat block
  are left alone. AI text is an overlay stored per field with its language, so
  «Вернуть таблицы» restores the draft and other languages show the table text.
  Quota/BYOK rules are the same as Character Forge. See [[API Proxy|API-Proxy]].
- **Crowd:** several passers-by per click; open any of them on the card. «Назад»
  returns to the list, and edits made on the card stay with that person.
  «Сгенерировать полноценного» builds the full form: everything already shown
  stays, and the fields not shown yet are rolled then, with the current filters.
- **My NPCs:** saved list with GM notes and plain-text copy. A saved NPC and the
  one on the card are the same person: edits reach both.
- **State** (`params`, `lang`, `locks`, `view`, `crowdSize`, `npc`, `crowd`,
  `saved`) persists in localStorage under `ddtb_npc`.

## Loot Generator (`@dnd/loot-generator`)

Bilingual treasure for the GM (tag `#c9a84c`, icon `loot`, group `creation`). The
main roll is instant and free; AI is an optional extra step.

- **Four kinds of find:** hoard, dragon's lair (two rolls of treasure), quest
  reward (one hoard by party level, paid by someone, with terms and a catch) and
  off the bodies (per-creature coins plus odd pocket finds, no story, no AI).
- **Calibration, not copied tables:** `src/tables/tiers.js` holds our own
  structure aimed at the published 2024 averages: a hoard of about 500 / 4,400 /
  36,000 / 330,000 gp by danger band, personal treasure of about 10 / 90 / 1,100 /
  9,000 gp per creature, 1.5 / 1.9 / 2.5 / 3.1 magic items a hoard, rarity by band.
  `engine.test.js` rolls thousands of hoards and keeps those averages within 12%.
- **Lumpy on purpose:** a value is drawn around the target (thin finds, the odd
  windfall), then split by theme between coins, gems, art and goods. Sections spend
  their share in whole pieces and the change falls back to coins, so the average
  holds. Some hoards have no coins at all.
- **Themes:** any, arcane (gems, scrolls), martial (coins, bars, arms), trade
  (goods, utility items), relic (art). They decide the mix and lean the item pick.
- **Magic items:** every non-artifact item of SRD 5.2.1 with its rarity, plus our
  own one-line summary and a rolled detail on each. Weapons, armor, damage types
  and spells are rolled so the line is usable as written. The licence notice sits
  in the params column; keep it word for word.
- **Rolling one thing:** «По отдельности» rolls a single coin purse, gem, art
  object, trinket, potion, scroll or item, with its own filters.
- **Locks + rerolls:** per section and per item. Rerolls use the find's own
  settings, not the current filters. The value shown to the party is split by the
  party size at display time, so changing it never rerolls.
- **AI step («Оживить с ИИ»):** only for finds with a story, always through a
  Да/Нет question with an optional hint. Via the server proxy
  (`mode: "loot_enliven"` → `{ fields }`). It writes a read-aloud description, ties
  the story lines together and gives each item a detail; coins, gems and items
  themselves are never touched. AI text is an overlay per field with its language,
  so «Вернуть таблицы» restores the draft. Quota/BYOK rules are the same as
  Character Forge. See [[API Proxy|API-Proxy]].
- **My finds:** saved list with GM notes and plain-text copy. A saved find and the
  one on the card are the same find: edits reach both.
- **State** (`params`, `lang`, `locks`, `view`, `haul`, `saved`, `picks`,
  `quickOpts`) persists in localStorage under `ddtb_loot`.

## Coming soon

Placeholders in `apps/hub/src/comingSoon.js` (City Forge) render
on the launcher and sidebar. Build one by following
[[Adding a Module|Adding-a-Module]] and removing its placeholder.
