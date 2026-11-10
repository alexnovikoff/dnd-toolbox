import {
  DEFAULT_PARAMS,
  FIELD_KEYS,
  LEVEL_FIELDS,
  ageText,
  aiTargets,
  applyAi,
  completeNpc,
  crowd,
  fieldText,
  generate,
  npcFacts,
  rerollField,
  say,
  toText,
  whoText,
} from './engine.js';
import { NPC_DATA as D } from './data.js';

const P = { ...DEFAULT_PARAMS };
const LANGS = ['ru', 'en'];
const repeat = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));

describe('say — gender markers', () => {
  it('resolves {m|f} pairs for the NPC gender', () => {
    const e = { ru: 'Служил{|а} писар{ем|шей}', en: 'Served as a clerk' };
    expect(say(e, 'ru', 'm')).toBe('Служил писарем');
    expect(say(e, 'ru', 'f')).toBe('Служила писаршей');
    expect(say(e, 'en', 'f')).toBe('Served as a clerk');
  });

  it('returns an empty string for a missing entry', () => {
    expect(say(null, 'ru', 'm')).toBe('');
  });
});

describe('ageText / whoText', () => {
  it('declines Russian years', () => {
    expect(ageText(21, 'ru')).toBe('21 год');
    expect(ageText(22, 'ru')).toBe('22 года');
    expect(ageText(25, 'ru')).toBe('25 лет');
    expect(ageText(11, 'ru')).toBe('11 лет');
    expect(ageText(112, 'ru')).toBe('112 лет');
    expect(ageText(101, 'ru')).toBe('101 год');
  });

  it('renders the identity line in both languages', () => {
    const who = { race: { id: 'elf', ru: 'эльф', en: 'elf' }, gender: 'f', age: 212 };
    expect(whoText(who, 'ru')).toBe('эльф, женщина, 212 лет');
    expect(whoText(who, 'en')).toBe('elf, female, age 212');
  });
});

describe('generate', () => {
  it('fills every field in both languages with no leftover markers', () => {
    repeat(300, () => {
      const npc = generate({ ...P, level: 'key' });
      for (const key of FIELD_KEYS) {
        for (const lang of LANGS) {
          const text = fieldText(npc, key, lang);
          const joined = Array.isArray(text) ? text.join(' ') : text;
          expect(joined.length, key).toBeGreaterThan(0);
          expect(joined, key).not.toMatch(/[{}|]/);
        }
      }
    });
  });

  it('honours the race, gender and occupation filters', () => {
    repeat(100, () => {
      const npc = generate({ ...P, race: 'dwarf', gender: 'f', occ: 'shady' });
      expect(npc.who.race.id).toBe('dwarf');
      expect(npc.who.gender).toBe('f');
      expect(npc.occupation.c).toBe('shady');
    });
  });

  it('draws the name from the rolled race and gender', () => {
    const race = D.races.find((r) => r.id === 'elf');
    const firsts = race.names.f.map((n) => n.en);
    repeat(50, () => {
      const npc = generate({ ...P, race: 'elf', gender: 'f' });
      expect(firsts).toContain(npc.name.en.split(' ')[0]);
    });
  });

  it('keeps the age inside the range of the race', () => {
    const race = D.races.find((r) => r.id === 'halfling');
    repeat(100, () => {
      const { age } = generate({ ...P, race: 'halfling' }).who;
      expect(age).toBeGreaterThanOrEqual(race.age[0]);
      expect(age).toBeLessThanOrEqual(race.age[1]);
    });
  });

  it('never mixes in entries of another tone', () => {
    repeat(200, () => {
      const npc = generate({ ...P, tone: 'grim' });
      for (const key of [
        'feature',
        'manner',
        'mood',
        'want',
        'secret',
        'background',
        'hook',
        'plan',
      ]) {
        expect(npc[key].t === undefined || npc[key].t === 'grim', key).toBe(true);
      }
    });
  });

  it('uses only entries that fit the rolled occupation', () => {
    repeat(200, () => {
      const npc = generate(P);
      for (const key of ['feature', 'manner', 'want', 'secret', 'background', 'hook', 'plan']) {
        expect(npc[key].c === undefined || npc[key].c === npc.occupation.c, key).toBe(true);
      }
    });
  });

  it('gives scaly races no details that need hair', () => {
    repeat(300, () => {
      expect(generate({ ...P, race: 'dragonborn' }).feature.hair).toBeUndefined();
    });
  });

  it('picks the stock combat profile from the occupation', () => {
    repeat(50, () => {
      const npc = generate(P);
      expect(npc.combat.stat).toBe(npc.occupation.stat);
    });
  });

  it('rolls three distinct facts', () => {
    repeat(50, () => {
      const { knows } = generate(P);
      expect(knows).toHaveLength(3);
      expect(new Set(knows).size).toBe(3);
    });
  });

  it('starts with a fresh id, the chosen level and no AI text', () => {
    const a = generate({ ...P, level: 'recurring' });
    const b = generate({ ...P, level: 'recurring' });
    expect(a.id).not.toBe(b.id);
    expect(a.level).toBe('recurring');
    expect(a.ai).toBeNull();
  });

  it('carries locked fields over from prev and rerolls the rest', () => {
    const prev = generate(P);
    const next = generate(P, prev, { secret: true, name: true });
    expect(next.secret).toBe(prev.secret);
    expect(next.name).toBe(prev.name);
    expect(next.id).not.toBe(prev.id);
    // `who` is built fresh on every roll; a table entry could repeat by chance
    expect(next.who).not.toBe(prev.who);
  });

  it('keeps AI text only on locked fields', () => {
    const prev = {
      ...generate(P),
      ai: {
        secret: { text: 'Тайна', lang: 'ru' },
        want: { text: 'Хочет', lang: 'ru' },
        quote: { text: 'Реплика', lang: 'ru' },
      },
    };
    const next = generate(P, prev, { secret: true });
    expect(next.ai).toEqual({ secret: { text: 'Тайна', lang: 'ru' } });
  });

  it('keeps the category of a locked occupation for the other tables', () => {
    const prev = generate({ ...P, occ: 'law' });
    repeat(100, () => {
      const next = generate({ ...P, occ: 'shady' }, prev, { occupation: true });
      expect(next.occupation).toBe(prev.occupation);
      expect(next.want.c === undefined || next.want.c === 'law').toBe(true);
    });
  });
});

