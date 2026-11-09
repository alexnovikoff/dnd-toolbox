import { NPC_DATA as D } from './data.js';

// Shape guard for the content tables. Hand-edited bilingual data is easy to
// get subtly wrong, and a bad marker or an empty pool only shows up at runtime
// on the unlucky roll.
const TAGGED_TABLES = [
  'features',
  'manners',
  'moods',
  'wants',
  'secrets',
  'backgrounds',
  'hooks',
  'plans',
];
const PLAIN_TABLES = ['knows', 'levers', 'offers', 'talks', 'ties', 'tactics'];
const TEXT_TABLES = [...TAGGED_TABLES, ...PLAIN_TABLES];

const CATS = D.occCategories.map((c) => c.id);
const TONES = ['plain', 'grim', 'comic', 'mystic'];
// Small tables repeat themselves quickly at the table, so each has a floor.
const MIN_SIZES = {
  features: 150,
  manners: 145,
  moods: 30,
  wants: 115,
  knows: 60,
  secrets: 100,
  levers: 55,
  backgrounds: 80,
  hooks: 80,
  plans: 75,
  offers: 58,
  talks: 48,
  ties: 52,
  tactics: 38,
};
const SRD_STATS = [
  'commoner',
  'guard',
  'noble',
  'knight',
  'veteran',
  'acolyte',
  'priest',
  'mage',
  'bandit',
  'thug',
  'spy',
  'scout',
  'cultist',
];

// {m|f} pairs must be closed, unnested and hold exactly two parts.
function expectValidMarkers(text) {
  const stripped = text.replace(/\{[^{}|]*\|[^{}|]*\}/g, '');
  expect(stripped, text).not.toMatch(/[{}|]/);
}

function expectEntry(e) {
  expect(e.ru.length, JSON.stringify(e)).toBeGreaterThan(0);
  expect(e.en.length, JSON.stringify(e)).toBeGreaterThan(0);
  expectValidMarkers(e.ru);
  expectValidMarkers(e.en);
}

describe('npc data tables', () => {
  it('keeps both locales and valid gender markers on every text entry', () => {
    for (const table of TEXT_TABLES) {
      expect(D[table].length, table).toBeGreaterThan(0);
      D[table].forEach(expectEntry);
    }
    D.occupations.forEach(expectEntry);
  });

  it('keeps each language in its own alphabet', () => {
    const entries = [...TEXT_TABLES.flatMap((t) => D[t]), ...D.occupations];
    for (const e of entries) {
      expect(e.ru, e.ru).not.toMatch(/[a-z]/i);
      expect(e.en, e.en).not.toMatch(/[а-яё]/i);
    }
  });

  it('uses only known tone and occupation tags', () => {
    for (const table of TEXT_TABLES) {
      for (const e of D[table]) {
        if (e.t) expect(['grim', 'comic', 'mystic'], e.ru).toContain(e.t);
        if (e.c) expect(CATS, e.ru).toContain(e.c);
      }
    }
  });

  it('has no duplicate entries inside a table', () => {
    for (const table of TEXT_TABLES) {
      const ru = D[table].map((e) => e.ru);
      expect(new Set(ru).size, table).toBe(ru.length);
    }
    const occ = D.occupations.map((e) => e.ru);
    expect(new Set(occ).size).toBe(occ.length);
  });

  it('gives every race a weight, a sane age range and names for both genders', () => {
    const ids = D.races.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of D.races) {
      expect(r.w, r.id).toBeGreaterThan(0);
      expect(r.age[0], r.id).toBeLessThan(r.age[1]);
      expect(r.names.m.length, r.id).toBeGreaterThanOrEqual(12);
      expect(r.names.f.length, r.id).toBeGreaterThanOrEqual(12);
      [...r.names.m, ...r.names.f, ...r.last].forEach(expectEntry);
    }
  });

  it('never pairs a gendered adjective with a masculine-only job title', () => {
    // «ночная сторож» reads wrong: the next word needs its own marker, a
    // common-gender form like «староста» or «убийца», or be a short preposition
    // («нищая у ворот», where the adjective is the job title itself).
    const adjective = /\{(?:ый|ий|ой)\|ая\}/;
    const agrees = /\{|[ая]$|^[а-я]{1,2}$/;
    for (const o of D.occupations) {
      const words = o.ru.split(' ');
      words.forEach((word, i) => {
        if (adjective.test(word) && words[i + 1]) expect(words[i + 1], o.ru).toMatch(agrees);
      });
    }
  });

  it('files every occupation under a category with a stock SRD profile', () => {
    for (const o of D.occupations) {
      expect(CATS, o.ru).toContain(o.c);
      expect(SRD_STATS, o.ru).toContain(o.stat);
      expect(D.stats[o.stat], o.stat).toBeDefined();
      expectEntry(D.stats[o.stat]);
    }
    for (const c of CATS) {
      expect(D.occupations.filter((o) => o.c === c).length, c).toBeGreaterThanOrEqual(14);
    }
  });

  it('leaves a varied pool for every tone and occupation combination', () => {
    const fits = (e, tone, cat) => (!e.c || e.c === cat) && (!e.t || e.t === tone);
    for (const table of TAGGED_TABLES) {
      for (const tone of TONES) {
        for (const cat of CATS) {
          const pool = D[table].filter((e) => fits(e, tone, cat));
          const floor = table === 'moods' ? 12 : 20;
          expect(pool.length, `${table}/${tone}/${cat}`).toBeGreaterThanOrEqual(floor);
        }
      }
    }
  });

  it('keeps every table large enough not to repeat itself', () => {
    for (const [table, min] of Object.entries(MIN_SIZES)) {
      expect(D[table].length, table).toBeGreaterThanOrEqual(min);
    }
    expect(D.occupations.length).toBeGreaterThanOrEqual(200);
  });

  it('covers a wide range of people', () => {
    expect(D.occCategories.length).toBeGreaterThanOrEqual(9);
    expect(D.races.length).toBeGreaterThanOrEqual(11);
    expect(D.tones.map((t) => t.id)).toContain('mystic');
  });

  it('has enough facts for three distinct «knows» lines', () => {
    expect(D.knows.length).toBeGreaterThanOrEqual(3);
  });

  it('labels every selector option in Russian', () => {
    for (const list of [D.levels, D.tones, D.occCategories, D.races]) {
      list.forEach((o) => expect(o.ru.length, o.id).toBeGreaterThan(0));
    }
  });
});
