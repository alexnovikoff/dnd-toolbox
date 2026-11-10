import {
  DEFAULT_PARAMS,
  DEFAULT_QUICK,
  STORY_KEYS,
  aiKeep,
  aiTargets,
  applyAi,
  coinsText,
  fieldLabel,
  fieldText,
  generate,
  gpText,
  haulMeta,
  haulTitle,
  haulValue,
  haulWeight,
  itemLockKey,
  itemMeta,
  itemName,
  itemNote,
  itemValue,
  lootFacts,
  markKey,
  num,
  quickReady,
  quickRoll,
  quickText,
  quickToText,
  rerollField,
  rerollItem,
  sectionFilled,
  toText,
  valueSections,
} from './engine.js';
import { LOOT_DATA as D } from './data.js';

const P = { ...DEFAULT_PARAMS };
const LANGS = ['ru', 'en'];
const repeat = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));
const mean = (list) => list.reduce((sum, n) => sum + n, 0) / list.length;
const TIERS = D.tiers.map((t) => t.id);

describe('money text', () => {
  it('groups digits the way each language does', () => {
    expect(num(1234567, 'en')).toBe('1,234,567');
    expect(num(1234567, 'ru')).toBe('1 234 567');
    expect(num(999, 'ru')).toBe('999');
  });

  it('lists coins from the most valuable down', () => {
    expect(coinsText({ cp: 40, gp: 1200, sp: 30 }, 'en')).toBe('1,200 gp · 30 sp · 40 cp');
    expect(coinsText({ gp: 5 }, 'ru')).toBe('5 зм');
  });
});

describe('calibration', () => {
  const ROLLS = 4000;
  const TOLERANCE = 0.12;
  const averageValue = (params) =>
    mean(repeat(ROLLS, () => haulValue(generate({ ...P, ...params }))));

  it.each(D.tiers.map((t) => [t.id, t.hoard]))(
    'puts an average hoard of %s near %i gp, whatever the mix',
    (tier, target) => {
      const value = averageValue({ tier });
      expect(value).toBeGreaterThan(target * (1 - TOLERANCE));
      expect(value).toBeLessThan(target * (1 + TOLERANCE));
    }
  );

  it.each(D.tiers.map((t) => [t.id, t.hoard]))(
    'gives a dragon’s lair of %s twice the hoard',
    (tier, target) => {
      const value = averageValue({ tier, kind: 'dragon' });
      expect(value).toBeGreaterThan(2 * target * (1 - TOLERANCE));
      expect(value).toBeLessThan(2 * target * (1 + TOLERANCE));
    }
  );

  it.each(D.tiers.map((t) => [t.id, t.pocket]))(
    'gives creatures of %s about %i gp each in their pockets',
    (tier, target) => {
      const value = averageValue({ tier, kind: 'pockets', bodies: 1 });
      expect(value).toBeGreaterThan(target * (1 - TOLERANCE));
      expect(value).toBeLessThan(target * (1 + TOLERANCE));
    }
  );

  it('scales pockets with the number of creatures', () => {
    const one = averageValue({ tier: 't2', kind: 'pockets', bodies: 1 });
    const ten = averageValue({ tier: 't2', kind: 'pockets', bodies: 10 });
    expect(ten / one).toBeGreaterThan(8);
    expect(ten / one).toBeLessThan(12);
  });

  it('pays a quest reward like one hoard of the party’s level', () => {
    const value = averageValue({ tier: 't2', kind: 'reward' });
    expect(value).toBeGreaterThan(4400 * (1 - TOLERANCE));
    expect(value).toBeLessThan(4400 * (1 + TOLERANCE));
  });

  it('makes generosity count', () => {
    const lean = averageValue({ tier: 't2', bounty: 'lean' });
    const normal = averageValue({ tier: 't2' });
    const rich = averageValue({ tier: 't2', bounty: 'rich' });
    expect(lean).toBeLessThan(normal * 0.75);
    expect(rich).toBeGreaterThan(normal * 1.3);
  });

  it('holds the published item counts per band', () => {
    const counts = D.tiers.map((t) =>
      mean(repeat(ROLLS, () => generate({ ...P, tier: t.id }).items.length))
    );
    [1.5, 1.9, 2.5, 3.1].forEach((target, i) => {
      expect(Math.abs(counts[i] - target), TIERS[i]).toBeLessThan(0.2);
    });
  });

  it('keeps item counts inside the published range for each band', () => {
    const ranges = { t1: [0, 3], t2: [1, 3], t3: [1, 4], t4: [1, 6] };
    TIERS.forEach((tier) => {
      repeat(400, () => {
        const n = generate({ ...P, tier }).items.length;
        expect(n).toBeGreaterThanOrEqual(ranges[tier][0]);
        expect(n).toBeLessThanOrEqual(ranges[tier][1]);
      });
    });
  });

  it('draws low bands from low rarities and high bands from high ones', () => {
    const rarities = (tier) =>
      new Set(repeat(600, () => generate({ ...P, tier }).items.map((l) => l.entry.r)).flat());
    expect([...rarities('t1')]).not.toContain('v');
    expect([...rarities('t1')]).not.toContain('l');
    expect([...rarities('t4')]).not.toContain('c');
    expect([...rarities('t4')]).not.toContain('u');
  });

  it('never hands out a pile no one could count', () => {
    TIERS.forEach((tier) => {
      repeat(300, () => {
        const haul = generate({ ...P, tier });
        (haul.gems ?? []).forEach((s) => expect(s.n).toBeLessThanOrEqual(12));
        expect(haul.art.length).toBeLessThanOrEqual(9);
        expect(haul.goods.length).toBeLessThanOrEqual(3);
      });
    });
  });
});