describe('rerollField', () => {
  it('changes exactly one field and keeps the NPC identity', () => {
    const npc = generate(P);
    const next = rerollField(npc, 'secret', P);
    expect(next.id).toBe(npc.id);
    expect(next.secret).not.toEqual(npc.secret);
    for (const key of FIELD_KEYS.filter((k) => k !== 'secret')) {
      expect(next[key], key).toBe(npc[key]);
    }
  });

  it('never rerolls into the same value', () => {
    repeat(100, () => {
      const npc = generate(P);
      expect(rerollField(npc, 'mood', P).mood).not.toEqual(npc.mood);
    });
  });

  it('drops the AI text of the rerolled field only', () => {
    const npc = {
      ...generate(P),
      ai: { secret: { text: 'a', lang: 'ru' }, want: { text: 'b', lang: 'ru' } },
    };
    expect(rerollField(npc, 'secret', P).ai).toEqual({ want: { text: 'b', lang: 'ru' } });
  });

  it('renames the NPC when a reroll changes race or gender', () => {
    const npc = generate({ ...P, race: 'dwarf', gender: 'm' });
    const next = rerollField(npc, 'who', { ...P, race: 'elf', gender: 'f' });
    const firsts = D.races.find((r) => r.id === 'elf').names.f.map((n) => n.en);
    expect(firsts).toContain(next.name.en.split(' ')[0]);
  });

  it('keeps the name when only the age changed', () => {
    const params = { ...P, race: 'dwarf', gender: 'm' };
    const npc = generate(params);
    const next = rerollField(npc, 'who', params);
    expect(next.who.age).not.toBe(npc.who.age);
    expect(next.name).toBe(npc.name);
  });

  it('keeps a locked name even when the race changes', () => {
    const npc = generate({ ...P, race: 'dwarf', gender: 'm' });
    const next = rerollField(npc, 'who', { ...P, race: 'elf', gender: 'f' }, { name: true });
    expect(next.who.race.id).toBe('elf');
    expect(next.name).toBe(npc.name);
  });

  it('moves the combat profile with the occupation unless it is locked', () => {
    const tactic = D.tactics.find((e) => e.fighter === undefined);
    const npc = { ...generate({ ...P, occ: 'common' }), combat: { stat: 'commoner', tactic } };
    const shady = { ...P, occ: 'shady' };
    const next = rerollField(npc, 'occupation', shady);
    expect(next.combat.stat).toBe(next.occupation.stat);
    expect(next.combat.tactic).toBe(npc.combat.tactic);
    const locked = rerollField(npc, 'occupation', shady, { combat: true });
    expect(locked.combat).toBe(npc.combat);
  });
});

