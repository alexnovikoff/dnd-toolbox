// engine.js — generation logic for the NPC Generator. Pure JS, no React.
// An NPC is a flat object of fields. Each field stores the picked table entry
// with both languages inside, so switching language never rerolls. Russian
// gender agreement lives in {m|f} markers resolved at display time, so a new
// gender never needs the other fields rerolled.
//
// AI text is an overlay in `npc.ai` ({ field: { text, lang } }), never a
// replacement: the table draft underneath stays, which makes it reversible.
import { NPC_DATA as D } from './data.js';

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

function weighted(list) {
  let r = Math.random() * list.reduce((sum, item) => sum + item.w, 0);
  for (const item of list) {
    r -= item.w;
    if (r < 0) return item;
  }
  return list[list.length - 1];
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const DEFAULT_PARAMS = {
  level: 'passerby',
  occ: 'any',
  race: 'any',
  gender: 'any',
  tone: 'any',
};

// ── fields by importance ──
const IDENTITY = ['who', 'name', 'occupation'];
const SCENE = ['feature', 'manner', 'mood', 'want'];
const DEPTH = ['knows', 'secret', 'lever', 'background', 'hook'];
const PLOT = ['plan', 'offer', 'talk', 'ties', 'combat'];

export const LEVEL_FIELDS = {
  passerby: [...IDENTITY, ...SCENE],
  recurring: [...IDENTITY, ...SCENE, ...DEPTH],
  key: [...IDENTITY, ...SCENE, ...DEPTH, ...PLOT],
};
export const FIELD_KEYS = LEVEL_FIELDS.key;

export const SECTIONS = [
  { id: 'scene', ru: 'За столом', en: 'At the table', keys: SCENE },
  { id: 'depth', ru: 'Глубже', en: 'Beneath the surface', keys: DEPTH },
  { id: 'plot', ru: 'Для сюжета', en: 'For the plot', keys: PLOT },
];

export const FIELD_LABELS = {
  name: { ru: 'Имя', en: 'Name' },
  who: { ru: 'Кто', en: 'Who' },
  occupation: { ru: 'Занятие', en: 'Occupation' },
  feature: { ru: 'Примета', en: 'Detail' },
  manner: { ru: 'Манера', en: 'Manner' },
  mood: { ru: 'Настрой', en: 'Attitude' },
  want: { ru: 'Хочет сейчас', en: 'Wants now' },
  knows: { ru: 'Знает', en: 'Knows' },
  secret: { ru: 'Секрет', en: 'Secret' },
  lever: { ru: 'Рычаг', en: 'Leverage' },
  background: { ru: 'Прошлое', en: 'Background' },
  hook: { ru: 'Зацепка', en: 'Hook' },
  plan: { ru: 'Если не вмешаться', en: 'If left alone' },
  offer: { ru: 'Может дать', en: 'Can offer' },
  talk: { ru: 'В разговоре', en: 'In conversation' },
  ties: { ru: 'Союзники и враги', en: 'Allies and enemies' },
  combat: { ru: 'В бою', en: 'In a fight' },
};

// ── picking from the tables ──
const raceById = (id) => D.races.find((r) => r.id === id);

// Years count from coming of age, so "twenty years" asks the same of a human
// and an elf. Clamped because a saved NPC can be younger than today's minimum.
function personOf(who) {
  const race = raceById(who.race.id);
  return { race, gender: who.gender, years: Math.max(0, who.age - race.age[0]) };
}

function suits(entry, { race, gender, years }) {
  if (entry.raceOnly && entry.raceOnly !== race.id) return false;
  if (entry.hair && race.scaly) return false;
  if (entry.beard && (gender === 'f' || race.beardless)) return false;
  return years >= (entry.minYears ?? 0) && years <= (entry.maxYears ?? Infinity);
}

function fits(entry, { tone, cat, person, fighter }) {
  return (
    (!entry.c || entry.c === cat) &&
    (tone === 'any' || !entry.t || entry.t === tone) &&
    (entry.fighter === undefined || entry.fighter === fighter) &&
    suits(entry, person)
  );
}

// Entries written for this occupation, race or tone are drawn more often than
// the generic ones, which is what keeps a table-rolled NPC from feeling random.
// Their share grows with their number, so two such entries can't take over.
const SHARE_PER_SPECIFIC = 0.05;
const MAX_SPECIFIC_SHARE = 0.6;

function pickFit(table, ctx) {
  const pool = table.filter((entry) => fits(entry, ctx));
  const specific = pool.filter(
    (entry) => entry.c === ctx.cat || entry.raceOnly || (ctx.tone !== 'any' && entry.t === ctx.tone)
  );
  const share = Math.min(MAX_SPECIFIC_SHARE, specific.length * SHARE_PER_SPECIFIC);
  return rnd(Math.random() < share ? specific : pool);
}

const ctxOf = (params, npc) => ({
  tone: params.tone,
  cat: npc.occupation.c,
  person: personOf(npc.who),
});
const fitted = (table) => (params, npc) => pickFit(table, ctxOf(params, npc));

// ageRange — the ages of this race that agree with the entries on the card.
function ageRange(race, held) {
  const [lo, hi] = race.age;
  const from = Math.max(lo, ...held.map((entry) => lo + (entry.minYears ?? 0)));
  const to = Math.min(hi, ...held.map((entry) => lo + (entry.maxYears ?? Infinity)));
  return from <= to ? [from, to] : race.age;
}

function rollWho(params, held) {
  const bound = held.find((entry) => entry.raceOnly)?.raceOnly;
  const race = raceById(params.race) || raceById(bound) || weighted(D.races);
  const gender = params.gender === 'm' || params.gender === 'f' ? params.gender : rnd(['m', 'f']);
  const [lo, hi] = ageRange(race, held);
  return {
    race: { id: race.id, ru: race.ru, en: race.en },
    gender,
    age: lo + Math.floor(Math.random() * (hi - lo + 1)),
  };
}

function canCarryAll(entries, who) {
  const person = personOf(who);
  return entries.every((entry) => suits(entry, person));
}

// genWho — a person who can still carry what the card already holds: the locked
// fields of a new roll, or everything else when only this field is rerolled.
// The age is picked to fit; retries are for a race or gender that can't carry
// an entry. A demand the filters make impossible just ends with the last try.
function genWho(params, npc) {
  const held = FIELD_KEYS.flatMap((key) => npc[key] ?? []);
  let who;
  let tries = 0;
  do {
    who = rollWho(params, held);
    tries += 1;
  } while (tries < 32 && !canCarryAll(held, who));
  return who;
}

function genName(_params, npc) {
  const race = raceById(npc.who.race.id);
  const first = rnd(race.names[npc.who.gender]);
  const last = race.last.length ? rnd(race.last) : null;
  return last
    ? { ru: `${first.ru} ${last.ru}`, en: `${first.en} ${last.en}` }
    : { ru: first.ru, en: first.en };
}

function genOccupation(params) {
  const pool = D.occupations.filter((o) => params.occ === 'any' || o.c === params.occ);
  return rnd(pool);
}

const KNOWS_COUNT = 3;

function genKnows(params, npc) {
  const ctx = ctxOf(params, npc);
  const known = [];
  while (known.length < KNOWS_COUNT) {
    const rest = D.knows.filter((entry) => !known.includes(entry));
    known.push(pickFit(rest, ctx));
  }
  return known;
}

// Two independent lists give far more pairs than a table of ready-made lines.
function genTies(params, npc) {
  const ctx = ctxOf(params, npc);
  const ally = pickFit(D.allies, ctx);
  const enemy = pickFit(D.enemies, ctx);
  return { ru: `${ally.ru}, ${enemy.ru}`, en: `${ally.en}, ${enemy.en}` };
}

const isFighter = (stat) => Boolean(D.stats[stat].fighter);

function genCombat(params, npc) {
  const { stat } = npc.occupation;
  const ctx = { ...ctxOf(params, npc), fighter: isFighter(stat) };
  return { stat, tactic: pickFit(D.tactics, ctx) };
}

// Listed in dependency order: who → name, occupation → everything tagged by it.
const GENS = {
  who: genWho,
  name: genName,
  occupation: genOccupation,
  feature: fitted(D.features),
  manner: fitted(D.manners),
  mood: fitted(D.moods),
  want: fitted(D.wants),
  knows: genKnows,
  secret: fitted(D.secrets),
  lever: fitted(D.levers),
  background: fitted(D.backgrounds),
  hook: fitted(D.hooks),
  plan: fitted(D.plans),
  offer: fitted(D.offers),
  talk: fitted(D.talks),
  ties: genTies,
  combat: genCombat,
};

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

// generate(params, prev?, locks?) — a new NPC; locked fields come from prev.
export function generate(params, prev, locks = {}) {
  const npc = { id: newId(), level: params.level };
  // Locked fields go in first, so that a new person is rolled to fit them.
  FIELD_KEYS.forEach((key) => {
    if (locks[key] && prev?.[key]) npc[key] = prev[key];
  });
  FIELD_KEYS.forEach((key) => {
    if (!npc[key]) npc[key] = GENS[key](params, npc);
  });
  npc.ai = filterAi(prev?.ai, (key) => locks[key]);
  return npc;
}

const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// rerollField — re-rolls one field of the same NPC. A new race or gender needs
// a matching name, a detail of the body has to suit the new person, and a new
// occupation needs a matching stat block and tactic, unless the dependent field
// is locked.
export function rerollField(npc, key, params, locks = {}) {
  const next = { ...npc, ai: dropAi(npc.ai, key) };
  // An unlocked detail follows the person instead of pinning their race or gender.
  const detailFollows = key === 'who' && !locks.feature;
  const context = detailFollows ? { ...next, feature: null } : next;
  let value;
  let tries = 0;
  do {
    value = GENS[key](params, context);
    tries += 1;
  } while (tries < 16 && sameValue(value, npc[key]));
  next[key] = value;

  if (key === 'who' && !locks.name) {
    const sameRace = value.race.id === npc.who.race.id;
    if (!sameRace || value.gender !== npc.who.gender) next.name = GENS.name(params, next);
  }
  if (detailFollows && !suits(next.feature, personOf(value))) {
    next.feature = GENS.feature(params, next);
    next.ai = dropAi(next.ai, 'feature');
  }
  if (key === 'occupation' && !locks.combat) {
    const { tactic } = next.combat;
    const tacticStays = tactic.fighter === undefined || tactic.fighter === isFighter(value.stat);
    next.combat = tacticStays ? { ...next.combat, stat: value.stat } : GENS.combat(params, next);
  }
  return next;
}

// completeNpc — the full form of an NPC. Whatever is already on the card stays;
// the fields not shown yet are rolled now, so they follow the current filters.
export function completeNpc(npc, params, locks = {}) {
  const shown = new Set([...LEVEL_FIELDS[npc.level], 'quote']);
  const next = { ...npc, level: 'key' };
  FIELD_KEYS.forEach((key) => {
    if (!shown.has(key) && !locks[key]) next[key] = GENS[key](params, next);
  });
  next.ai = filterAi(npc.ai, (key) => shown.has(key) || locks[key]);
  return next;
}

export function crowd(params, count) {
  return Array.from({ length: count }, () => generate({ ...params, level: 'passerby' }));
}

// ── rendering text ──
export function say(entry, lang, gender) {
  if (!entry) return '';
  return String(entry[lang]).replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m, f) =>
    gender === 'f' ? f : m
  );
}