describe('themes', () => {
  const share = (theme, key, tier = 't3') => {
    const hauls = repeat(1500, () => generate({ ...P, theme, tier }));
    const of = (h) =>
      (h[key] ?? []).reduce((sum, s) => sum + (s.gem ?? s.good ?? s).v * (s.n ?? 1), 0);
    return mean(hauls.map(of)) / mean(hauls.map(haulValue));
  };

  it('fills an arcane hoard with gems and a relic hoard with art', () => {
    expect(share('arcane', 'gems')).toBeGreaterThan(0.45);
    expect(share('relic', 'art')).toBeGreaterThan(0.45);
  });

  it('fills martial and trade hoards with bars and goods', () => {
    expect(share('martial', 'goods')).toBeGreaterThan(0.2);
    expect(share('trade', 'goods')).toBeGreaterThan(0.35);
  });

  it('keeps art out of a martial hoard', () => {
    repeat(300, () => expect(generate({ ...P, theme: 'martial' }).art).toEqual([]));
  });

  it('sells only theme-appropriate goods in a themed hoard', () => {
    repeat(400, () => {
      generate({ ...P, theme: 'martial', tier: 't2' }).goods.forEach(({ good }) => {
        expect(good.th === undefined || good.th === 'martial', good.en).toBe(true);
      });
    });
  });

  it('leans towards items that suit the theme', () => {
    const lines = repeat(800, () => generate({ ...P, theme: 'martial', tier: 't3' }).items).flat();
    const lasting = lines.filter((l) => !l.entry.use);
    expect(lasting.filter((l) => l.entry.th === 'martial').length / lasting.length).toBeGreaterThan(
      0.6
    );
  });

  it('prefers scrolls among the consumables of an arcane hoard', () => {
    const scrollsIn = (theme) => {
      const used = repeat(800, () => generate({ ...P, theme, tier: 't2' }).items)
        .flat()
        .filter((l) => l.entry.use && l.entry.r !== 'c');
      return used.filter((l) => l.entry.cat === 'scroll').length / used.length;
    };
    expect(scrollsIn('arcane')).toBeGreaterThan(scrollsIn('martial') + 0.25);
  });

  it('sometimes holds no coins at all, as the “any” mixes allow', () => {
    const coinless = repeat(600, () => generate({ ...P, tier: 't3' })).filter(
      (h) => !sectionFilled(h, 'coins')
    );
    expect(coinless.length).toBeGreaterThan(0);
  });

  it('ignores a leftover theme for kinds that have none', () => {
    const reward = generate({ ...P, kind: 'reward', theme: 'arcane' });
    const pockets = generate({ ...P, kind: 'pockets', theme: 'relic' });
    expect(reward.theme).toBe('any');
    expect(pockets.theme).toBe('any');
  });
});

