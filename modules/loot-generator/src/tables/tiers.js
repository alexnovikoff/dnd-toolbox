// tiers.js — how much treasure a danger band holds and what it is made of.
//
// The structure and every number below are ours, not a rulebook table. The
// targets are calibrated against the published averages for the 2024 rules:
//   personal treasure per creature ≈ 10 gp / 90 gp / 1,100 gp / 9,000 gp
//   one hoard ≈ 500 / 4,400 / 36,000 / 330,000 gp (magic items not counted)
//   magic items in a hoard 0–3 / 1–3 / 1–4 / 1–6, averaging about 1.5 / 1.9 / 2.5 / 3.1
// Rarity odds follow the published split by tier of play. Hoards are not
// meant to be all alike: LUCK gives lean finds and the odd windfall around the
// same average, and THEME_MIXES include hoards with no coins in them at all.

export const COINS = {
  pp: { ru: 'пм', en: 'pp', gp: 10 },
  gp: { ru: 'зм', en: 'gp', gp: 1 },
  ep: { ru: 'эм', en: 'ep', gp: 0.5 },
  sp: { ru: 'см', en: 'sp', gp: 0.1 },
  cp: { ru: 'мм', en: 'cp', gp: 0.01 },
};

export const KINDS = [
  { id: 'hoard', ru: 'Клад', en: 'Hoard' },
  { id: 'dragon', ru: 'Логово дракона', en: 'Dragon’s lair' },
  { id: 'reward', ru: 'Награда за квест', en: 'Quest reward' },
  { id: 'pockets', ru: 'С тел', en: 'Off the bodies' },
];

export const THEMES = [
  { id: 'any', ru: 'Любой', en: 'Any' },
  { id: 'arcane', ru: 'Магический', en: 'Arcane' },
  { id: 'martial', ru: 'Воинский', en: 'Martial' },
  { id: 'trade', ru: 'Торговый', en: 'Trade' },
  { id: 'relic', ru: 'Реликварный', en: 'Relic' },
];

// k scales the value; items is how a generous or stingy GM shifts the item
// count, on half of the rolls.
export const BOUNTIES = [
  { id: 'lean', ru: 'Скупо', en: 'Lean', k: 0.6, items: -1 },
  { id: 'normal', ru: 'Обычно', en: 'Normal', k: 1, items: 0 },
  { id: 'rich', ru: 'Щедро', en: 'Generous', k: 1.5, items: 1 },
];

export const RARITIES = [
  { id: 'c', ru: 'обычный', en: 'common', gp: 100 },
  { id: 'u', ru: 'необычный', en: 'uncommon', gp: 400 },
  { id: 'r', ru: 'редкий', en: 'rare', gp: 4000 },
  { id: 'v', ru: 'очень редкий', en: 'very rare', gp: 40000 },
  { id: 'l', ru: 'легендарный', en: 'legendary', gp: 200000 },
];

export const CATEGORIES = [
  { id: 'armor', ru: 'Доспехи и щиты', en: 'Armor and shields' },
  { id: 'weapon', ru: 'Оружие', en: 'Weapons' },
  { id: 'ring', ru: 'Кольца', en: 'Rings' },
  { id: 'rod', ru: 'Жезлы', en: 'Rods' },
  { id: 'staff', ru: 'Посохи', en: 'Staffs' },
  { id: 'wand', ru: 'Волшебные палочки', en: 'Wands' },
  { id: 'wondrous', ru: 'Чудесные предметы', en: 'Wondrous items' },
];

// Around an average of 1 (kept that way by a test): mostly ordinary finds,
// sometimes a thin one, and now and then a windfall.
export const LUCK = [
  { w: 15, k: 0.35 },
  { w: 35, k: 0.7 },
  { w: 30, k: 1 },
  { w: 15, k: 1.6 },
  { w: 5, k: 3.25 },
];