describe('crowd', () => {
  it('rolls the requested number of distinct passers-by', () => {
    const people = crowd({ ...P, level: 'key' }, 7);
    expect(people).toHaveLength(7);
    expect(new Set(people.map((n) => n.id)).size).toBe(7);
    people.forEach((n) => expect(n.level).toBe('passerby'));
  });

  it('honours the filters', () => {
    crowd({ ...P, race: 'gnome', occ: 'road' }, 5).forEach((n) => {
      expect(n.who.race.id).toBe('gnome');
      expect(n.occupation.c).toBe('road');
    });
  });
});

describe('completeNpc', () => {
  const TAGGED_DEEP = ['secret', 'background', 'hook', 'plan'];
  const passerby = (params = P) => crowd(params, 1)[0];

  it('raises the NPC to the full form and keeps its identity', () => {
    const npc = passerby();
    const full = completeNpc(npc, P);
    expect(full.level).toBe('key');
    expect(full.id).toBe(npc.id);
  });

  it('keeps every field already shown', () => {
    const npc = passerby();
    const full = completeNpc(npc, P);
    LEVEL_FIELDS.passerby.forEach((key) => expect(full[key], key).toBe(npc[key]));
  });

  it('keeps what a recurring NPC already shows', () => {
    const npc = { ...passerby(), level: 'recurring' };
    const full = completeNpc(npc, P);
    LEVEL_FIELDS.recurring.forEach((key) => expect(full[key], key).toBe(npc[key]));
  });

  it('rolls the fields not shown yet with the current filters', () => {
    repeat(200, () => {
      const full = completeNpc(passerby({ ...P, tone: 'comic' }), { ...P, tone: 'grim' });
      TAGGED_DEEP.forEach((key) => {
        expect(full[key].t === undefined || full[key].t === 'grim', key).toBe(true);
      });
    });
  });

  it('ties the new fields to the occupation of this NPC, not the filter', () => {
    repeat(200, () => {
      const npc = passerby({ ...P, occ: 'law' });
      const full = completeNpc(npc, { ...P, occ: 'shady' });
      expect(full.occupation).toBe(npc.occupation);
      TAGGED_DEEP.forEach((key) => {
        expect(full[key].c === undefined || full[key].c === 'law', key).toBe(true);
      });
      expect(full.combat.stat).toBe(npc.occupation.stat);
    });
  });

  it('leaves locked hidden fields as they are', () => {
    const npc = passerby();
    const full = completeNpc(npc, P, { secret: true });
    expect(full.secret).toBe(npc.secret);
  });

  it('keeps AI text on what was shown and drops it elsewhere', () => {
    const line = (text) => ({ text, lang: 'ru' });
    const npc = {
      ...passerby(),
      ai: { want: line('Уйти'), quote: line('Эй'), secret: line('Тайна') },
    };
    expect(completeNpc(npc, P).ai).toEqual({ want: line('Уйти'), quote: line('Эй') });
  });
});

describe('how rolls are shared out', () => {
  const FIELDS = [
    'feature',
    'manner',
    'mood',
    'want',
    'secret',
    'lever',
    'background',
    'hook',
    'plan',
    'offer',
  ];
  const ROLLS = 1500;

  // The size of a table says little if a few entries take most of the rolls.
  it.each(['any', 'plain'])('lets no entry take over an occupation circle (tone %s)', (tone) => {
    for (const { id: occ } of D.occCategories) {
      const tally = FIELDS.map(() => new Map());
      repeat(ROLLS, () => {
        const npc = generate({ ...P, occ, tone });
        FIELDS.forEach((key, i) => tally[i].set(npc[key], (tally[i].get(npc[key]) ?? 0) + 1));
      });
      FIELDS.forEach((key, i) => {
        const top = Math.max(...tally[i].values()) / ROLLS;
        expect(top, `${occ}: ${key}`).toBeLessThan(0.13);
      });
    }
  });

  it('still favours entries written for the occupation', () => {
    const own = repeat(ROLLS, () => generate({ ...P, occ: 'craft' }).want.c === 'craft');
    // 8 of the 76 wants a craftsperson can draw are their own, so 10% if rolled evenly.
    expect(own.filter(Boolean).length / ROLLS).toBeGreaterThan(0.3);
  });

  it('leaves room for ordinary entries when many are written for this NPC', () => {
    const features = repeat(ROLLS, () => generate({ ...P, occ: 'law', tone: 'grim' }).feature);
    // 24 of the 89 fitting details are specific: a 60% cap leaves ordinary ones about 29%.
    expect(features.filter((e) => !e.c && !e.t).length / ROLLS).toBeGreaterThan(0.15);
  });
});

