import { LOOT_DATA as D } from './data.js';

// Shape guard for the content tables. Hand-edited bilingual data is easy to get
// subtly wrong, and a missing price or an empty pool only shows up at runtime
// on the unlucky roll.
const bilingual = (entry) => {
  expect(entry.ru?.length, JSON.stringify(entry)).toBeGreaterThan(0);
  expect(entry.en?.length, JSON.stringify(entry)).toBeGreaterThan(0);
};
const RARITY_IDS = D.rarities.map((r) => r.id);
const THEME_IDS = ['arcane', 'martial', 'trade', 'relic'];
const CATS = [...D.categories.map((c) => c.id), 'potion', 'scroll'];
const VALUE_KEYS = new Set(['w', 'coins', 'gems', 'art', 'goods']);

describe('loot data tables', () => {
  it('keeps both languages on every plain text entry', () => {
    const lists = [
      D.gems,
      D.gemDetails,
      D.art,
      D.goods,
      D.hooks,
      D.forms,
      D.perks,
      D.catches,
      D.trinkets,
      D.places.common,
      D.places.dragon,
      D.guards.common,
      D.guards.dragon,
      D.marks.thing,
      D.marks.potion,
      D.marks.scroll,
      D.kinds,
      D.themes,
      D.bounties,
      D.rarities,
      D.categories,
    ];
    lists.forEach((list) => {
      expect(list.length).toBeGreaterThan(0);
      list.forEach(bilingual);
    });
  });

  it('pairs every title with who it belongs to', () => {
    [...Object.values(D.origins).flat(), ...D.patrons].forEach((o) => {
      bilingual(o.title);
      bilingual(o.who);
    });
  });

  it('has enough entries not to repeat itself at the table', () => {
    const floors = {
      gems: [D.gems, 55],
      gemDetails: [D.gemDetails, 20],
      art: [D.art, 85],
      goods: [D.goods, 40],
      hooks: [D.hooks, 30],
      places: [D.places.common, 34],
      guards: [D.guards.common, 34],
      forms: [D.forms, 15],
      perks: [D.perks, 20],
      catches: [D.catches, 20],
      patrons: [D.patrons, 18],
      trinkets: [D.trinkets, 85],
      marks: [D.marks.thing, 35],
      potionMarks: [D.marks.potion, 15],
      scrollMarks: [D.marks.scroll, 12],
    };
    Object.entries(floors).forEach(([name, [list, floor]]) => {
      expect(list.length, name).toBeGreaterThanOrEqual(floor);
    });
    Object.entries(D.origins).forEach(([theme, list]) => {
      expect(list.length, theme).toBeGreaterThanOrEqual(10);
    });
  });

  it('does not repeat an entry inside a table', () => {
    const noDuplicates = (list) => {
      const names = list.map((e) => e.en);
      expect(
        new Set(names).size,
        names.find((n, i) => names.indexOf(n) !== i)
      ).toBe(names.length);
    };
    [D.gems, D.art, D.goods, D.hooks, D.trinkets, D.places.common, D.guards.common].forEach(
      noDuplicates
    );
  });
});

describe('valuables', () => {
  it('prices every piece on a value the danger bands actually use', () => {
    const gemSteps = new Set(D.tiers.flatMap((t) => t.gems));
    const artSteps = new Set(D.tiers.flatMap((t) => t.art));
    D.gems.forEach((g) => expect(gemSteps, g.en).toContain(g.v));
    D.art.forEach((a) => expect(artSteps, a.en).toContain(a.v));
  });

  it('has pieces for every value step of every danger band', () => {
    D.tiers.forEach((tier) => {
      tier.gems.forEach((v) => {
        expect(D.gems.filter((g) => g.v === v).length, `gem ${v}`).toBeGreaterThanOrEqual(5);
      });
      tier.art.forEach((v) => {
        expect(D.art.filter((a) => a.v === v).length, `art ${v}`).toBeGreaterThanOrEqual(6);
      });
    });
  });

  it('gives goods a value and a weight, and every band something to sell', () => {
    D.goods.forEach((g) => {
      expect(g.v, g.en).toBeGreaterThan(0);
      expect(g.lb, g.en).toBeGreaterThan(0);
    });
    D.tiers.forEach((tier) => {
      const [lo, hi] = tier.goods;
      ['martial', 'trade'].forEach((th) => {
        const pool = D.goods.filter((g) => g.v >= lo && g.v <= hi && (!g.th || g.th === th));
        expect(pool.length, `${tier.id} ${th}`).toBeGreaterThanOrEqual(4);
      });
    });
  });
});

