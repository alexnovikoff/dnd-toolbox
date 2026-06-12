// engine.js — generation logic for the Tavern Builder.
// Pure JS, no JSX/React. A tavern is a plain object of 5 blocks; each block
// stores picked table entries (with both languages inside), so switching
// language never rerolls. The handoff original
// (design_handoff_tavern_builder/design-reference/tavern-engine.js) is
// preserved; name templates (nameKind) were added on top of it.
import { TAVERN_DATA as D } from './data.js';

const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
function rndN(arr, n) {
  const pool = arr.slice();
  const out = [];
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

// Name templates. adj_noun dominates (largest combination space); the rest
// add variety. `adj`/`noun` are always picked so taverns saved before
// templates existed (no nameKind) and the fallback path keep working.
function pickNameKind() {
  const r = Math.random();
  if (r < 0.55) return 'adj_noun';
  if (r < 0.7) return 'owner';
  if (r < 0.85) return 'two_nouns';
  return 'numeral';
}

function genIdentity(params) {
  const a = D.atmos[params.tone] || D.atmos.cozy;
  const noun = rnd(D.nouns);
  const nameKind = pickNameKind();
  let noun2 = null;
  if (nameKind === 'two_nouns') {
    do {
      noun2 = rnd(D.nouns);
    } while (noun2 === noun);
  }
  return {
    adj: rnd(D.adjs),
    noun,
    nameKind,
    ownerName: nameKind === 'owner' ? rnd(D.names) : null,
    noun2,
    num: nameKind === 'numeral' ? 2 + Math.floor(Math.random() * 3) : null,
    sign: rnd(D.signs[params.wealth]),
    light: rnd(a.light),
    smell: rnd(a.smell),
    detail: rnd(a.detail),
    crowd: rnd(D.crowd[params.size]),
    aiDesc: null, aiLang: null,
  };
}
function genMenu(params) {
  return {
    food: rndN(D.food[params.wealth], 4),
    drinks: rndN(D.drinks[params.wealth], 3),
  };
}
function genPeople() {
  const picked = rndN(D.names, 4);
  return {
    owner: {
      name: picked[0], race: rnd(D.races),
      trait: rnd(D.traits), quirk: rnd(D.quirks), secret: rnd(D.secrets),
    },
    staff: rndN(D.staff, 3).map((s, i) => ({ ...s, name: picked[i + 1] })),
  };
}
function genPatrons(params) {
  return rndN(D.patrons, 2 + params.size);
}
function genRumors() {
  return rndN(D.rumors, 3);
}

const GENS = {
  identity: genIdentity,
  menu: genMenu,
  people: genPeople,
  patrons: genPatrons,
  rumors: genRumors,
};
const blockKeys = Object.keys(GENS);

// generate(params, prev?, locks?) — locked blocks are carried over from prev.
function generate(params, prev, locks) {
  const t = {};
  blockKeys.forEach(k => {
    t[k] = (locks && locks[k] && prev && prev[k]) ? prev[k] : GENS[k](params);
  });
  return t;
}

// «Два/Две» agrees with the noun gender; 3 and 4 do not change.
const NUM_RU = { 2: ['Два', 'Две', 'Два'], 3: ['Три', 'Три', 'Три'], 4: ['Четыре', 'Четыре', 'Четыре'] };
const NUM_EN = { 2: 'Two', 3: 'Three', 4: 'Four' };

// tavernName(tavern, lang) → «Пьяный Грифон» / The Drunken Griffin.
// Taverns saved before name templates have no nameKind → adj_noun fallback.
function tavernName(t, lang) {
  const id = t.identity;
  const { adj, noun } = id;
  switch (id.nameKind) {
    case 'owner':
      return lang === 'ru' ? `У ${id.ownerName.gen}` : `${id.ownerName.en}’s`;
    case 'two_nouns':
      return lang === 'ru' ? `${noun.ru} и ${id.noun2.ru}` : `The ${noun.en} & ${id.noun2.en}`;
    case 'numeral':
      return lang === 'ru'
        ? `${NUM_RU[id.num][noun.g]} ${noun.ru24}`
        : `The ${NUM_EN[id.num]} ${noun.enPl}`;
    default:
      return lang === 'ru' ? `${adj.ru[noun.g]} ${noun.ru}` : `The ${adj.en} ${noun.en}`;
  }
}

export { generate, tavernName, blockKeys };
