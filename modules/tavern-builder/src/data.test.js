import { TAVERN_DATA as D } from './data.js';

// Shape guard for the content tables: the engine and the name templates rely
// on these invariants, and hand-edited bilingual data is easy to get subtly
// wrong (a missing gender form breaks a whole name template at runtime).
describe('tavern data tables', () => {
  it('adjectives carry three Russian gender forms and an English form', () => {
    for (const a of D.adjs) {
      expect(Array.isArray(a.ru)).toBe(true);
      expect(a.ru).toHaveLength(3);
      a.ru.forEach((form) => expect(form.length).toBeGreaterThan(0));
      expect(a.en.length).toBeGreaterThan(0);
    }
  });

  it('nouns carry gender, the 2–4 form and the English plural', () => {
    for (const n of D.nouns) {
      expect([0, 1, 2]).toContain(n.g);
      expect(n.ru.length).toBeGreaterThan(0);
      expect(n.ru24.length).toBeGreaterThan(0);
      expect(n.en.length).toBeGreaterThan(0);
      expect(n.enPl.length).toBeGreaterThan(0);
    }
  });

  it('has no duplicate nominatives among adjectives or nouns', () => {
    const adjRu = D.adjs.map((a) => a.ru[0]);
    const nounRu = D.nouns.map((n) => n.ru);
    expect(new Set(adjRu).size).toBe(adjRu.length);
    expect(new Set(nounRu).size).toBe(nounRu.length);
  });

  it('owner names carry a Russian genitive for the «У …» template', () => {
    for (const n of D.names) {
      expect(n.ru.length).toBeGreaterThan(0);
      expect(n.gen.length).toBeGreaterThan(0);
      expect(n.en.length).toBeGreaterThan(0);
    }
  });

  it('keeps both locales on every flat-text entry', () => {
    const flat = [
      ...D.signs.flat(),
      ...Object.values(D.atmos).flatMap((t) => [...t.light, ...t.smell, ...t.detail]),
      ...D.crowd.flat(),
      ...D.races,
      ...D.traits,
      ...D.quirks,
      ...D.secrets,
      ...D.rumors,
    ];
    for (const e of flat) {
      expect(e.ru.length).toBeGreaterThan(0);
      expect(e.en.length).toBeGreaterThan(0);
    }
    for (const s of D.staff) {
      expect(s.role.ru.length).toBeGreaterThan(0);
      expect(s.role.en.length).toBeGreaterThan(0);
      expect(s.detail.ru.length).toBeGreaterThan(0);
      expect(s.detail.en.length).toBeGreaterThan(0);
    }
    for (const p of D.patrons) {
      expect(p.who.ru.length).toBeGreaterThan(0);
      expect(p.who.en.length).toBeGreaterThan(0);
      expect(p.doing.ru.length).toBeGreaterThan(0);
      expect(p.doing.en.length).toBeGreaterThan(0);
    }
  });

  it('prices both menu locales on every tier', () => {
    for (const tier of [...D.food, ...D.drinks]) {
      for (const item of tier) {
        expect(item.ru.length).toBeGreaterThan(0);
        expect(item.en.length).toBeGreaterThan(0);
        expect(item.pr).toMatch(/^\d+ (мм|см|зм)$/);
        expect(item.pe).toMatch(/^\d+ (cp|sp|gp)$/);
      }
    }
  });

  it('marks every rumor with a known truth level', () => {
    for (const r of D.rumors) {
      expect(['true', 'half', 'false']).toContain(r.truth);
    }
  });

  it('keeps every pool at least as large as one generation draw', () => {
    // the engine draws: 4 food + 3 drinks per tier, 4 names, 3 staff,
    // up to 4 patrons (2 + size 2), 3 rumors, 1 of everything else
    D.food.forEach((tier) => expect(tier.length).toBeGreaterThanOrEqual(4));
    D.drinks.forEach((tier) => expect(tier.length).toBeGreaterThanOrEqual(3));
    expect(D.names.length).toBeGreaterThanOrEqual(4);
    expect(D.staff.length).toBeGreaterThanOrEqual(3);
    expect(D.patrons.length).toBeGreaterThanOrEqual(4);
    expect(D.rumors.length).toBeGreaterThanOrEqual(3);
    expect(D.nouns.length).toBeGreaterThanOrEqual(2); // two_nouns needs a distinct pair
    D.signs.forEach((tier) => expect(tier.length).toBeGreaterThanOrEqual(1));
    D.crowd.forEach((size) => expect(size.length).toBeGreaterThanOrEqual(1));
    for (const tone of Object.values(D.atmos)) {
      expect(tone.light.length).toBeGreaterThanOrEqual(1);
      expect(tone.smell.length).toBeGreaterThanOrEqual(1);
      expect(tone.detail.length).toBeGreaterThanOrEqual(1);
    }
  });
});