describe('generate', () => {
  const KINDS = D.kinds.map((k) => k.id);

  it.each(KINDS)('fills a %s in both languages with nothing undefined', (kind) => {
    repeat(120, (i) => {
      const haul = generate({ ...P, kind, tier: TIERS[i % 4] });
      LANGS.forEach((lang) => {
        const text = toText(haul, lang, 4);
        expect(text).not.toMatch(/undefined|NaN|\[object/);
        expect(haulTitle(haul, lang).length).toBeGreaterThan(0);
        STORY_KEYS[kind].forEach((key) => {
          expect(fieldText(haul, key, lang).length, key).toBeGreaterThan(0);
        });
      });
    });
  });

  it('rounds coins to amounts a GM would say out loud', () => {
    repeat(200, () => {
      Object.values(generate({ ...P, tier: 't3' }).coins).forEach((n) => {
        if (n >= 100) expect(String(n).replace(/^\d{2}/, '')).toMatch(/^0*$/);
      });
    });
  });

  it('gives bodies coins and finds, and no story', () => {
    const haul = generate({ ...P, kind: 'pockets', bodies: 6 });
    expect(haul.finds).toHaveLength(3);
    expect(haul.items).toEqual([]);
    expect(haul.origin).toBeUndefined();
    expect(haulTitle(haul, 'ru')).toBe('С тел: 6 существ');
    expect(haulTitle(generate({ ...P, kind: 'pockets', bodies: 1 }), 'en')).toBe(
      'Off the bodies: 1 creature'
    );
  });

  it('declines the body count in Russian', () => {
    const title = (bodies) => haulTitle(generate({ ...P, kind: 'pockets', bodies }), 'ru');
    expect(title(1)).toBe('С тел: 1 существо');
    expect(title(3)).toBe('С тел: 3 существа');
    expect(title(11)).toBe('С тел: 11 существ');
  });

  it('uses the dragon tables for a lair', () => {
    const titles = new Set(D.origins.dragon.map((o) => o.title.ru));
    repeat(50, () => expect(titles).toContain(generate({ ...P, kind: 'dragon' }).origin.title.ru));
  });

  it('names a patron for a quest reward', () => {
    const titles = new Set(D.patrons.map((o) => o.title.ru));
    const haul = generate({ ...P, kind: 'reward' });
    expect(titles).toContain(haul.origin.title.ru);
    expect(fieldLabel(haul, 'origin', 'ru')).toBe('Кто платит');
    expect(fieldLabel(generate(P), 'origin', 'ru')).toBe('Кто собрал');
  });

  it('never gives one lasting magic item twice in a hoard', () => {
    repeat(400, () => {
      const lasting = generate({ ...P, tier: 't4', kind: 'dragon' })
        .items.filter((l) => !l.entry.use)
        .map((l) => l.entry.en);
      expect(new Set(lasting).size).toBe(lasting.length);
    });
  });

  it('rolls what a line needs: a weapon, a spell, a mark', () => {
    const lines = repeat(600, () => generate({ ...P, tier: 't3', theme: 'martial' }).items).flat();
    lines.forEach((l) => {
      expect(l.mark.ru.length).toBeGreaterThan(0);
      if (l.entry.pick) expect(l.variant).toBeTruthy();
      if (l.entry.cat === 'scroll') expect(D.spells[l.entry.level]).toContain(l.spell);
    });
  });

  it('keeps locked sections and rolls the rest', () => {
    const first = generate({ ...P, tier: 't2', theme: 'trade' });
    const locks = { coins: true, place: true };
    repeat(40, () => {
      const next = generate({ ...P, tier: 't2', theme: 'trade' }, first, locks);
      expect(next.coins).toEqual(first.coins);
      expect(next.place).toEqual(first.place);
    });
  });

  it('keeps a locked item through a new roll, with its place in the list', () => {
    const first = generate({ ...P, tier: 't3' });
    const line = first.items[0];
    const next = generate({ ...P, tier: 't1' }, first, { [itemLockKey(line.uid)]: true });
    expect(next.items[0]).toEqual(line);
  });

  it('does not let a stale lock freeze a section that was empty', () => {
    const empty = { ...generate({ ...P, tier: 't2' }), gems: [] };
    const filled = repeat(80, () =>
      generate({ ...P, tier: 't2', theme: 'arcane' }, empty, { gems: true })
    ).filter((h) => h.gems.length);
    expect(filled.length).toBeGreaterThan(0);
  });

  it('does not carry story fields into another kind of find', () => {
    const hoard = generate({ ...P });
    const reward = generate({ ...P, kind: 'reward' }, hoard, { origin: true, place: true });
    expect(reward.origin).not.toEqual(hoard.origin);
    expect(reward.place).toBeUndefined();
  });

  it('keeps only the AI text of what stays', () => {
    const first = generate({ ...P, tier: 't2' });
    const line = first.items[0];
    const withAi = {
      ...first,
      ai: {
        read: { text: 'x', lang: 'ru' },
        place: { text: 'y', lang: 'ru' },
        hook: { text: 'z', lang: 'ru' },
        [markKey(line.uid)]: { text: 'm', lang: 'ru' },
      },
    };
    const next = generate({ ...P, tier: 't2' }, withAi, {
      place: true,
      [itemLockKey(line.uid)]: true,
    });
    expect(Object.keys(next.ai).sort()).toEqual([markKey(line.uid), 'place'].sort());
  });
});

describe('rerolls', () => {
  const haulWith = (key, params = {}) => {
    for (;;) {
      const haul = generate({ ...P, tier: 't3', ...params });
      if (sectionFilled(haul, key)) return haul;
    }
  };

  it.each(['coins', 'gems', 'art'])('re-rolls %s and leaves the rest alone', (key) => {
    const haul = haulWith(key);
    const next = rerollField(haul, key);
    expect(next.id).toBe(haul.id);
    expect(next[key]).not.toEqual(haul[key]);
    expect(next.origin).toEqual(haul.origin);
    expect(next.items).toEqual(haul.items);
  });

  it('keeps a re-rolled section at about the same worth', () => {
    const haul = haulWith('gems');
    const worth = (h) => h.gems.reduce((sum, s) => sum + s.gem.v * s.n, 0);
    const average = mean(repeat(300, () => worth(rerollField(haul, 'gems'))));
    expect(average).toBeLessThanOrEqual(haul.budget.gems);
    expect(average).toBeGreaterThan(haul.budget.gems * 0.35);
  });

  it('re-rolls a story line and takes its AI text away', () => {
    const haul = generate({ ...P, tier: 't2' });
    const withAi = {
      ...haul,
      ai: { hook: { text: 'x', lang: 'ru' }, place: { text: 'y', lang: 'ru' } },
    };
    const next = rerollField(withAi, 'hook');
    expect(next.hook).not.toEqual(haul.hook);
    expect(next.ai).toEqual({ place: { text: 'y', lang: 'ru' } });
  });

  it('re-rolls an item into another of the same rarity', () => {
    const haul = haulWith('items', { theme: 'martial' });
    const line = haul.items.find((l) => !l.entry.use) ?? haul.items[0];
    const next = rerollItem(haul, line.uid);
    const fresh = next.items[haul.items.indexOf(line)];
    expect(fresh.uid).not.toBe(line.uid);
    expect(fresh.entry.r).toBe(line.entry.r);
    if (line.entry.cat !== 'scroll') expect(fresh.entry.en).not.toBe(line.entry.en);
    expect(next.items.filter((l) => l.uid !== fresh.uid)).toEqual(
      haul.items.filter((l) => l.uid !== line.uid)
    );
  });

  it('re-rolls by the find’s own settings, not the filters of the moment', () => {
    const haul = haulWith('items', { tier: 't1' });
    repeat(60, () => {
      const next = rerollItem(haul, haul.items[0].uid);
      expect(['c', 'u', 'r']).toContain(next.items[0].entry.r);
    });
  });

  it('re-rolls the finds of a body count', () => {
    const haul = generate({ ...P, kind: 'pockets', bodies: 3 });
    const next = rerollField(haul, 'finds');
    expect(next.finds).toHaveLength(haul.finds.length);
    expect(next.finds).not.toEqual(haul.finds);
  });
});

describe('item lines', () => {
  const entry = (en) => D.items.find((i) => i.en === en);
  const line = (en, extra) => ({
    uid: 'u1',
    entry: entry(en),
    variant: null,
    spell: null,
    mark: { ru: 'м', en: 'm' },
    ...extra,
  });

  it('prices by rarity, consumables at half', () => {
    expect(itemValue(line('Cloak of Protection'))).toBe(400);
    expect(itemValue(line('Potion of Healing'))).toBe(50);
    expect(itemValue(line('Potion of Healing (greater)'))).toBe(200);
  });

  it('prices low scrolls by the published price and the rest by rarity', () => {
    const scroll = (level) => ({
      uid: 'u',
      entry: D.items.find((i) => i.cat === 'scroll' && i.level === level),
      mark: { ru: 'м', en: 'm' },
    });
    expect(itemValue(scroll(0))).toBe(30);
    expect(itemValue(scroll(1))).toBe(50);
    expect(itemValue(scroll(3))).toBe(400);
    expect(itemValue(scroll(9))).toBe(200000);
  });

  it('shows the variant and the spell in the name', () => {
    const variant = { ru: 'длинный меч', en: 'longsword' };
    expect(itemName(line('Flame Tongue', { variant }), 'ru')).toBe('Язык пламени (длинный меч)');
    const scroll = {
      entry: D.items.find((i) => i.cat === 'scroll' && i.level === 3),
      spell: { ru: 'Огненный шар', en: 'Fireball' },
    };
    expect(itemName(scroll, 'ru')).toBe('Свиток заклинания: Огненный шар');
    expect(itemName(scroll, 'en')).toBe('Spell Scroll: Fireball');
  });

  it('says who can attune and warns about a catch', () => {
    expect(itemMeta(line('Holy Avenger'), 'ru')).toContain('настройка (паладин)');
    expect(itemMeta(line('Cloak of Protection'), 'ru')).toContain('настройка');
    expect(itemMeta(line('Bag of Holding'), 'ru')).not.toContain('настройка');
    expect(itemMeta(line('Bag of Devouring'), 'ru')).toContain('с подвохом');
    expect(itemMeta(line('Bag of Devouring'), 'en')).toContain('has a catch');
  });

  it('gives a scroll its level, save DC and attack bonus', () => {
    const scroll = { entry: D.items.find((i) => i.cat === 'scroll' && i.level === 3) };
    expect(itemNote(scroll, 'ru')).toContain('Сл спасброска 15');
    expect(itemNote(scroll, 'en')).toContain('attack bonus +7');
    expect(itemMeta({ ...scroll, mark: {} }, 'ru')).toContain('круг 3');
    const cantrip = { entry: D.items.find((i) => i.cat === 'scroll' && i.level === 0), mark: {} };
    expect(itemMeta(cantrip, 'en')).toContain('cantrip');
  });
});

describe('totals and text', () => {
  const HAUL = {
    id: 'h',
    kind: 'hoard',
    tier: 't2',
    theme: 'martial',
    bounty: 'rich',
    bodies: 4,
    budget: {},
    coins: { gp: 1000, sp: 500 },
    gems: [
      { gem: { ru: 'гранат', en: 'garnet', v: 100 }, n: 3, detail: null },
      {
        gem: { ru: 'топаз', en: 'topaz', v: 500 },
        n: 1,
        detail: { ru: 'с дымкой', en: 'with a haze' },
      },
    ],
    art: [{ ru: 'Кубок', en: 'A goblet', v: 250 }],
    goods: [{ good: { ru: 'Мешок', en: 'A sack', v: 1, lb: 20 }, n: 3 }],
    items: [],
    origin: { title: { ru: 'Казна', en: 'Chest' }, who: { ru: 'Наёмники', en: 'Mercenaries' } },
    place: { ru: 'В колодце', en: 'In a well' },
    guard: { ru: 'Страж', en: 'A guard' },
    hook: { ru: 'Письмо', en: 'A letter' },
    ai: null,
  };

  it('adds up the value and leaves magic items out', () => {
    expect(haulValue(HAUL)).toBe(1000 + 50 + 300 + 500 + 250 + 3);
  });

  it('weighs coins at fifty to the pound, plus goods', () => {
    expect(haulWeight(HAUL)).toBeCloseTo(30 + 60);
  });

  it('writes stacks so that Russian needs no agreement', () => {
    expect(fieldText(HAUL, 'gems', 'ru')).toEqual([
      '3 × гранат (по 100 зм)',
      'Топаз с дымкой, 500 зм',
    ]);
    expect(fieldText(HAUL, 'gems', 'en')).toEqual([
      '3 × garnet (100 gp each)',
      'Topaz with a haze, 500 gp',
    ]);
    expect(fieldText(HAUL, 'goods', 'ru')).toEqual(['3 × Мешок (по 1 зм), 60 фнт.']);
  });

  it('describes the find in one line', () => {
    expect(haulMeta(HAUL, 'ru')).toBe('Клад · опасность 5–10 · воинский · щедро');
    expect(haulMeta(HAUL, 'en')).toBe('Hoard · CR 5–10 · martial · generous');
    expect(haulMeta({ ...HAUL, kind: 'reward', bounty: 'normal' }, 'ru')).toBe(
      'Награда за квест · уровень партии 5–10'
    );
  });

  it('skips sections with nothing in them', () => {
    expect(valueSections(HAUL)).toEqual(['coins', 'gems', 'art', 'goods']);
    expect(valueSections({ ...HAUL, gems: [], coins: {} })).toEqual(['art', 'goods']);
  });

  it('prints the find as plain text with each share', () => {
    const text = toText(HAUL, 'ru', 4);
    expect(text).toContain('Казна');
    expect(text).toContain('Монеты: 1 000 зм · 500 см');
    expect(text).toContain('- 3 × гранат (по 100 зм)');
    expect(text).toContain('на 4: ≈');
    expect(text).toContain('Где лежит: В колодце');
  });

  it('formats a gold price', () => {
    expect(gpText(36000, 'en')).toBe('36,000 gp');
  });
});

describe('AI overlay', () => {
  const haulOf = (params = {}) => {
    for (;;) {
      const haul = generate({ ...P, tier: 't3', ...params });
      if (haul.items.length >= 2) return haul;
    }
  };

  it('asks for the read-aloud, the story and the marks', () => {
    const haul = haulOf();
    expect(aiTargets(haul)).toEqual([
      'read',
      'origin',
      'place',
      'guard',
      'hook',
      ...haul.items.map((l) => markKey(l.uid)),
    ]);
  });

  it('leaves locked lines and locked items alone', () => {
    const haul = haulOf();
    const line = haul.items[0];
    const targets = aiTargets(haul, { place: true, [itemLockKey(line.uid)]: true });
    expect(targets).not.toContain('place');
    expect(targets).not.toContain(markKey(line.uid));
    expect(aiKeep(haul, { place: true })).toEqual(['place']);
  });

  it('sends facts only as text', () => {
    const haul = haulOf();
    const facts = lootFacts(haul, 'ru');
    expect(facts.title).toBe(haulTitle(haul, 'ru'));
    expect(Array.isArray(facts.items)).toBe(true);
    expect(facts.items).toHaveLength(haul.items.length);
    expect(typeof facts.place).toBe('string');
    expect(facts.items[0]).toContain(itemName(haul.items[0], 'ru'));
  });

  it('overlays text in its own language and matches marks by order', () => {
    const haul = haulOf();
    const targets = aiTargets(haul);
    const done = applyAi(
      haul,
      { read: 'Сундук приоткрыт.', hook: 'Письмо адресовано вам.', marks: ['Первый', 'Второй'] },
      targets,
      'ru'
    );
    expect(fieldText(done, 'read', 'ru')).toBe('Сундук приоткрыт.');
    expect(fieldText(done, 'hook', 'ru')).toBe('Письмо адресовано вам.');
    expect(fieldText(done, 'hook', 'en')).toBe(haul.hook.en);
    expect(fieldText(done, 'read', 'en')).toBe('');
    expect(done.ai[markKey(haul.items[0].uid)].text).toBe('Первый');
    expect(done.ai[markKey(haul.items[1].uid)].text).toBe('Второй');
  });

  it('takes only what it asked for', () => {
    const haul = haulOf();
    const done = applyAi(haul, { read: 'x', hook: 'y', title: 'z' }, ['read'], 'ru');
    expect(Object.keys(done.ai)).toEqual(['read']);
  });

  it('returns null for an answer with nothing usable', () => {
    const haul = haulOf();
    expect(applyAi(haul, null, aiTargets(haul), 'ru')).toBeNull();
    expect(applyAi(haul, { read: '   ', hook: 7 }, aiTargets(haul), 'ru')).toBeNull();
  });
});

describe('quick rolls', () => {
  const O = { ...DEFAULT_QUICK };

  it('rolls every type with text in both languages', () => {
    ['coins', 'gem', 'art', 'trinket', 'potion', 'scroll', 'item'].forEach((type) => {
      repeat(60, () => {
        const pick = quickRoll(type, O, 't3');
        LANGS.forEach((lang) => {
          const { title } = quickText(pick, lang);
          expect(title.length, type).toBeGreaterThan(0);
          expect(quickToText(pick, lang)).not.toMatch(/undefined|\.\./);
        });
      });
    });
  });

  it('respects the chosen value and rarity', () => {
    repeat(40, () => {
      expect(quickRoll('gem', { ...O, gem: '500' }, 't1').gem.v).toBe(500);
      expect(quickRoll('art', { ...O, art: '750' }, 't1').art.v).toBe(750);
      expect(quickRoll('potion', { ...O, potion: 'r' }, 't1').line.entry.r).toBe('r');
      const scroll = quickRoll('scroll', { ...O, scroll: '3' }, 't1').line;
      expect(scroll.entry.level).toBe(3);
      expect(scroll.entry.r).toBe('u');
    });
  });

  it('follows the danger band when rarity is left open', () => {
    repeat(200, () => {
      expect(['c', 'u', 'r']).toContain(quickRoll('potion', O, 't1').line.entry.r);
    });
  });

  it('keeps potions and scrolls out of the general item row unless asked', () => {
    repeat(200, () => {
      expect(['potion', 'scroll']).not.toContain(quickRoll('item', O, 't3').line.entry.cat);
    });
    expect(quickRoll('item', { ...O, itemCat: 'ring' }, 't3').line.entry.cat).toBe('ring');
  });

  it('says when no item fits the filters', () => {
    expect(quickReady('item', { ...O, itemRarity: 'c', itemCat: 'ring' })).toBe(false);
    expect(quickReady('item', { ...O, itemRarity: 'r', itemCat: 'ring' })).toBe(true);
    expect(quickReady('gem', O)).toBe(true);
  });
});
