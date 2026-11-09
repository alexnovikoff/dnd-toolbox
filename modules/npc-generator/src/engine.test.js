import {
  DEFAULT_PARAMS,
  FIELD_KEYS,
  LEVEL_FIELDS,
  ageText,
  aiTargets,
  applyAi,
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
    const npc = generate({ ...P, occ: 'common' });
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
