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

function rndN(arr, n) {
  const pool = arr.slice();
  const out = [];
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

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
function fits(entry, { tone, cat }) {
  return (!entry.c || entry.c === cat) && (tone === 'any' || !entry.t || entry.t === tone);
}

// Entries written for this occupation or tone are drawn more often than the
// generic ones, which is what keeps a table-rolled NPC from feeling random.
function pickFit(table, ctx) {
  const pool = table.filter((entry) => fits(entry, ctx));
  const specific = pool.filter(
    (entry) => entry.c === ctx.cat || (ctx.tone !== 'any' && entry.t === ctx.tone)
  );
  return rnd(specific.length && Math.random() < 0.6 ? specific : pool);
}

const ctxOf = (params, npc) => ({ tone: params.tone, cat: npc.occupation.c });
const fitted = (table) => (params, npc) => pickFit(table, ctxOf(params, npc));
const raceById = (id) => D.races.find((r) => r.id === id);

function genWho(params) {
  const race = raceById(params.race) || weighted(D.races);
  const gender = params.gender === 'm' || params.gender === 'f' ? params.gender : rnd(['m', 'f']);
  const [lo, hi] = race.age;
  return {
    race: { id: race.id, ru: race.ru, en: race.en },
    gender,
    age: lo + Math.floor(Math.random() * (hi - lo + 1)),
  };
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

function genFeature(params, npc) {
  const scaly = raceById(npc.who.race.id)?.scaly;
  const table = scaly ? D.features.filter((e) => !e.hair) : D.features;
  return pickFit(table, ctxOf(params, npc));
}

const genKnows = (params, npc) => {
  const ctx = ctxOf(params, npc);
  return rndN(
    D.knows.filter((e) => fits(e, ctx)),
    3
  );
};

function genCombat(params, npc) {
  return { stat: npc.occupation.stat, tactic: pickFit(D.tactics, ctxOf(params, npc)) };
}

// Listed in dependency order: who → name, occupation → everything tagged by it.
const GENS = {
  who: genWho,
  name: genName,
  occupation: genOccupation,
  feature: genFeature,
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
  ties: fitted(D.ties),
  combat: genCombat,
};

function keepLockedAi(ai, locks) {
  if (!ai) return null;
  const kept = Object.fromEntries(Object.entries(ai).filter(([key]) => locks[key]));
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
  FIELD_KEYS.forEach((key) => {
    npc[key] = locks[key] && prev?.[key] ? prev[key] : GENS[key](params, npc);
  });
  npc.ai = keepLockedAi(prev?.ai, locks);
  return npc;
}

const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// rerollField — re-rolls one field of the same NPC. A new race or gender needs
// a matching name, and a new occupation a matching stat block, unless the
// dependent field is locked.
export function rerollField(npc, key, params, locks = {}) {
  const next = { ...npc, ai: dropAi(npc.ai, key) };
  let value;
  let tries = 0;
  do {
    value = GENS[key](params, next);
    tries += 1;
  } while (tries < 16 && sameValue(value, npc[key]));
  next[key] = value;

  if (key === 'who' && !locks.name) {
    const sameRace = value.race.id === npc.who.race.id;
    if (!sameRace || value.gender !== npc.who.gender) next.name = GENS.name(params, next);
  }
  if (key === 'occupation' && !locks.combat) {
    next.combat = { ...next.combat, stat: value.stat };
  }
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
