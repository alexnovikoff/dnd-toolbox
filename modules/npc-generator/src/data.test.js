import { NPC_DATA as D } from './data.js';
import { say } from './engine.js';

// Shape guard for the content tables. Hand-edited bilingual data is easy to
// get subtly wrong, and a bad marker or an empty pool only shows up at runtime
// on the unlucky roll.
const TAGGED_TABLES = [
  'features',
  'manners',
  'moods',
  'wants',
  'knows',
  'secrets',
  'backgrounds',
  'hooks',
  'plans',
  'offers',
  'allies',
  'enemies',
];
const PLAIN_TABLES = ['levers', 'talks', 'tactics'];
const TEXT_TABLES = [...TAGGED_TABLES, ...PLAIN_TABLES];

const CATS = D.occCategories.map((c) => c.id);
const TONES = ['plain', 'grim', 'comic', 'mystic'];
// Small tables repeat themselves quickly at the table, so each has a floor.
const MIN_SIZES = {
  features: 220,
  manners: 170,
  moods: 30,
  wants: 135,
  knows: 95,
  secrets: 118,
  levers: 55,
  backgrounds: 100,
  hooks: 120,
  plans: 96,
  offers: 90,
  talks: 48,
  allies: 60,
  enemies: 60,
  tactics: 48,
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
  'druid',
  'gladiator',
  'banditCaptain',
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
      expect(r.names.m.length, r.id).toBeGreaterThanOrEqual(20);
      expect(r.names.f.length, r.id).toBeGreaterThanOrEqual(20);
      [...r.names.m, ...r.names.f, ...r.last].forEach(expectEntry);
    }
  });

  it('has no repeated first name inside a race', () => {
    for (const r of D.races) {
      for (const list of [r.names.m, r.names.f]) {
        expect(new Set(list.map((n) => n.en)).size, r.id).toBe(list.length);
        expect(new Set(list.map((n) => n.ru)).size, r.id).toBe(list.length);
      }
    }
  });

  it('gives every non-human race details of its own', () => {
    const ids = D.races.map((r) => r.id);
    for (const e of D.features) {
      if (e.raceOnly) expect(ids, e.ru).toContain(e.raceOnly);
    }
    for (const id of ids.filter((x) => x !== 'human')) {
      expect(D.features.filter((e) => e.raceOnly === id).length, id).toBeGreaterThanOrEqual(3);
    }
  });

  it('gives the thin circles enough entries of their own', () => {
    const TABLES = ['features', 'manners', 'wants', 'secrets', 'backgrounds', 'hooks', 'plans'];
    for (const table of [...TABLES, 'offers']) {
      for (const c of ['arts', 'wild', 'magic']) {
        expect(D[table].filter((e) => e.c === c).length, `${table}/${c}`).toBeGreaterThanOrEqual(8);
      }
    }
  });

  it('gives every circle its own knowledge, allies, enemies and offers', () => {
    const FLOORS = { knows: 8, allies: 5, enemies: 5, offers: 4 };
    for (const [table, floor] of Object.entries(FLOORS)) {
      for (const c of CATS) {
        expect(D[table].filter((e) => e.c === c).length, `${table}/${c}`).toBeGreaterThanOrEqual(
          floor
        );
      }
    }
  });

  it('keeps town institutions out of what anyone at all may know or be tied to', () => {
    const TOWN = /ратуш|бургомистр|гильди|гарнизон|магистрат|рынк|рынок|в порту/i;
    for (const table of ['knows', 'allies', 'enemies']) {
      for (const e of D[table].filter((x) => !x.c)) expect(e.ru, table).not.toMatch(TOWN);
    }
  });

  it('does not turn every hook into a request', () => {
    const REQUEST = /^(Просит|Предлагает|Умоляет|Нанимает|Требует|Хочет)/;
    expect(D.hooks.filter((e) => REQUEST.test(e.ru)).length / D.hooks.length).toBeLessThan(0.6);
  });

  it('leaves fighters and non-fighters a varied choice of tactics', () => {
    for (const fighter of [true, false]) {
      const own = D.tactics.filter((e) => e.fighter === fighter);
      const pool = D.tactics.filter((e) => e.fighter === undefined || e.fighter === fighter);
      expect(own.length, `own: ${fighter}`).toBeGreaterThanOrEqual(10);
      expect(pool.length, `pool: ${fighter}`).toBeGreaterThanOrEqual(25);
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

  it('keeps masculine role nouns out of the feminine text', () => {
    const MASCULINE =
      /надзирателем|шутом|карманником|чужаком|родственником|писарем|лорд в изгнании|умершей жены/;
    for (const e of TEXT_TABLES.flatMap((t) => D[t])) {
      expect(say(e, 'ru', 'f'), e.ru).not.toMatch(MASCULINE);
    }
  });

  it('gives a man a wife and a woman a husband', () => {
    for (const e of TEXT_TABLES.flatMap((t) => D[t])) {
      expect(say(e, 'ru', 'm'), e.ru).not.toMatch(/собственным супругом|умершего мужа/);
      expect(say(e, 'ru', 'f'), e.ru).not.toMatch(/собственной супругой|умершей жены/);
    }
  });

  it('gives an age bound to every entry that needs years behind it', () => {
    const SPANS = { пять: 5, семь: 7, десять: 10, пятнадцать: 15, двадцать: 20 };
    const GROWN_FAMILY = /внук|дочь замуж|учёбы сына|выкупить сына|собственных детей/i;
    // What someone merely knows can be older than they are.
    for (const e of TEXT_TABLES.filter((t) => t !== 'knows').flatMap((t) => D[t])) {
      const span = e.ru.toLowerCase().match(/(пять|семь|десять|пятнадцать|двадцать) лет/);
      if (span) expect(e.minYears, e.ru).toBeGreaterThanOrEqual(SPANS[span[1]]);
      if (GROWN_FAMILY.test(e.ru)) expect(e.minYears, e.ru).toBeGreaterThanOrEqual(16);
    }
  });

  it('never rolls anyone too young to hold a job', () => {
    for (const r of D.races) expect(r.age[0], r.id).toBeGreaterThanOrEqual(16);
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
    const fits = (e, tone, cat) => (!e.c || e.c === cat) && (!e.t || e.t === tone) && !e.raceOnly;
    const FLOORS = { moods: 12, allies: 15, enemies: 15 };
    for (const table of TAGGED_TABLES) {
      for (const tone of TONES) {
        for (const cat of CATS) {
          const pool = D[table].filter((e) => fits(e, tone, cat));
          const floor = FLOORS[table] ?? 20;
          expect(pool.length, `${table}/${tone}/${cat}`).toBeGreaterThanOrEqual(floor);
        }
      }
    }
  });

  it('keeps every table large enough not to repeat itself', () => {
    for (const [table, min] of Object.entries(MIN_SIZES)) {
      expect(D[table].length, table).toBeGreaterThanOrEqual(min);
    }
    expect(D.occupations.length).toBeGreaterThanOrEqual(225);
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