describe('who can carry an entry', () => {
  const HUMAN = { ...P, race: 'human' };
  const FACIAL_HAIR = /beard in two braids|moustache waxed/;
  const adultYears = (who) => who.age - D.races.find((r) => r.id === who.race.id).age[0];
  const needsTwentyYears = () => D.backgrounds.find((e) => e.minYears === 20);
  const beard = () => D.features.find((e) => FACIAL_HAIR.test(e.en));

  it('respects the age bounds of every entry', () => {
    let bound = 0;
    repeat(3000, () => {
      const npc = generate(HUMAN);
      const years = adultYears(npc.who);
      FIELD_KEYS.flatMap((key) => npc[key]).forEach(({ ru, minYears, maxYears }) => {
        if (minYears === undefined && maxYears === undefined) return;
        bound += 1;
        expect(years, ru).toBeGreaterThanOrEqual(minYears ?? 0);
        expect(years, ru).toBeLessThanOrEqual(maxYears ?? Infinity);
      });
    });
    expect(bound).toBeGreaterThan(0);
  });

  it.each([
    ['human', 'f'],
    ['dwarf', 'f'],
    ['elf', 'm'],
    ['halfling', 'm'],
  ])('grows no beard on %s %s', (race, gender) => {
    repeat(1500, () => {
      expect(generate({ ...P, race, gender }).feature.en).not.toMatch(FACIAL_HAIR);
    });
  });

  it('still gives beards to the men who can grow them', () => {
    const features = repeat(4000, () => generate({ ...P, race: 'dwarf', gender: 'm' }).feature.en);
    expect(features.some((en) => FACIAL_HAIR.test(en))).toBe(true);
  });

  it('picks a new age that agrees with what the card already says', () => {
    repeat(300, () => {
      const npc = { ...generate(HUMAN), background: needsTwentyYears() };
      expect(adultYears(rerollField(npc, 'who', HUMAN).who)).toBeGreaterThanOrEqual(20);
    });
  });

  it('finds the one age that agrees with two bounds on the card', () => {
    const plain = { ru: 'Нет условий', en: 'No conditions' };
    const earlyGrey = D.features.find((e) => e.maxYears === 20);
    repeat(100, () => {
      const npc = {
        ...generate(HUMAN),
        feature: earlyGrey,
        background: needsTwentyYears(),
        want: plain,
        secret: plain,
        lever: plain,
        talk: plain,
      };
      expect(adultYears(rerollField(npc, 'who', HUMAN, { feature: true }).who)).toBe(20);
    });
  });

  it('keeps a locked beard on a man', () => {
    repeat(300, () => {
      const npc = { ...generate({ ...HUMAN, gender: 'm' }), feature: beard() };
      expect(rerollField(npc, 'who', HUMAN, { feature: true }).who.gender).toBe('m');
    });
  });

  it('lets a reroll change the gender even with a beard on the card', () => {
    const genders = repeat(100, () => {
      const npc = { ...generate({ ...HUMAN, gender: 'm' }), feature: beard() };
      return rerollField(npc, 'who', HUMAN).who.gender;
    });
    expect(genders).toContain('f');
  });

  it('replaces a beard when a reroll makes the NPC a woman', () => {
    repeat(300, () => {
      const npc = { ...generate({ ...HUMAN, gender: 'm' }), feature: beard() };
      const next = rerollField(npc, 'who', { ...HUMAN, gender: 'f' });
      expect(next.who.gender).toBe('f');
      expect(next.feature.en).not.toMatch(FACIAL_HAIR);
    });
  });

  it('drops the AI text of a detail the new person cannot carry', () => {
    const npc = {
      ...generate({ ...HUMAN, gender: 'm' }),
      feature: beard(),
      ai: { feature: { text: 'Борода', lang: 'ru' }, want: { text: 'Уйти', lang: 'ru' } },
    };
    const next = rerollField(npc, 'who', { ...HUMAN, gender: 'f' });
    expect(next.ai).toEqual({ want: { text: 'Уйти', lang: 'ru' } });
  });

  it('gives race-bound details to their own race only', () => {
    repeat(1500, () => expect(generate(HUMAN).feature.raceOnly).toBeUndefined());
    repeat(1500, () => {
      const { raceOnly } = generate({ ...P, race: 'tiefling' }).feature;
      expect(raceOnly === undefined || raceOnly === 'tiefling').toBe(true);
    });
  });

  it('shows race-bound details often enough to notice', () => {
    const details = repeat(1500, () => generate({ ...P, race: 'tiefling' }).feature.raceOnly);
    expect(details.filter(Boolean).length / 1500).toBeGreaterThan(0.1);
  });

  describe('a detail bound to a race', () => {
    const TIEFLING = { ...P, race: 'tiefling' };
    const horns = () => D.features.find((e) => e.raceOnly === 'tiefling');

    it('gives way when the race changes', () => {
      const npc = { ...generate(TIEFLING), feature: horns() };
      const next = rerollField(npc, 'who', HUMAN);
      expect(next.who.race.id).toBe('human');
      expect(next.feature.raceOnly).toBeUndefined();
    });

    it('stays when the race stays', () => {
      const npc = { ...generate(TIEFLING), feature: horns() };
      expect(rerollField(npc, 'who', TIEFLING).feature).toBe(npc.feature);
    });

    it('does not pin the race while it is unlocked', () => {
      const npc = { ...generate(TIEFLING), feature: horns() };
      const races = repeat(100, () => rerollField(npc, 'who', P).who.race.id);
      expect(new Set(races).size).toBeGreaterThan(1);
    });

    it('holds the race while it is locked', () => {
      const npc = { ...generate(TIEFLING), feature: horns() };
      repeat(100, () => {
        expect(rerollField(npc, 'who', P, { feature: true }).who.race.id).toBe('tiefling');
      });
    });

    it('holds the race of a new NPC around a locked detail', () => {
      const prev = { ...generate(TIEFLING), feature: horns() };
      repeat(100, () => {
        expect(generate(P, prev, { feature: true }).who.race.id).toBe('tiefling');
      });
    });
  });

  it('fits a new person around a locked entry', () => {
    const prev = { ...generate(HUMAN), background: needsTwentyYears() };
    repeat(300, () => {
      const next = generate(HUMAN, prev, { background: true });
      expect(next.background).toBe(prev.background);
      expect(adultYears(next.who)).toBeGreaterThanOrEqual(20);
    });
  });

  it('can still reroll a saved NPC younger than the current minimum age', () => {
    const npc = generate({ ...P, race: 'orc' });
    const saved = { ...npc, who: { ...npc.who, age: 12 } };
    repeat(50, () => {
      expect(rerollField(saved, 'background', P).background.ru.length).toBeGreaterThan(0);
    });
  });

  it.each([
    ['herbalist', 'Druid'],
    ['hermit', 'Druid'],
    ['pit fighter', 'Gladiator'],
    ['street gang leader', 'Bandit Captain'],
  ])('fights as the closest SRD profile: %s is a %s', (job, profile) => {
    const occupation = D.occupations.find((o) => o.en === job);
    const npc = generate(P, { occupation }, { occupation: true });
    expect(fieldText(npc, 'combat', 'en')).toContain(`${profile} stat block`);
  });
});