describe('danger bands', () => {
  it('keeps the luck table averaging 1, so the band targets hold', () => {
    const weight = D.luck.reduce((sum, l) => sum + l.w, 0);
    const mean = D.luck.reduce((sum, l) => sum + l.w * l.k, 0) / weight;
    expect(mean).toBeCloseTo(1, 2);
  });

  it('splits exactly the whole value in every mix', () => {
    const mixes = [...Object.values(D.themeMixes).flat(), ...D.rewardMixes];
    mixes.forEach((mix) => {
      Object.keys(mix).forEach((key) => expect(VALUE_KEYS).toContain(key));
      const share = Object.entries(mix)
        .filter(([key]) => key !== 'w')
        .reduce((sum, [, part]) => sum + part, 0);
      expect(share).toBeCloseTo(1, 5);
    });
  });

  it('splits the coin profiles exactly, in known denominations', () => {
    D.tiers
      .flatMap((t) => [...t.coins, ...t.pocketCoins])
      .forEach((profile) => {
        const parts = Object.entries(profile).filter(([key]) => key !== 'w');
        parts.forEach(([key]) => expect(D.coins).toHaveProperty(key));
        expect(parts.reduce((sum, [, part]) => sum + part, 0)).toBeCloseTo(1, 5);
      });
  });

  it('follows the published item counts per band', () => {
    const mean = (rows) =>
      rows.reduce((sum, row) => sum + row.n * row.w, 0) / rows.reduce((sum, row) => sum + row.w, 0);
    const targets = [1.5, 1.9, 2.5, 3.1];
    D.tiers.forEach((tier, i) => expect(mean(tier.items)).toBeCloseTo(targets[i], 1));
  });
});

describe('magic items', () => {
  it('fills every line correctly', () => {
    D.items.forEach((item) => {
      bilingual(item);
      expect(RARITY_IDS, item.en).toContain(item.r);
      expect(CATS, item.en).toContain(item.cat);
      expect(THEME_IDS, item.en).toContain(item.th);
      if (item.cat !== 'scroll') bilingual(item.note);
      if (item.pick) expect(D.variants, item.en).toHaveProperty(item.pick);
      if (item.att && item.att !== 1) bilingual(item.att);
    });
  });

  it('keeps every item name unique, scrolls apart', () => {
    const names = D.items.filter((i) => i.cat !== 'scroll').map((i) => i.en);
    expect(
      new Set(names).size,
      names.find((n, i) => names.indexOf(n) !== i)
    ).toBe(names.length);
  });

  it('covers every rarity with both consumable and lasting items where the rules have them', () => {
    RARITY_IDS.forEach((r) => {
      const pool = D.items.filter((i) => i.r === r);
      expect(
        pool.some((i) => i.use),
        r
      ).toBe(true);
    });
    ['u', 'r', 'v', 'l'].forEach((r) => {
      expect(
        D.items.some((i) => i.r === r && !i.use),
        r
      ).toBe(true);
    });
  });

  it('has a scroll for every spell level, and spells to put on it', () => {
    expect(D.spells).toHaveLength(10);
    D.spells.forEach((list, level) => {
      expect(list.length, `level ${level}`).toBeGreaterThanOrEqual(15);
      list.forEach(bilingual);
      const scroll = D.items.find((i) => i.cat === 'scroll' && i.level === level);
      expect(scroll.r).toBe(D.scrollStats[level].r);
    });
  });

  it('has bilingual variants', () => {
    Object.entries(D.variants).forEach(([name, list]) => {
      expect(list.length, name).toBeGreaterThan(1);
      list.forEach(bilingual);
    });
  });
});
