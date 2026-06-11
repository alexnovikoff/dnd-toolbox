// engine.js — generation logic for the Tavern Builder.
// Pure JS, no JSX/React. A tavern is a plain object of 5 blocks; each block
// stores picked table entries (with both languages inside), so switching
// language never rerolls. Ported VERBATIM from the design handoff
// (design_handoff_tavern_builder/design-reference/tavern-engine.js).
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

function genIdentity(params) {
  const a = D.atmos[params.tone] || D.atmos.cozy;
  return {
    adj: rnd(D.adjs),
    noun: rnd(D.nouns),
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

// tavernName(tavern, lang) → «Пьяный Грифон» / The Drunken Griffin
function tavernName(t, lang) {
  const { adj, noun } = t.identity;
  return lang === 'ru'
    ? `${adj.ru[noun.g]} ${noun.ru}`
    : `The ${adj.en} ${noun.en}`;
}

export { generate, tavernName, blockKeys };