describe('what an NPC knows', () => {
  it('stays within what their circle could know', () => {
    repeat(300, () => {
      const npc = generate(P);
      npc.knows.forEach((e) => {
        expect(e.c === undefined || e.c === npc.occupation.c, e.ru).toBe(true);
      });
    });
  });

  it('favours what their own circle knows', () => {
    const own = repeat(800, () => {
      return generate({ ...P, occ: 'wild' }).knows.filter((e) => e.c === 'wild').length;
    });
    // Rolled evenly, about 0.8 of the 3 facts would be their own.
    expect(own.reduce((sum, n) => sum + n, 0) / 800).toBeGreaterThan(1.2);
  });
});

describe('allies and enemies', () => {
  const inCircle = (entry, occ) => entry.c === undefined || entry.c === occ;

  it('names one ally and one enemy from the circle of the NPC', () => {
    repeat(300, () => {
      const npc = generate({ ...P, occ: 'wild' });
      const ally = D.allies.find((e) => npc.ties.ru.startsWith(`${e.ru}, `));
      const enemy = D.enemies.find((e) => npc.ties.ru.endsWith(`, ${e.ru}`));
      expect(inCircle(ally, 'wild'), npc.ties.ru).toBe(true);
      expect(inCircle(enemy, 'wild'), npc.ties.ru).toBe(true);
    });
  });

  it('builds far more pairs than there are lines in either list', () => {
    const pairs = repeat(1500, () => generate(P).ties.en);
    expect(new Set(pairs).size).toBeGreaterThan(D.allies.length + D.enemies.length);
  });
});