function ruYears(n) {
  const tens = n % 100;
  const ones = n % 10;
  if (tens >= 11 && tens <= 14) return 'лет';
  if (ones === 1) return 'год';
  if (ones >= 2 && ones <= 4) return 'года';
  return 'лет';
}

export function ageText(age, lang) {
  return lang === 'ru' ? `${age} ${ruYears(age)}` : `age ${age}`;
}

export function whoText(who, lang) {
  return `${who.race[lang]}, ${D.genders[who.gender][lang]}, ${ageText(who.age, lang)}`;
}

function combatText(combat, lang, gender) {
  const stat = D.stats[combat.stat][lang];
  const tactic = say(combat.tactic, lang, gender);
  return lang === 'ru' ? `Профиль «${stat}». ${tactic}` : `${stat} stat block. ${tactic}`;
}

// fieldText → the text to show now: AI text written in this language, else the
// table draft. `knows` is a list, everything else a string.
export function fieldText(npc, key, lang) {
  const ai = npc.ai?.[key];
  if (ai && ai.lang === lang) return ai.text;
  const gender = npc.who.gender;
  switch (key) {
    case 'quote':
      return '';
    case 'who':
      return whoText(npc.who, lang);
    case 'knows':
      return npc.knows.slice(0, npc.level === 'key' ? 3 : 2).map((e) => say(e, lang, gender));
    case 'combat':
      return combatText(npc.combat, lang, gender);
    default:
      return say(npc[key], lang, gender);
  }
}

