// engine.js — generation logic for the Loot Generator. Pure JS, no React.
// A haul is a flat object of sections. Each section stores the picked table
// entries with both languages inside, so switching language never rerolls.
//
// The money comes first: a target value for the danger band, split between
// coins, gems, art and goods. Each section then spends its share in whole
// pieces, and whatever could not be spent falls back to coins, so the average
// stays on target however lumpy the pieces are. Magic items are counted apart,
// as in the published guidance they were calibrated against.
//
// AI text is an overlay in `haul.ai` ({ field: { text, lang } }), never a
// replacement: the table draft underneath stays, which makes it reversible.
import { LOOT_DATA as D } from './data.js';

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const between = (lo, hi) => lo + Math.random() * (hi - lo);
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function weighted(list) {
  let r = Math.random() * list.reduce((sum, item) => sum + item.w, 0);
  for (const item of list) {
    r -= item.w;
    if (r < 0) return item;
  }
  return list[list.length - 1];
}

// n different entries from a list, or fewer if the list is shorter.
function sample(list, n) {
  const pool = [...list];
  const picked = [];
  while (picked.length < n && pool.length) {
    picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return picked;
}

export const DEFAULT_PARAMS = {
  kind: 'hoard',
  tier: 't1',
  theme: 'any',
  bounty: 'normal',
  bodies: 4,
  party: 4,
};

export const tierOf = (id) => D.tiers.find((t) => t.id === id) ?? D.tiers[0];
const bountyOf = (id) => D.bounties.find((b) => b.id === id) ?? D.bounties[1];
const rarityOf = (id) => D.rarities.find((r) => r.id === id);

const COIN_KEYS = ['pp', 'gp', 'ep', 'sp', 'cp'];
const COINS_PER_LB = 50;

export const VALUE_KEYS = ['coins', 'gems', 'art', 'goods'];
export const STORY_KEYS = {
  hoard: ['origin', 'place', 'guard', 'hook'],
  dragon: ['origin', 'place', 'guard', 'hook'],
  reward: ['origin', 'form', 'perk', 'catch'],
  pockets: [],
};
const hasStory = (kind) => STORY_KEYS[kind].length > 0;

export const FIELD_LABELS = {
  coins: { ru: 'Монеты', en: 'Coins' },
  gems: { ru: 'Камни', en: 'Gems' },
  art: { ru: 'Искусство', en: 'Art' },
  goods: { ru: 'Товары', en: 'Goods' },
  finds: { ru: 'Находки', en: 'Finds' },
  origin: { ru: 'Кто собрал', en: 'Gathered by' },
  place: { ru: 'Где лежит', en: 'Where it lies' },
  guard: { ru: 'Что мешает', en: 'In the way' },
  hook: { ru: 'Зацепка', en: 'Hook' },
  form: { ru: 'Как платит', en: 'How it is paid' },
  perk: { ru: 'Сверх денег', en: 'On top of that' },
  catch: { ru: 'Подвох', en: 'The catch' },
};
const PATRON_LABEL = { ru: 'Кто платит', en: 'Paid by' };

export const fieldLabel = (haul, key, lang) =>
  key === 'origin' && haul.kind === 'reward' ? PATRON_LABEL[lang] : FIELD_LABELS[key][lang];

// ── money ──
// 1,234 → 1,200: nobody counts out a hoard to the last coin.
function roundish(n) {
  if (n < 100) return Math.round(n);
  const step = 10 ** (Math.floor(Math.log10(n)) - 1);
  return Math.round(n / step) * step;
}

export function coinsValue(coins) {
  return Object.entries(coins).reduce((sum, [key, n]) => sum + n * D.coins[key].gp, 0);
}

function rollCoins(budget, profiles) {
  const profile = weighted(profiles);
  const coins = {};
  COIN_KEYS.forEach((key) => {
    if (!profile[key]) return;
    const amount = roundish((budget * profile[key]) / D.coins[key].gp);
    if (amount > 0) coins[key] = amount;
  });
  return coins;
}

function rollTotal(params) {
  const tier = tierOf(params.tier);
  const base = params.kind === 'pockets' ? tier.pocket * params.bodies : tier.hoard;
  const rolls = params.kind === 'dragon' ? 2 : 1;
  let total = 0;
  for (let i = 0; i < rolls; i += 1) total += base * weighted(D.luck).k * between(0.85, 1.15);
  return total * bountyOf(params.bounty).k;
}

function mixFor(params) {
  if (params.kind === 'pockets') return { coins: 1 };
  if (params.kind === 'reward') return weighted(D.rewardMixes);
  return weighted(D.themeMixes[params.theme] ?? D.themeMixes.any);
}

function rollBudget(params) {
  const total = rollTotal(params);
  const mix = mixFor(params);
  return Object.fromEntries(VALUE_KEYS.map((key) => [key, total * (mix[key] ?? 0)]));
}

// pack — spends a budget on a few stacks of pieces of fixed value: mostly the
// dearest piece that fits, sometimes one step cheaper, and more often so after
// the first stack, so a hoard is not all one price. What is left is change.
const DEAREST_FIRST = 0.7;
const DEAREST_AFTER_FIRST = 0.45;

function pack(budget, steps, maxStacks, maxEach) {
  const stacks = [];
  let left = budget;
  while (stacks.length < maxStacks) {
    const fit = steps.filter((v) => v <= left);
    if (!fit.length) break;
    const dearest = Math.random() < (stacks.length ? DEAREST_AFTER_FIRST : DEAREST_FIRST);
    const v = dearest ? fit[fit.length - 1] : fit[Math.max(0, fit.length - 2)];
    const most = Math.min(maxEach(v), Math.floor(left / v));
    const n = Math.max(1, Math.round(most * between(0.45, 1)));
    stacks.push({ v, n });
    left -= v * n;
  }
  return { stacks, left };
}

const GEM_STACKS = 3;
const ART_STACKS = 3;
const ART_EACH = 3;
const GOOD_STACKS = 3;
const GOODS_EACH = 6;
// The very largest stones are one of a kind and already say how large they are.
const GIANT_GEM = 25000;
const gemsEach = (v) => (v >= GIANT_GEM ? 4 : 12);

function genGems(budget, tier) {
  const { stacks, left } = pack(budget, tier.gems, GEM_STACKS, gemsEach);
  const taken = new Set();
  const value = stacks.map(({ v, n }, i) => {
    const gem = rnd(D.gems.filter((g) => g.v === v && !taken.has(g.en)));
    taken.add(gem.en);
    return { gem, n, detail: i === 0 && n === 1 && v < GIANT_GEM ? rnd(D.gemDetails) : null };
  });
  return { value, left };
}

function genArt(budget, tier) {
  const { stacks } = pack(budget, tier.art, ART_STACKS, () => ART_EACH);
  const pool = [...D.art];
  const value = [];
  stacks.forEach(({ v, n }) => {
    sample(
      pool.filter((a) => a.v === v),
      n
    ).forEach((piece) => {
      pool.splice(pool.indexOf(piece), 1);
      value.push(piece);
    });
  });
  return { value, left: budget - value.reduce((sum, a) => sum + a.v, 0) };
}

function goodsPool(tier, theme) {
  const [lo, hi] = tier.goods;
  const inRange = D.goods.filter((g) => g.v >= lo && g.v <= hi);
  if (theme !== 'martial' && theme !== 'trade') return inRange;
  return inRange.filter((g) => !g.th || g.th === theme);
}

function genGoods(budget, tier, theme) {
  const pool = goodsPool(tier, theme);
  const steps = [...new Set(pool.map((g) => g.v))].sort((a, b) => a - b);
  const { stacks, left } = pack(budget, steps, GOOD_STACKS, () => GOODS_EACH);
  const byGood = new Map();
  stacks.forEach(({ v, n }) => {
    const good = rnd(pool.filter((g) => g.v === v));
    byGood.set(good, (byGood.get(good) ?? 0) + n);
  });
  return { value: [...byGood].map(([good, n]) => ({ good, n })), left };
}

const VALUE_GENS = {
  gems: (budget, p) => genGems(budget, tierOf(p.tier)),
  art: (budget, p) => genArt(budget, tierOf(p.tier)),
  goods: (budget, p) => genGoods(budget, tierOf(p.tier), p.theme),
};

function genCoins(budget, p) {
  const tier = tierOf(p.tier);
  return rollCoins(budget, p.kind === 'pockets' ? tier.pocketCoins : tier.coins);
}

// ── magic items ──
const THEMED_SHARE = 0.75;

export function itemValue(line) {
  const { entry } = line;
  const fixed = entry.cat === 'scroll' ? D.scrollStats[entry.level].gp : null;
  if (fixed) return fixed;
  const base = rarityOf(entry.r).gp;
  return entry.use && entry.cat !== 'scroll' ? base / 2 : base;
}

function pickEntry(tier, theme, lines, forced) {
  const rarity = forced ?? weighted(tier.rarity).r;
  const wantUse = rarity === 'c' || Math.random() < tier.consumable;
  const owned = new Set(lines.map((line) => line.entry.en));
  const fresh = D.items.filter((i) => i.r === rarity && (i.use || !owned.has(i.en)));
  let pool = fresh.filter((i) => Boolean(i.use) === wantUse);
  if (!pool.length) pool = fresh;
  if (wantUse) {
    const wantScroll = Math.random() < (D.scrollShare[theme] ?? D.scrollShare.any);
    const narrowed = pool.filter((i) => (i.cat === 'scroll') === wantScroll);
    if (narrowed.length) pool = narrowed;
  }
  const themed = pool.filter((i) => i.th === theme);
  return rnd(themed.length && Math.random() < THEMED_SHARE ? themed : pool);
}

function marksFor(entry) {
  if (entry.cat === 'potion') return D.marks.potion;
  if (entry.cat === 'scroll') return D.marks.scroll;
  return D.marks.thing;
}

function makeLine(entry) {
  return {
    uid: newId(),
    entry,
    variant: entry.pick ? rnd(D.variants[entry.pick]) : null,
    spell: entry.cat === 'scroll' ? rnd(D.spells[entry.level]) : null,
    mark: rnd(marksFor(entry)),
  };
}

function rollItems(params, kept) {
  if (params.kind === 'pockets') return [];
  const tier = tierOf(params.tier);
  let count = weighted(tier.items).n;
  if (params.kind === 'dragon') count += weighted(tier.items).n;
  const shift = bountyOf(params.bounty).items;
  if (shift && Math.random() < 0.5) count = Math.max(0, count + shift);
  const lines = [...kept];
  while (lines.length < count) lines.push(makeLine(pickEntry(tier, params.theme, lines)));
  return lines;
}

// ── story ──
function originPool(params) {
  if (params.kind === 'reward') return D.patrons;
  if (params.kind === 'dragon') return D.origins.dragon;
  if (params.theme !== 'any') return D.origins[params.theme];
  return Object.entries(D.origins)
    .filter(([key]) => key !== 'dragon')
    .flatMap(([, list]) => list);
}

// A dragon’s lair still has ordinary corners, but it mostly reads as one.
const LAIR_SHARE = 0.75;

function fromTable(table) {
  return (params) =>
    rnd(params.kind === 'dragon' && Math.random() < LAIR_SHARE ? table.dragon : table.common);
}

const STORY_GENS = {
  origin: (params) => rnd(originPool(params)),
  place: fromTable(D.places),
  guard: fromTable(D.guards),
  hook: () => rnd(D.hooks),
  form: () => rnd(D.forms),
  perk: () => rnd(D.perks),
  catch: () => rnd(D.catches),
};

const FINDS_MAX = 5;

function genFinds(bodies) {
  return sample(D.trinkets, Math.min(FINDS_MAX, 1 + Math.floor(bodies / 3)));
}

// ── overlay helpers ──
function filterAi(ai, keep) {
  if (!ai) return null;
  const kept = Object.fromEntries(Object.entries(ai).filter(([key]) => keep(key)));
  return Object.keys(kept).length ? kept : null;
}

function dropAi(ai, key) {
  if (!ai || !(key in ai)) return ai;
  const rest = { ...ai };
  delete rest[key];
  return Object.keys(rest).length ? rest : null;
}

const hasContent = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
};