export const TIERS = [
  {
    id: 't1',
    cr: '0–4',
    party: '1–4',
    hoard: 500,
    pocket: 10,
    rarity: [{ r: 'c', w: 54 }, { r: 'u', w: 37 }, { r: 'r', w: 9 }],
    items: [{ n: 0, w: 15 }, { n: 1, w: 35 }, { n: 2, w: 35 }, { n: 3, w: 15 }],
    consumable: 0.35,
    gems: [10, 50, 100],
    art: [25, 250],
    goods: [1, 60],
    coins: [
      { w: 30, sp: 0.3, gp: 0.7 },
      { w: 25, cp: 0.05, sp: 0.25, gp: 0.7 },
      { w: 20, gp: 1 },
      { w: 15, sp: 0.6, gp: 0.4 },
      { w: 10, cp: 0.1, sp: 0.5, ep: 0.2, gp: 0.2 },
    ],
    pocketCoins: [
      { w: 35, sp: 0.4, gp: 0.6 },
      { w: 30, cp: 0.1, sp: 0.5, gp: 0.4 },
      { w: 20, gp: 1 },
      { w: 15, cp: 0.3, sp: 0.7 },
    ],
  },
  {
    id: 't2',
    cr: '5–10',
    party: '5–10',
    hoard: 4400,
    pocket: 90,
    rarity: [{ r: 'c', w: 30 }, { r: 'u', w: 51 }, { r: 'r', w: 17 }, { r: 'v', w: 2 }],
    items: [{ n: 1, w: 35 }, { n: 2, w: 40 }, { n: 3, w: 25 }],
    consumable: 0.3,
    gems: [50, 100, 500, 1000],
    art: [25, 250, 750],
    goods: [25, 600],
    coins: [
      { w: 35, gp: 1 },
      { w: 25, sp: 0.1, gp: 0.9 },
      { w: 20, gp: 0.7, pp: 0.3 },
      { w: 12, ep: 0.25, gp: 0.75 },
      { w: 8, cp: 0.02, sp: 0.18, gp: 0.8 },
    ],
    pocketCoins: [
      { w: 40, gp: 1 },
      { w: 30, sp: 0.3, gp: 0.7 },
      { w: 20, ep: 0.3, gp: 0.7 },
      { w: 10, gp: 0.6, pp: 0.4 },
    ],
  },
  {
    id: 't3',
    cr: '11–16',
    party: '11–16',
    hoard: 36000,
    pocket: 1100,
    rarity: [{ r: 'c', w: 11 }, { r: 'u', w: 23 }, { r: 'r', w: 36 }, { r: 'v', w: 23 }, { r: 'l', w: 7 }],
    items: [{ n: 1, w: 20 }, { n: 2, w: 30 }, { n: 3, w: 30 }, { n: 4, w: 20 }],
    consumable: 0.3,
    gems: [500, 1000, 5000],
    art: [750, 2500, 7500],
    goods: [250, 6000],
    coins: [
      { w: 35, gp: 0.6, pp: 0.4 },
      { w: 30, gp: 0.3, pp: 0.7 },
      { w: 20, pp: 1 },
      { w: 15, ep: 0.2, gp: 0.5, pp: 0.3 },
    ],
    pocketCoins: [
      { w: 40, pp: 1 },
      { w: 35, gp: 0.3, pp: 0.7 },
      { w: 25, gp: 0.6, pp: 0.4 },
    ],
  },
  {
    id: 't4',
    cr: '17+',
    party: '17–20',
    hoard: 330000,
    pocket: 9000,
    rarity: [{ r: 'r', w: 20 }, { r: 'v', w: 44 }, { r: 'l', w: 36 }],
    items: [{ n: 1, w: 12 }, { n: 2, w: 22 }, { n: 3, w: 30 }, { n: 4, w: 20 }, { n: 5, w: 10 }, { n: 6, w: 6 }],
    consumable: 0.25,
    gems: [1000, 5000, 25000],
    art: [750, 2500, 7500, 30000],
    goods: [2500, 30000],
    coins: [
      { w: 40, gp: 0.3, pp: 0.7 },
      { w: 35, pp: 1 },
      { w: 25, gp: 0.5, pp: 0.5 },
    ],
    pocketCoins: [
      { w: 55, pp: 1 },
      { w: 45, gp: 0.3, pp: 0.7 },
    ],
  },
];

// What a hoard is made of, by theme. Each row is one way such a hoard can look.
export const THEME_MIXES = {
  any: [
    { w: 30, coins: 0.5, gems: 0.25, art: 0.25 },
    { w: 20, coins: 0.8, gems: 0.2 },
    { w: 15, coins: 0.3, art: 0.7 },
    { w: 15, coins: 0.4, goods: 0.6 },
    { w: 10, gems: 0.6, art: 0.4 },
    { w: 10, coins: 1 },
  ],
  arcane: [
    { w: 50, coins: 0.25, gems: 0.75 },
    { w: 30, coins: 0.2, gems: 0.6, art: 0.2 },
    { w: 20, coins: 0.1, gems: 0.9 },
  ],
  martial: [
    { w: 50, coins: 0.6, goods: 0.4 },
    { w: 30, coins: 0.85, goods: 0.15 },
    { w: 20, coins: 0.4, goods: 0.5, gems: 0.1 },
  ],
  trade: [
    { w: 45, coins: 0.4, goods: 0.6 },
    { w: 30, coins: 0.2, goods: 0.8 },
    { w: 25, coins: 0.5, goods: 0.4, gems: 0.1 },
  ],
  relic: [
    { w: 50, coins: 0.2, art: 0.8 },
    { w: 30, coins: 0.15, gems: 0.25, art: 0.6 },
    { w: 20, coins: 0.05, art: 0.95 },
  ],
};

// A patron pays in money, mostly.
export const REWARD_MIXES = [
  { w: 60, coins: 1 },
  { w: 25, coins: 0.7, gems: 0.3 },
  { w: 15, coins: 0.6, goods: 0.4 },
];

// Share of scrolls among the consumables of a hoard of this theme.
export const SCROLL_SHARE = { any: 0.4, arcane: 0.7, martial: 0.15, trade: 0.3, relic: 0.5 };
