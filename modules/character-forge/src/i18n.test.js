import { RACES, CLASSES, FIRST_NAMES, LAST_NAMES, UI, randL, firstNamesFor } from './i18n.js';

// Shape guard for the roll tables: dice rolls and placeholders rely on every
// entry carrying both locales, and hand-edited bilingual data is easy to get
// subtly wrong (a missing ru field would surface as "undefined" in an input).
const POOLS = {
  RACES: { pool: RACES, min: 17 },
  CLASSES: { pool: CLASSES, min: 14 },
  FIRST_NAMES: { pool: FIRST_NAMES, min: 130 },
  LAST_NAMES: { pool: LAST_NAMES, min: 120 },
};

describe('character-forge roll tables', () => {
  it('keeps both locales on every entry, with Cyrillic ru', () => {
    for (const { pool } of Object.values(POOLS)) {
      for (const e of pool) {
        expect(e.en.length).toBeGreaterThan(0);
        expect(e.ru.length).toBeGreaterThan(0);
        expect(e.ru).toMatch(/[а-яё]/i);
      }
    }
  });

  it('has no duplicates in either locale', () => {
    for (const { pool } of Object.values(POOLS)) {
      expect(new Set(pool.map((e) => e.en)).size).toBe(pool.length);
      expect(new Set(pool.map((e) => e.ru)).size).toBe(pool.length);
    }
  });

  it('keeps every pool at least as large as the original English one', () => {
    for (const { pool, min } of Object.values(POOLS)) {
      expect(pool.length).toBeGreaterThanOrEqual(min);
    }
  });

  it('tags every first name with a gender and keeps both subsets stocked', () => {
    for (const e of FIRST_NAMES) expect(['m', 'f']).toContain(e.g);
    expect(FIRST_NAMES.filter((n) => n.g === 'm').length).toBeGreaterThanOrEqual(40);
    expect(FIRST_NAMES.filter((n) => n.g === 'f').length).toBeGreaterThanOrEqual(40);
  });

  it('firstNamesFor filters by gender and falls back to the full pool', () => {
    expect(firstNamesFor('male').every((n) => n.g === 'm')).toBe(true);
    expect(firstNamesFor('female').every((n) => n.g === 'f')).toBe(true);
    expect(firstNamesFor('male').length).toBeGreaterThan(0);
    expect(firstNamesFor('female').length).toBeGreaterThan(0);
    expect(firstNamesFor('other')).toBe(FIRST_NAMES);
  });

  it('randL rolls from the ru pool and falls back to en for other languages', () => {
    expect(RACES.map((r) => r.ru)).toContain(randL(RACES, 'ru'));
    expect(RACES.map((r) => r.en)).toContain(randL(RACES, 'en'));
    expect(RACES.map((r) => r.en)).toContain(randL(RACES, 'de'));
  });

  it('keeps ru/en placeholders in sync with real pool values', () => {
    for (const lang of ['ru', 'en']) {
      const t = UI[lang];
      expect(RACES.map((r) => r[lang])).toContain(t.racePlaceholder);
      expect(CLASSES.map((c) => c[lang])).toContain(t.clsPlaceholder);
      const [first, ...rest] = t.namePlaceholder.split(' ');
      expect(FIRST_NAMES.map((n) => n[lang])).toContain(first);
      expect(LAST_NAMES.map((n) => n[lang])).toContain(rest.join(' '));
    }
    expect(UI.ru.namePlaceholder).toMatch(/[а-яё]/i);
    expect(UI.ru.racePlaceholder).toMatch(/[а-яё]/i);
    expect(UI.ru.clsPlaceholder).toMatch(/[а-яё]/i);
  });
});