export const itemLockKey = (uid) => `item:${uid}`;
export const markKey = (uid) => `mark:${uid}`;

const paramsOf = (haul) => ({
  kind: haul.kind,
  tier: haul.tier,
  theme: haul.theme,
  bounty: haul.bounty,
  bodies: haul.bodies,
});

// A coin section may be empty when a theme keeps its wealth elsewhere. The
// little that could not be spent there only becomes coins if it is worth it.
const CHANGE_FLOOR = 0.03;

const usesTheme = (kind) => kind === 'hoard' || kind === 'dragon';

// generate(params, prev?, locks?) — a new find; locked sections come from prev.
export function generate(rawParams, prev, locks = {}) {
  const params = { ...rawParams, theme: usesTheme(rawParams.kind) ? rawParams.theme : 'any' };
  const sameKind = prev?.kind === params.kind;
  const haul = {
    id: newId(),
    kind: params.kind,
    tier: params.tier,
    theme: params.theme,
    bounty: params.bounty,
    bodies: params.bodies,
    ai: null,
  };

  const budget = rollBudget(params);
  const total = VALUE_KEYS.reduce((sum, key) => sum + budget[key], 0);
  let change = 0;
  ['gems', 'art', 'goods'].forEach((key) => {
    if (locks[key] && hasContent(prev?.[key])) {
      haul[key] = prev[key];
      return;
    }
    const { value, left } = VALUE_GENS[key](budget[key], params);
    haul[key] = value;
    change += left;
  });
  const coinBudget =
    budget.coins > 0 || change > total * CHANGE_FLOOR ? budget.coins + change : budget.coins;
  haul.budget = { ...budget, coins: coinBudget };
  haul.coins = locks.coins && hasContent(prev?.coins) ? prev.coins : genCoins(coinBudget, params);

  const kept = (prev?.items ?? []).filter((line) => locks[itemLockKey(line.uid)]);
  haul.items = rollItems(params, kept);

  STORY_KEYS[params.kind].forEach((key) => {
    haul[key] = locks[key] && sameKind && prev?.[key] ? prev[key] : STORY_GENS[key](params);
  });

  if (params.kind === 'pockets') {
    haul.finds = locks.finds && hasContent(prev?.finds) ? prev.finds : genFinds(params.bodies);
  }

  haul.ai = filterAi(prev?.ai, (key) => {
    if (!sameKind) return false;
    if (key.startsWith('mark:')) return Boolean(locks[itemLockKey(key.slice(5))]);
    return Boolean(locks[key]);
  });
  return haul;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function regenerated(haul, key) {
  const p = paramsOf(haul);
  if (key === 'coins') return genCoins(haul.budget.coins, p);
  if (key === 'finds') return genFinds(haul.bodies);
  if (VALUE_GENS[key]) return VALUE_GENS[key](haul.budget[key], p).value;
  return STORY_GENS[key](p);
}

// rerollField — re-rolls one section of the same find, by its own settings:
// changing the filters on the left never touches what is already on the card.
export function rerollField(haul, key) {
  let value;
  let tries = 0;
  do {
    value = regenerated(haul, key);
    tries += 1;
  } while (tries < 16 && same(value, haul[key]));
  return { ...haul, [key]: value, ai: dropAi(haul.ai, key) };
}

// rerollItem — another item of the same rarity in the same place.
export function rerollItem(haul, uid) {
  const line = haul.items.find((l) => l.uid === uid);
  if (!line) return haul;
  const others = haul.items.filter((l) => l.uid !== uid);
  let entry;
  let tries = 0;
  do {
    entry = pickEntry(tierOf(haul.tier), haul.theme, others, line.entry.r);
    tries += 1;
  } while (tries < 16 && entry.en === line.entry.en && entry.cat !== 'scroll');
  return {
    ...haul,
    items: haul.items.map((l) => (l.uid === uid ? makeLine(entry) : l)),
    ai: dropAi(haul.ai, markKey(uid)),
  };
}

// ── rendering text ──
const GROUP = { ru: ' ', en: ',' };

export function num(n, lang) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, GROUP[lang]);
}

