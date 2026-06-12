import { generate, tavernName, blockKeys } from './engine.js';
import { TAVERN_DATA as D } from './data.js';

const PARAMS = { tone: 'cozy', wealth: 1, size: 1 };

describe('tavern engine', () => {
  it('generates all five blocks', () => {
    const t = generate(PARAMS);
    expect(Object.keys(t).sort()).toEqual([...blockKeys].sort());
    expect(blockKeys).toEqual(['identity', 'menu', 'people', 'patrons', 'rumors']);
  });

  it('carries locked blocks over from prev and rerolls the rest', () => {
    const prev = generate(PARAMS);
    const next = generate(PARAMS, prev, { identity: true, menu: true });
    expect(next.identity).toBe(prev.identity);
    expect(next.menu).toBe(prev.menu);
    // unlocked blocks are freshly generated objects, not carried references
    expect(next.people).not.toBe(prev.people);
    expect(next.patrons).not.toBe(prev.patrons);
    expect(next.rumors).not.toBe(prev.rumors);
  });

  it('rerolls exactly one block when all others are locked (module reroll)', () => {
    const prev = generate(PARAMS);
    const only = {};
    blockKeys.forEach((k) => {
      only[k] = k !== 'rumors';
    });
    const next = generate(PARAMS, prev, only);
    expect(next.identity).toBe(prev.identity);
    expect(next.menu).toBe(prev.menu);
    expect(next.people).toBe(prev.people);
    expect(next.patrons).toBe(prev.patrons);
    expect(next.rumors).not.toBe(prev.rumors);
  });

  it('agrees the Russian adjective with the noun gender', () => {
    const adj = { ru: ['Пьяный', 'Пьяная', 'Пьяное'], en: 'Drunken' };
    const name = (g, nounRu) => tavernName({ identity: { adj, noun: { ru: nounRu, g } } }, 'ru');
    expect(name(0, 'Кабан')).toBe('Пьяный Кабан');
    expect(name(1, 'Кружка')).toBe('Пьяная Кружка');
    expect(name(2, 'Ведро')).toBe('Пьяное Ведро');
    expect(tavernName({ identity: { adj, noun: { ru: 'Кабан', g: 0, en: 'Boar' } } }, 'en')).toBe(
      'The Drunken Boar'
    );
  });

  it('falls back to adj_noun for taverns saved before name templates', () => {
    // shape of a pre-template localStorage tavern: no nameKind at all
    const legacy = {
      identity: {
        adj: { ru: ['Пьяный', 'Пьяная', 'Пьяное'], en: 'Drunken' },
        noun: { ru: 'Грифон', g: 0, en: 'Griffin' },
      },
    };
    expect(tavernName(legacy, 'ru')).toBe('Пьяный Грифон');
    expect(tavernName(legacy, 'en')).toBe('The Drunken Griffin');
  });

  it('renders the owner template in both locales', () => {
    const t = {
      identity: {
        adj: { ru: ['Пьяный', 'Пьяная', 'Пьяное'], en: 'Drunken' },
        noun: { ru: 'Кабан', g: 0, en: 'Boar' },
        nameKind: 'owner',
        ownerName: { ru: 'Барлен', gen: 'Барлена', en: 'Barlen' },
      },
    };
    expect(tavernName(t, 'ru')).toBe('У Барлена');
    expect(tavernName(t, 'en')).toBe('Barlen’s');
  });

  it('renders the two-nouns template in both locales', () => {
    const t = {
      identity: {
        adj: { ru: ['Пьяный', 'Пьяная', 'Пьяное'], en: 'Drunken' },
        noun: { ru: 'Котёл', g: 0, en: 'Cauldron' },
        nameKind: 'two_nouns',
        noun2: { ru: 'Корона', g: 1, en: 'Crown' },
      },
    };
    expect(tavernName(t, 'ru')).toBe('Котёл и Корона');
    expect(tavernName(t, 'en')).toBe('The Cauldron & Crown');
  });

  it('agrees the numeral with the noun gender and uses plural forms', () => {
    const make = (num, noun) => ({
      identity: {
        adj: { ru: ['Пьяный', 'Пьяная', 'Пьяное'], en: 'Drunken' },
        noun,
        nameKind: 'numeral',
        num,
      },
    });
    const rose = { ru: 'Роза', g: 1, ru24: 'Розы', en: 'Rose', enPl: 'Roses' };
    const stag = { ru: 'Олень', g: 0, ru24: 'Оленя', en: 'Stag', enPl: 'Stags' };
    const bucket = { ru: 'Ведро', g: 2, ru24: 'Ведра', en: 'Bucket', enPl: 'Buckets' };
    expect(tavernName(make(2, rose), 'ru')).toBe('Две Розы');
    expect(tavernName(make(2, stag), 'ru')).toBe('Два Оленя');
    expect(tavernName(make(2, bucket), 'ru')).toBe('Два Ведра');
    expect(tavernName(make(3, rose), 'ru')).toBe('Три Розы');
    expect(tavernName(make(4, stag), 'ru')).toBe('Четыре Оленя');
    expect(tavernName(make(3, rose), 'en')).toBe('The Three Roses');
  });

  it('always produces a valid name kind and a non-empty name', () => {
    const kinds = new Set();
    for (let i = 0; i < 200; i++) {
      const t = generate(PARAMS);
      const id = t.identity;
      kinds.add(id.nameKind);
      expect(['adj_noun', 'owner', 'two_nouns', 'numeral']).toContain(id.nameKind);
      if (id.nameKind === 'two_nouns') expect(id.noun2).not.toBe(id.noun);
      if (id.nameKind === 'owner') expect(id.ownerName.gen).toBeTruthy();
      if (id.nameKind === 'numeral') expect([2, 3, 4]).toContain(id.num);
      expect(tavernName(t, 'ru').length).toBeGreaterThan(0);
      expect(tavernName(t, 'en').length).toBeGreaterThan(0);
    }
    // 200 draws at 15% per minor kind: all four kinds virtually always appear
    expect(kinds.size).toBe(4);
  });

  it('scales patrons with settlement size: 2 + size', () => {
    expect(generate({ ...PARAMS, size: 0 }).patrons).toHaveLength(2);
    expect(generate({ ...PARAMS, size: 1 }).patrons).toHaveLength(3);
    expect(generate({ ...PARAMS, size: 2 }).patrons).toHaveLength(4);
  });

  it('draws the menu from the chosen wealth tier', () => {
    for (const wealth of [0, 1, 2]) {
      const t = generate({ ...PARAMS, wealth });
      expect(t.menu.food).toHaveLength(4);
      expect(t.menu.drinks).toHaveLength(3);
      t.menu.food.forEach((item) => expect(D.food[wealth]).toContain(item));
      t.menu.drinks.forEach((item) => expect(D.drinks[wealth]).toContain(item));
    }
  });

  it('picks distinct entries within a block (no duplicate staff or rumors)', () => {
    const t = generate(PARAMS);
    expect(new Set(t.rumors).size).toBe(t.rumors.length);
    expect(new Set(t.people.staff.map((s) => s.role)).size).toBe(t.people.staff.length);
  });
});