// toText — the card as plain text, for pasting into notes.
export function toText(npc, lang) {
  const visible = LEVEL_FIELDS[npc.level];
  const lines = [
    fieldText(npc, 'name', lang),
    `${fieldText(npc, 'who', lang)} · ${fieldText(npc, 'occupation', lang)}`,
  ];
  const quote = fieldText(npc, 'quote', lang);
  if (quote) lines.push(lang === 'ru' ? `«${quote}»` : `“${quote}”`);
  SECTIONS.forEach((section) => {
    const keys = section.keys.filter((key) => visible.includes(key));
    if (!keys.length) return;
    lines.push('');
    keys.forEach((key) => {
      const label = FIELD_LABELS[key][lang];
      const text = fieldText(npc, key, lang);
      if (Array.isArray(text)) {
        lines.push(`${label}:`);
        text.forEach((line) => lines.push(`- ${line}`));
      } else {
        lines.push(`${label}: ${text}`);
      }
    });
  });
  return lines.join('\n');
}

// ── AI overlay ──
// The AI keeps the identity, the attitude and the stat block as given, and
// never touches a locked field.
const FIXED_FOR_AI = new Set(['who', 'name', 'occupation', 'mood', 'combat']);

export function aiTargets(npc, locks = {}) {
  const rewritable = LEVEL_FIELDS[npc.level].filter((key) => !FIXED_FOR_AI.has(key) && !locks[key]);
  return ['quote', ...rewritable];
}

// npcFacts — what the server gets: one line of text per visible field.
export function npcFacts(npc, lang) {
  const facts = {};
  LEVEL_FIELDS[npc.level].forEach((key) => {
    const text = fieldText(npc, key, lang);
    facts[key] = Array.isArray(text) ? text.join('; ') : text;
  });
  return facts;
}

function cleanAnswer(key, value) {
  if (key === 'knows') {
    const list = (Array.isArray(value) ? value : [value])
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);
    return list.length ? list : null;
  }
  if (typeof value !== 'string') return null;
  // The card puts its own quotation marks around the quote.
  const text = key === 'quote' ? value.replace(/^[\s«"“„']+|[\s»"”']+$/g, '') : value.trim();
  return text || null;
}

// applyAi — merges a model answer into the overlay. Takes only the fields it
// asked for; returns null when the answer holds nothing usable.
export function applyAi(npc, fields, targets, lang) {
  if (!fields || typeof fields !== 'object') return null;
  const added = {};
  targets.forEach((key) => {
    const text = cleanAnswer(key, fields[key]);
    if (text) added[key] = { text, lang };
  });
  if (!Object.keys(added).length) return null;
  return { ...npc, ai: { ...npc.ai, ...added } };
}