export const gpText = (n, lang) => `${num(n, lang)} ${D.coins.gp[lang]}`;

export function coinsText(coins, lang) {
  return COIN_KEYS.filter((key) => coins[key])
    .map((key) => `${num(coins[key], lang)} ${D.coins[key][lang]}`)
    .join(' · ');
}

const LB = { ru: 'фнт.', en: 'lb' };

function weightText(lb, lang) {
  return `${num(lb, lang)} ${LB[lang]}`;
}

function stackLine(n, name, price, lang) {
  if (n === 1) return `${name}, ${price}`;
  return lang === 'ru' ? `${n} × ${name} (по ${price})` : `${n} × ${name} (${price} each)`;
}

function gemLine({ gem, n, detail }, lang) {
  const name = detail ? `${gem[lang]} ${detail[lang]}` : gem[lang];
  return stackLine(n, name, gpText(gem.v, lang), lang);
}

function goodLine({ good, n }, lang) {
  const line = stackLine(n, good[lang], gpText(good.v, lang), lang);
  return n === 1 ? line : `${line}, ${weightText(good.lb * n, lang)}`;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function plural(n, forms) {
  const tens = n % 100;
  const ones = n % 10;
  if (tens >= 11 && tens <= 14) return forms[2];
  if (ones === 1) return forms[0];
  if (ones >= 2 && ones <= 4) return forms[1];
  return forms[2];
}

const BODY_FORMS = ['существо', 'существа', 'существ'];

export function haulTitle(haul, lang) {
  if (haul.origin) return haul.origin.title[lang];
  const { bodies: n } = haul;
  return lang === 'ru'
    ? `С тел: ${n} ${plural(n, BODY_FORMS)}`
    : `Off the bodies: ${n} ${n === 1 ? 'creature' : 'creatures'}`;
}

const nameOf = (list, id, lang) => list.find((o) => o.id === id)?.[lang] ?? '';

// haulMeta — the line under the title: what kind of find this is and how big.
export function haulMeta(haul, lang) {
  const tier = tierOf(haul.tier);
  const band =
    haul.kind === 'reward'
      ? `${lang === 'ru' ? 'уровень партии' : 'party level'} ${tier.party}`
      : `${lang === 'ru' ? 'опасность' : 'CR'} ${tier.cr}`;
  const parts = [nameOf(D.kinds, haul.kind, lang), band];
  const themed = haul.kind === 'hoard' || haul.kind === 'dragon';
  if (themed && haul.theme !== 'any') parts.push(nameOf(D.themes, haul.theme, lang).toLowerCase());
  if (haul.bounty !== 'normal') parts.push(nameOf(D.bounties, haul.bounty, lang).toLowerCase());
  return parts.join(' · ');
}

// fieldText → the text to show now: AI text written in this language, else the
// table draft. Value sections are lists of lines, coins and stories a string.
export function fieldText(haul, key, lang) {
  const ai = haul.ai?.[key];
  if (ai && ai.lang === lang) return ai.text;
  switch (key) {
    case 'read':
      return '';
    case 'coins':
      return coinsText(haul.coins, lang);
    case 'gems':
      return haul.gems.map((stack) => cap(gemLine(stack, lang)));
    case 'art':
      return haul.art.map((a) => `${a[lang]}, ${gpText(a.v, lang)}`);
    case 'goods':
      return haul.goods.map((stack) => goodLine(stack, lang));
    case 'finds':
      return haul.finds.map((f) => f[lang]);
    case 'origin':
      return haul.origin.who[lang];
    default:
      return haul[key][lang];
  }
}

export function sectionFilled(haul, key) {
  return hasContent(haul[key]);
}

const SECTION_ORDER = ['coins', 'gems', 'art', 'goods', 'finds'];
export const valueSections = (haul) => SECTION_ORDER.filter((key) => sectionFilled(haul, key));

export function haulValue(haul) {
  return (
    coinsValue(haul.coins ?? {}) +
    (haul.gems ?? []).reduce((sum, s) => sum + s.gem.v * s.n, 0) +
    (haul.art ?? []).reduce((sum, a) => sum + a.v, 0) +
    (haul.goods ?? []).reduce((sum, s) => sum + s.good.v * s.n, 0)
  );
}

export function haulWeight(haul) {
  const coins = Object.values(haul.coins ?? {}).reduce((sum, n) => sum + n, 0);
  const goods = (haul.goods ?? []).reduce((sum, s) => sum + s.good.lb * s.n, 0);
  return coins / COINS_PER_LB + goods;
}

export const weightLabel = (haul, lang) => weightText(Math.ceil(haulWeight(haul)), lang);

export function itemName({ entry, variant, spell }, lang) {
  if (spell) return `${entry[lang]}: ${spell[lang]}`;
  return variant ? `${entry[lang]} (${variant[lang]})` : entry[lang];
}

const ATTUNE = { ru: 'настройка', en: 'attunement' };
const CATCH = { ru: 'с подвохом', en: 'has a catch' };
const CIRCLE = { ru: 'круг', en: 'level' };
const CANTRIP = { ru: 'заговор', en: 'cantrip' };

export const spellLevelLabel = (level, lang) =>
  level === 0 ? CANTRIP[lang] : `${CIRCLE[lang]} ${level}`;

function attuneText(att, lang) {
  if (!att) return null;
  return att === 1 ? ATTUNE[lang] : `${ATTUNE[lang]} (${att[lang]})`;
}

export function itemMeta(line, lang) {
  const { entry } = line;
  return [
    rarityOf(entry.r)[lang],
    entry.cat === 'scroll' ? spellLevelLabel(entry.level, lang) : null,
    attuneText(entry.att, lang),
    entry.bad ? CATCH[lang] : null,
    `≈ ${gpText(itemValue(line), lang)}`,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function itemNote({ entry }, lang) {
  if (entry.cat === 'scroll') {
    const { dc, atk } = D.scrollStats[entry.level];
    return lang === 'ru'
      ? `Сл спасброска ${dc}, бонус атаки +${atk}. Читает тот, у кого это заклинание в списке.`
      : `Save DC ${dc}, attack bonus +${atk}. Usable by anyone with the spell on their list.`;
  }
  return entry.note[lang];
}

export function itemMark(haul, line, lang) {
  const ai = haul?.ai?.[markKey(line.uid)];
  return ai && ai.lang === lang ? ai.text : line.mark[lang];
}

export const shareOf = (haul, party) => haulValue(haul) / Math.max(1, party);

// toText — the find as plain text, for pasting into notes.
export function toText(haul, lang, party) {
  const lines = [haulTitle(haul, lang), cap(haulMeta(haul, lang))];
  const read = fieldText(haul, 'read', lang);
  if (read) lines.push('', read);
  const total =
    lang === 'ru'
      ? `Всего ≈ ${gpText(haulValue(haul), lang)} · вес ≈ ${weightLabel(haul, lang)} · на ${party}: ≈ ${gpText(shareOf(haul, party), lang)}`
      : `Total ≈ ${gpText(haulValue(haul), lang)} · weight ≈ ${weightLabel(haul, lang)} · each of ${party}: ≈ ${gpText(shareOf(haul, party), lang)}`;
  lines.push('', total, '');

  valueSections(haul).forEach((key) => {
    const label = FIELD_LABELS[key][lang];
    const text = fieldText(haul, key, lang);
    if (Array.isArray(text)) {
      lines.push(`${label}:`);
      text.forEach((line) => lines.push(`- ${line}`));
    } else {
      lines.push(`${label}: ${text}`);
    }
  });

  if (haul.items.length) {
    lines.push(lang === 'ru' ? 'Магические предметы:' : 'Magic items:');
    haul.items.forEach((line) => {
      lines.push(`- ${itemName(line, lang)} (${itemMeta(line, lang)}). ${itemNote(line, lang)}`);
      lines.push(`  ${itemMark(haul, line, lang)}`);
    });
  }

  if (hasStory(haul.kind)) {
    lines.push('');
    STORY_KEYS[haul.kind].forEach((key) => {
      lines.push(`${fieldLabel(haul, key, lang)}: ${fieldText(haul, key, lang)}`);
    });
  }
  return lines.join('\n');
}

// ── AI overlay ──
export const aiAvailable = (haul) => hasStory(haul.kind);

export function aiTargets(haul, locks = {}) {
  const story = STORY_KEYS[haul.kind].filter((key) => !locks[key]);
  const marks = haul.items
    .filter((line) => !locks[itemLockKey(line.uid)])
    .map((line) => markKey(line.uid));
  return ['read', ...story, ...marks];
}

export const aiKeep = (haul, locks = {}) => STORY_KEYS[haul.kind].filter((key) => locks[key]);

// lootFacts — what the server gets: one line of text per thing on the card.
export function lootFacts(haul, lang) {
  const list = (key) => (sectionFilled(haul, key) ? fieldText(haul, key, lang).join('; ') : '');
  const facts = {
    title: haulTitle(haul, lang),
    summary: cap(haulMeta(haul, lang)),
    coins: sectionFilled(haul, 'coins') ? fieldText(haul, 'coins', lang) : '',
    gems: list('gems'),
    art: list('art'),
    goods: list('goods'),
    items: haul.items.map((line) => `${itemName(line, lang)}: ${itemNote(line, lang)}`),
  };
  STORY_KEYS[haul.kind].forEach((key) => {
    facts[key] = fieldText(haul, key, lang);
  });
  return facts;
}

function cleanText(value) {
  if (typeof value !== 'string') return null;
  return value.trim() || null;
}

// applyAi — merges a model answer into the overlay. Takes only the fields it
// asked for; returns null when the answer holds nothing usable. `marks` come
// back as a list in the order the items were sent.
export function applyAi(haul, fields, targets, lang) {
  if (!fields || typeof fields !== 'object') return null;
  const added = {};
  const marks = Array.isArray(fields.marks) ? fields.marks : [];
  targets.forEach((key) => {
    const raw = key.startsWith('mark:')
      ? marks[haul.items.findIndex((line) => markKey(line.uid) === key)]
      : fields[key];
    const text = cleanText(raw);
    if (text) added[key] = { text, lang };
  });
  if (!Object.keys(added).length) return null;
  return { ...haul, ai: { ...haul.ai, ...added } };
}

// ── quick rolls ──
export const DEFAULT_QUICK = {
  gem: 'any',
  art: 'any',
  potion: 'any',
  scroll: 'any',
  itemRarity: 'any',
  itemCat: 'any',
};

export const QUICK_VALUES = {
  gem: [...new Set(D.gems.map((g) => g.v))],
  art: [...new Set(D.art.map((a) => a.v))],
};

const LOOSE_CATS = new Set(['potion', 'scroll']);

function itemPool(opts) {
  return D.items.filter(
    (i) =>
      (opts.itemCat === 'any' ? !LOOSE_CATS.has(i.cat) : i.cat === opts.itemCat) &&
      (opts.itemRarity === 'any' || i.r === opts.itemRarity)
  );
}

// quickReady — whether this row has anything to roll with these filters.
export function quickReady(type, opts) {
  return type !== 'item' || itemPool(opts).length > 0;
}

function byTierRarity(pool, tierId) {
  const rarity = weighted(tierOf(tierId).rarity).r;
  const hits = pool.filter((i) => i.r === rarity);
  return hits.length ? hits : pool;
}

const QUICK_ROLLS = {
  coins: (_opts, tierId) => {
    const tier = tierOf(tierId);
    return { coins: rollCoins(tier.pocket * weighted(D.luck).k, tier.pocketCoins) };
  },
  gem: (opts) => {
    const pool = D.gems.filter((g) => opts.gem === 'any' || g.v === Number(opts.gem));
    const gem = rnd(pool);
    return { gem, n: 1, detail: gem.v < GIANT_GEM ? rnd(D.gemDetails) : null };
  },
  art: (opts) => ({
    art: rnd(D.art.filter((a) => opts.art === 'any' || a.v === Number(opts.art))),
  }),
  trinket: () => ({ entry: rnd(D.trinkets) }),
  potion: (opts, tierId) => {
    const pool = D.items.filter((i) => i.cat === 'potion');
    const hits =
      opts.potion === 'any' ? byTierRarity(pool, tierId) : pool.filter((i) => i.r === opts.potion);
    return { line: makeLine(rnd(hits)) };
  },
  scroll: (opts, tierId) => {
    const pool = D.items.filter((i) => i.cat === 'scroll');
    const hits =
      opts.scroll === 'any'
        ? byTierRarity(pool, tierId)
        : pool.filter((i) => i.level === Number(opts.scroll));
    return { line: makeLine(rnd(hits)) };
  },
  item: (opts, tierId) => {
    const pool = itemPool(opts);
    return { line: makeLine(rnd(opts.itemRarity === 'any' ? byTierRarity(pool, tierId) : pool)) };
  },
};

export function quickRoll(type, opts, tierId) {
  return { id: newId(), type, ...QUICK_ROLLS[type](opts, tierId) };
}

// quickText → { title, meta?, note?, mark? } in the language of the moment.
export function quickText(pick, lang) {
  switch (pick.type) {
    case 'coins':
      return { title: coinsText(pick.coins, lang) };
    case 'gem':
      return { title: cap(gemLine(pick, lang)) };
    case 'art':
      return { title: pick.art[lang], meta: gpText(pick.art.v, lang) };
    case 'trinket':
      return { title: pick.entry[lang] };
    default:
      return {
        title: itemName(pick.line, lang),
        meta: itemMeta(pick.line, lang),
        note: itemNote(pick.line, lang),
        mark: pick.line.mark[lang],
      };
  }
}

export function quickToText(pick, lang) {
  const { title, meta, note, mark } = quickText(pick, lang);
  const head = meta ? `${title} (${meta})` : title;
  return note ? `${head}. ${note} ${mark}` : head;
}