describe('how an NPC fights', () => {
  const FARMER = D.occupations.find((o) => o.en === 'farmer');
  const KNIGHT = D.occupations.find((o) => o.en === 'knight errant');
  const rollAs = (occupation) => generate(P, { occupation }, { occupation: true });

  it.each([
    ['a farmer', FARMER, true],
    ['a knight', KNIGHT, false],
  ])('never gives %s the tactics of the other side', (_, occupation, wrong) => {
    repeat(400, () => expect(rollAs(occupation).combat.tactic.fighter).not.toBe(wrong));
  });

  it('swaps only a tactic that the new occupation makes wrong', () => {
    const tactic = D.tactics.find((e) => e.fighter === false);
    const npc = { ...rollAs(FARMER), combat: { stat: 'commoner', tactic } };
    repeat(300, () => {
      const next = rerollField(npc, 'occupation', P);
      if (D.stats[next.occupation.stat].fighter) {
        expect(next.combat.tactic.fighter).not.toBe(false);
      } else {
        expect(next.combat.tactic).toBe(tactic);
      }
    });
  });
});

describe('levels', () => {
  it('nests every level inside the next', () => {
    expect(LEVEL_FIELDS.recurring.slice(0, LEVEL_FIELDS.passerby.length)).toEqual(
      LEVEL_FIELDS.passerby
    );
    expect(LEVEL_FIELDS.key.slice(0, LEVEL_FIELDS.recurring.length)).toEqual(
      LEVEL_FIELDS.recurring
    );
    expect(LEVEL_FIELDS.key).toEqual(FIELD_KEYS);
  });

  it('shows two facts for a recurring NPC and three for a key one', () => {
    const npc = generate(P);
    expect(fieldText({ ...npc, level: 'recurring' }, 'knows', 'ru')).toHaveLength(2);
    expect(fieldText({ ...npc, level: 'key' }, 'knows', 'ru')).toHaveLength(3);
  });
});

describe('fieldText', () => {
  it('prefers AI text in its own language and falls back to the table', () => {
    const npc = { ...generate(P), ai: { want: { text: 'Новое желание', lang: 'ru' } } };
    expect(fieldText(npc, 'want', 'ru')).toBe('Новое желание');
    expect(fieldText(npc, 'want', 'en')).toBe(npc.want.en);
  });
});

