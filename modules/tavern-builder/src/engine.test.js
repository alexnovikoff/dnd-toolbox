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