describe('AI helpers', () => {
  it('targets the quote plus the unlocked rewritable fields of the level', () => {
    const npc = { ...generate(P), level: 'passerby' };
    expect(aiTargets(npc, {})).toEqual(['quote', 'feature', 'manner', 'want']);
    expect(aiTargets(npc, { manner: true })).toEqual(['quote', 'feature', 'want']);
  });

  it('never targets identity, attitude or combat', () => {
    const targets = aiTargets({ ...generate(P), level: 'key' }, {});
    for (const key of ['who', 'name', 'occupation', 'mood', 'combat']) {
      expect(targets).not.toContain(key);
    }
    expect(targets).toContain('secret');
    expect(targets).toContain('plan');
  });

  it('sends only the fields visible at the level', () => {
    const npc = { ...generate(P), level: 'passerby' };
    const facts = npcFacts(npc, 'en');
    expect(facts.name).toBe(fieldText(npc, 'name', 'en'));
    expect(facts.want).toBe(npc.want.en);
    expect(facts).not.toHaveProperty('secret');
  });

  it('joins facts into one line and uses existing AI text', () => {
    const npc = {
      ...generate(P),
      level: 'key',
      ai: { want: { text: 'Новое желание', lang: 'ru' } },
    };
    const facts = npcFacts(npc, 'ru');
    expect(typeof facts.knows).toBe('string');
    expect(facts.knows).toContain('; ');
    expect(facts.want).toBe('Новое желание');
  });

  it('stores usable answers with their language', () => {
    const npc = generate(P);
    const next = applyAi(npc, { quote: 'Чего надо?', want: ' Уйти. ' }, ['quote', 'want'], 'ru');
    expect(next.ai).toEqual({
      quote: { text: 'Чего надо?', lang: 'ru' },
      want: { text: 'Уйти.', lang: 'ru' },
    });
  });

  it('ignores keys it did not ask for and non-text values', () => {
    const npc = generate(P);
    const next = applyAi(npc, { secret: 'x', want: 42, quote: 'ok' }, ['quote', 'want'], 'en');
    expect(next.ai).toEqual({ quote: { text: 'ok', lang: 'en' } });
  });

  it('keeps earlier AI text on fields this answer did not touch', () => {
    const npc = { ...generate(P), ai: { secret: { text: 'a', lang: 'ru' } } };
    const next = applyAi(npc, { want: 'b' }, ['want'], 'ru');
    expect(next.ai.secret).toEqual({ text: 'a', lang: 'ru' });
    expect(next.ai.want).toEqual({ text: 'b', lang: 'ru' });
  });

  it('normalises «knows» to a list of strings', () => {
    const npc = generate(P);
    expect(applyAi(npc, { knows: ['a', ' ', 'b'] }, ['knows'], 'ru').ai.knows.text).toEqual([
      'a',
      'b',
    ]);
    expect(applyAi(npc, { knows: 'один факт' }, ['knows'], 'ru').ai.knows.text).toEqual([
      'один факт',
    ]);
  });

  it('strips quotation marks the model put around the quote', () => {
    const npc = generate(P);
    expect(applyAi(npc, { quote: '«Чего надо?»' }, ['quote'], 'ru').ai.quote.text).toBe(
      'Чего надо?'
    );
    expect(applyAi(npc, { quote: '"Move along."' }, ['quote'], 'en').ai.quote.text).toBe(
      'Move along.'
    );
  });

  it('returns null when nothing in the answer is usable', () => {
    const npc = generate(P);
    expect(applyAi(npc, { quote: '  ', other: 'x' }, ['quote'], 'ru')).toBeNull();
    expect(applyAi(npc, null, ['quote'], 'ru')).toBeNull();
  });
});

describe('toText', () => {
  const npc = {
    ...generate(P),
    who: { race: { id: 'human', ru: 'человек', en: 'human' }, gender: 'm', age: 50 },
    name: { ru: 'Брам', en: 'Bram' },
    occupation: { ru: 'сборщи{к|ца} пошлины', en: 'toll collector', c: 'law', stat: 'commoner' },
    want: { ru: 'Закрыть недостачу', en: 'Cover the shortfall' },
    secret: { ru: 'Устроил{|а} недостачу сам{|а}', en: 'Caused the shortfall' },
    plan: { ru: 'Сожжёт книги', en: 'Burns the ledgers' },
  };

  it('stops at the level of the NPC', () => {
    const text = toText({ ...npc, level: 'passerby' }, 'ru');
    expect(text).toContain('Брам');
    expect(text).toContain('человек, мужчина, 50 лет · сборщик пошлины');
    expect(text).toContain('Хочет сейчас: Закрыть недостачу');
    expect(text).not.toContain('Устроил');
  });

  it('adds the deeper sections for a key NPC', () => {
    const text = toText({ ...npc, level: 'key' }, 'en');
    expect(text).toContain('Secret: Caused the shortfall');
    expect(text).toContain('If left alone: Burns the ledgers');
  });

  it('includes the AI quote in its own language only', () => {
    const withQuote = { ...npc, level: 'passerby', ai: { quote: { text: 'Плати', lang: 'ru' } } };
    expect(toText(withQuote, 'ru')).toContain('«Плати»');
    expect(toText(withQuote, 'en')).not.toContain('Плати');
  });
});
