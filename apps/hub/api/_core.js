// _core.js — runtime-agnostic core for the Anthropic proxy (Variant A).
// Shared by the Vercel function (generate.js) and the Vite dev middleware
// (_dev-middleware.js). The server key is read from process.env and never
// leaves the server. Alternatively the client may send its own key (BYOK,
// `x-user-api-key`); it is forwarded to Anthropic in-memory only — never
// logged, never stored.
import { FREE_LIMIT } from './_quota.js';

const MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const TIMEOUT_MS = 30000;

const LANG_NAMES = {
  ru: 'Russian',
  en: 'English',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  pl: 'Polish',
  ja: 'Japanese',
  zh: 'Chinese',
};
const GENDERED = new Set(['ru', 'de', 'fr', 'es', 'it', 'pt', 'pl']);
const LENGTH_SPEC = {
  short: 'exactly 1 sentence',
  normal: '2-3 sentences',
  long: '4-5 sentences',
};
// Compressed spec for the 15-field worksheet tab (forge_tables): the default
// spec at 'long' (4-5 sentences x 15 fields) would overrun TIMEOUT_MS.
const TABLES_LENGTH_SPEC = {
  short: 'a short phrase (3-8 words)',
  normal: 'exactly 1 sentence',
  long: '2-3 sentences',
};
export const SECTIONS = ['backstory', 'personality', 'goals', 'flaws', 'secret_desire'];

const langName = (code) => LANG_NAMES[code] || 'English';
const sanitize = (s) =>
  String(s || '')
    .replace(/[\\"`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
function genderNote(lang, gender) {
  const g = sanitize(gender) || 'unspecified';
  return GENDERED.has(lang)
    ? `\n- Gender: ${g} (IMPORTANT: use correct grammatical gender throughout all text in ${langName(lang)})`
    : `\n- Gender: ${g}`;
}

export function buildFull(p) {
  const len = LENGTH_SPEC[p.length] || LENGTH_SPEC.normal;
  return {
    max_tokens: 1000,
    content: `You are a creative D&D character designer. Generate a rich, original character profile. Respond entirely in ${langName(p.lang)}.

Character seed:
- Name: ${sanitize(p.name) || 'unknown'}
- Race: ${sanitize(p.race) || 'unknown'}
- Class: ${sanitize(p.cls) || 'unknown'}
- Vibe/Concept: ${sanitize(p.vibe) || 'none'}${genderNote(p.lang, p.gender)}

Each field must be ${len} long.
Respond ONLY with a valid JSON object (no markdown, no backticks):
{"backstory":"...","personality":"...","goals":"...","flaws":"...","secret_desire":"..."}

Be vivid, specific, avoid clichés.`,
  };
}

export function buildSection(p) {
  // Tables fields are generated with the compressed spec, so a regenerated
  // field must match its siblings' length, not the default spec.
  const lengthSpec = TABLES_KEY_SET.has(p.section) ? TABLES_LENGTH_SPEC : LENGTH_SPEC;
  const len = lengthSpec[p.length] || lengthSpec.normal;
  const sec = p.section;
  const safeCharacter = JSON.stringify(p.character || {}).slice(0, 4000);
  // Lens-tab fields are keyed cryptically (e.g. "flees"), so prompt by the
  // field's question; classic sections are self-describing from the key alone.
  const question = QUESTION_FIELDS[sec];
  const ask = question
    ? `Regenerate only the "${sec}" field — the answer to this question about the character: "${question}".`
    : `Regenerate only the "${sec}" field for this D&D character.`;
  return {
    max_tokens: 400,
    content: `${ask} Respond in ${langName(p.lang)}.${genderNote(p.lang, p.gender)}
The field must be ${len} long.
Character: ${safeCharacter}
Respond ONLY with JSON: {"${sec}":"new content"}`,
  };
}

// Alternative "lens" generators (Character Forge tabs). Each maps stable field
// keys → the English question the model answers (it still replies in p.lang).
// The localized labels shown in the UI live client-side (forge-tabs.js).
const DRIVES_FIELDS = {
  flees: 'What is the character running toward, or running away from — or both?',
  lie: 'What lie does the character believe?',
  loss: 'What will be lost if nothing changes?',
};
const SHADOW_FIELDS = {
  line: 'A line the character has sworn never to cross.',
  unspoken_desire: 'A desire the character will not admit aloud.',
  regret: 'A mistake the character would undo if they could.',
  false_strength: 'A weakness disguised as strength.',
  feared_self: 'The version of themselves the character is afraid of becoming.',
  realization: 'The moment the character realized they were wrong.',
};
// «Персонаж в трёх таблицах» worksheet: 15 named qualities in 3 tables.
// Grouping (quality/presentation/layers) is client-side only (forge-tabs.js).
const TABLES_FIELDS = {
  alias:
    "The character's name and how they are addressed. Keep the given name from the seed exactly (invent a fitting one only if it is unknown) and add a nickname or the way others address them.",
  focus:
    "The character's main theme (e.g. fire mage, berserker, psionic, King Midas, Iron Man, a spirit).",
  shtick:
    'The thing the character will do in any situation (e.g. liar, painter, touch-me-not, boor, knight).',
  motivation:
    "What drives the character — usually an idea, not an action: not 'catching bandits' but 'justice'.",
  conscious_desire:
    'A short- or long-term goal — an action, phenomenon or event the character wants to achieve (catching bandits, revenge, repaying a debt).',
  unconscious_desire:
    'What the character NEEDS instead of what they want; it may contradict their conscious desire and even their motivation.',
  weakness:
    'The flaw that will ruin everything — ground for conflicts and chemistry within the party; it should drive the plot without spoiling the game for anyone.',
  eye_catcher:
    'The trait the character will be remembered by and described to others (e.g. a minotaur, one-eyed, a bone hand, a face tattoo).',
  appearance:
    'Exactly three appearance details noticed after the first impression (e.g. a broken horn, a nose ring, a battle-axe).',
  worldview:
    'The prism through which the character sees the world: what they notice first and what everything comes down to in their picture of the world.',
  behavior:
    "The character's first action when they appear on a scene — ideally one that involves the other player characters.",
  in_public:
    'How the character is perceived in society: the rumors about them, what they are known for.',
  with_friends:
    'How the character behaves among those truly close to them (not the whole party counts as close).',
  alone: 'How the character behaves alone with themselves and their thoughts.',
  in_secret:
    'The deepest layer of the personality — it may be a secret even from the character themselves; it surfaces in the most desperate, tense or joyful moments, and it underlies how they never outwardly behave.',
};
export const DRIVES_KEYS = Object.keys(DRIVES_FIELDS);
export const SHADOW_KEYS = Object.keys(SHADOW_FIELDS);
export const TABLES_KEYS = Object.keys(TABLES_FIELDS);
const TABLES_KEY_SET = new Set(TABLES_KEYS);

// All valid single-field regenerate targets: classic sections + lens field
// keys. buildSection looks up the lens question text from QUESTION_FIELDS.
const QUESTION_FIELDS = { ...DRIVES_FIELDS, ...SHADOW_FIELDS, ...TABLES_FIELDS };
export const REGEN_KEYS = new Set([...SECTIONS, ...Object.keys(QUESTION_FIELDS)]);

// Shared builder for the lens tabs: same seed/gender/length/language handling
// as buildFull, but the output is the answers to a fixed set of questions.
function buildQuestions(p, fields, maxTokens, lengthSpec = LENGTH_SPEC) {
  const len = lengthSpec[p.length] || lengthSpec.normal;
  const keys = Object.keys(fields);
  const questions = keys.map((k) => `- "${k}": ${fields[k]}`).join('\n');
  const shape = `{${keys.map((k) => `"${k}":"..."`).join(',')}}`;
  return {
    max_tokens: maxTokens,
    content: `You are a creative D&D character designer. For the character below, answer each question with a vivid, specific, original insight. Respond entirely in ${langName(p.lang)}.

Character seed:
- Name: ${sanitize(p.name) || 'unknown'}
- Race: ${sanitize(p.race) || 'unknown'}
- Class: ${sanitize(p.cls) || 'unknown'}
- Vibe/Concept: ${sanitize(p.vibe) || 'none'}${genderNote(p.lang, p.gender)}

Answer each of these about the character. Each answer must be ${len} long:
${questions}

Respond ONLY with a valid JSON object (no markdown, no backticks), using exactly these keys:
${shape}

Be vivid, specific, avoid clichés.`,
  };
}

export const buildDrives = (p) => buildQuestions(p, DRIVES_FIELDS, 600);
export const buildShadow = (p) => buildQuestions(p, SHADOW_FIELDS, 1200);
export const buildTables = (p) => buildQuestions(p, TABLES_FIELDS, 2000, TABLES_LENGTH_SPEC);

// Multi-line tavern facts from the client: strip injection-prone characters
// per line but keep the line structure the prompt template expects.
function sanitizeFacts(s) {
  return String(s || '')
    .replace(/[\\"`]/g, ' ')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 12)
    .join('\n')
    .slice(0, 1500);
}

// «Оживить описание» (Tavern Builder) — 2–3 sentences of read-aloud text.
// Prompt text is verbatim from the design handoff
// (reference_sources/design_handoff_tavern_builder/design-reference/tavern-module.jsx, enliven()).
export function buildTavernEnliven(p) {
  const facts = sanitizeFacts(p.facts);
  return {
    max_tokens: 300,
    content:
      p.lang === 'ru'
        ? `Ты помогаешь мастеру D&D. Факты о таверне:\n${facts}\n\nНапиши 2–3 предложения атмосферного описания этой таверны для зачитывания игрокам вслух, когда они впервые входят. Художественно, но без пафоса. Не используй заголовки, списки, кавычки и название таверны дословно. Ответь только текстом описания на русском.`
        : `You are helping a D&D game master. Tavern facts:\n${facts}\n\nWrite 2–3 sentences of atmospheric read-aloud description for when the players first walk in. Evocative but not purple. No headings, lists, quotes, and do not repeat the tavern name verbatim. Reply with the description text only, in English.`,
  };
}

// «Углубить с ИИ» (NPC Generator): the client sends the table draft, one line
// per field; which fields get written and how stays here. Labels and questions
// are in English; the model still replies in p.lang.
const NPC_DRAFT_LABELS = {
  name: 'Name',
  who: 'Race, gender, age',
  occupation: 'Occupation',
  feature: 'Visual detail',
  manner: 'Mannerism',
  mood: 'Attitude toward the party',
  want: 'Wants right now',
  knows: 'Knows',
  secret: 'Secret',
  lever: 'Weak spot',
  background: 'Background',
  hook: 'Hook for the party',
  plan: 'If left alone',
  offer: 'Can offer',
  talk: 'In conversation',
  ties: 'Allies and enemies',
  combat: 'In a fight',
};
const NPC_QUESTIONS = {
  quote:
    'One line the NPC actually says when the party first speaks to them, in their own voice. Just the words: no quotation marks, no stage directions.',
  feature: 'The one visual detail the party notices first.',
  manner: 'One physical habit or way of talking the GM can act out at the table.',
  want: 'What the NPC wants right now, in this scene: something the party can help with or get in the way of.',
  knows:
    'Two or three concrete things the NPC knows that the party may need. A JSON array of short strings.',
  secret: 'What the NPC hides. It must explain or complicate what they want right now.',
  lever: 'The attachment or weakness that can be used to sway them.',
  background: 'Only the part of their past that matters in play.',
  hook: 'A concrete reason for the party to get involved with this NPC.',
  plan: 'What the NPC will do on their own if the party does not step in, with a rough timeframe.',
  offer: 'What the NPC can give the party: an item, access, information or a contact.',
  talk: 'What works on them in conversation and what backfires.',
  ties: 'One ally and one enemy of the NPC, each tied to what they want or hide.',
};
const NPC_SCENE = ['quote', 'feature', 'manner', 'want'];
const NPC_DEPTH = ['knows', 'secret', 'lever', 'background', 'hook'];
const NPC_PLOT = ['plan', 'offer', 'talk', 'ties'];
const NPC_LEVELS = {
  passerby: NPC_SCENE,
  recurring: [...NPC_SCENE, ...NPC_DEPTH],
  key: [...NPC_SCENE, ...NPC_DEPTH, ...NPC_PLOT],
};
const NPC_LINE_MAX = 400;
const NPC_HINT_MAX = 200;

const npcLine = (value) =>
  typeof value === 'string' ? sanitize(value).slice(0, NPC_LINE_MAX) : '';

export const isValidNpcDeepen = (body) => Boolean(npcLine(body?.facts?.name));

export function buildNpcDeepen(p) {
  const facts = p.facts || {};
  const draft = Object.keys(NPC_DRAFT_LABELS)
    .filter((key) => npcLine(facts[key]))
    .map((key) => `- ${NPC_DRAFT_LABELS[key]}: ${npcLine(facts[key])}`)
    .join('\n');
  const hint = sanitize(p.hint).slice(0, NPC_HINT_MAX);
  const note = hint ? `\nThe GM’s note about this NPC: ${hint}\n` : '';
  // The quote is new text, not a draft field, so it can never be locked.
  const kept = new Set(Array.isArray(p.keep) ? p.keep : []);
  const fields = (NPC_LEVELS[p.level] || NPC_LEVELS.passerby).filter(
    (key) => key === 'quote' || !kept.has(key)
  );
  const questions = fields.map((key) => `- "${key}": ${NPC_QUESTIONS[key]}`).join('\n');
  const shape = `{${fields
    .map((key) => (key === 'knows' ? '"knows":["...","..."]' : `"${key}":"..."`))
    .join(',')}}`;
  return {
    max_tokens: 300 + fields.length * 100,
    content: `You are helping a D&D game master prepare an NPC for play. The draft below was rolled on random tables, so its parts have nothing to do with each other. Turn it into one believable person whose details explain each other. Respond entirely in ${langName(p.lang)}.

NPC draft:
${draft}${genderNote(p.lang, p.gender)}
${note}
Every draft line that is not listed below stays true: do not contradict the name, race, age, occupation, attitude or anything else you are not asked to rewrite.

Write only these fields. Each answer must be one short sentence the GM can take in at a glance during play (5-18 words), unless its description says otherwise:
${questions}

Make the parts connect: what they want should follow from who they are, the secret should complicate what they want, and the hook should give the party a concrete reason to step in. Invent no world-shaking events and keep place names generic.

Respond ONLY with a valid JSON object (no markdown, no backticks), using exactly these keys:
${shape}

Be vivid, specific, avoid clichés.`,
  };
}

// «Оживить с ИИ» (Loot Generator): the client sends the table draft, one line
// per section; which fields get written and how stays here. Coins, gems and
// items stay exactly what the tables rolled: the model only writes the story.
const LOOT_DRAFT_LABELS = {
  title: 'Name',
  summary: 'What and how big',
  coins: 'Coins',
  gems: 'Gems',
  art: 'Art objects',
  goods: 'Trade goods',
  origin: 'Who it comes from',
  place: 'Where it lies',
  guard: 'What stands in the way',
  hook: 'Hook for the party',
  form: 'How it is paid',
  perk: 'What comes on top of the money',
  catch: 'The catch',
};
const LOOT_QUESTIONS = {
  read: 'Two or three sentences of read-aloud description for the moment the party first sees this. Show what they see, hear and smell; name no game terms and no prices.',
  origin: 'Who this came from and why it ended up here.',
  place: 'Exactly where it is, as a concrete spot the party can find.',
  guard: 'The one thing standing between the party and this, tied to how it got here.',
  hook: 'A concrete reason this find pulls the party into something further.',
  form: 'How the money actually changes hands.',
  perk: 'What the party is offered beyond the money, in keeping with who is paying.',
  catch: 'The complication that comes with accepting this.',
  marks:
    'For each magic item listed, in the same order: one short detail of how it came to be here or what marks it out. A JSON array of strings, one per item.',
};
const LOOT_STORY = {
  hoard: ['origin', 'place', 'guard', 'hook'],
  dragon: ['origin', 'place', 'guard', 'hook'],
  reward: ['origin', 'form', 'perk', 'catch'],
};
const LOOT_LINE_MAX = 400;
const LOOT_ITEMS_MAX = 14;
const LOOT_HINT_MAX = 200;

const lootLine = (value) =>
  typeof value === 'string' ? sanitize(value).slice(0, LOOT_LINE_MAX) : '';

export const isValidLootEnliven = (body) =>
  Boolean(LOOT_STORY[body?.kind]) && Boolean(lootLine(body?.facts?.title));

export function buildLootEnliven(p) {
  const facts = p.facts || {};
  const draft = Object.keys(LOOT_DRAFT_LABELS)
    .filter((key) => lootLine(facts[key]))
    .map((key) => `- ${LOOT_DRAFT_LABELS[key]}: ${lootLine(facts[key])}`)
    .join('\n');
  const items = (Array.isArray(facts.items) ? facts.items : [])
    .map(lootLine)
    .filter(Boolean)
    .slice(0, LOOT_ITEMS_MAX);
  const itemList = items.length
    ? `\n\nMagic items, in order:\n${items.map((line, i) => `${i + 1}. ${line}`).join('\n')}`
    : '';
  const hint = sanitize(p.hint).slice(0, LOOT_HINT_MAX);
  const note = hint ? `\nThe GM’s note about this find: ${hint}\n` : '';
  const kept = new Set(Array.isArray(p.keep) ? p.keep : []);
  const fields = [
    'read',
    ...LOOT_STORY[p.kind].filter((key) => !kept.has(key)),
    ...(items.length ? ['marks'] : []),
  ];
  const questions = fields.map((key) => `- "${key}": ${LOOT_QUESTIONS[key]}`).join('\n');
  const shape = `{${fields
    .map((key) =>
      key === 'marks' ? `"marks":[${items.map(() => '"..."').join(',')}]` : `"${key}":"..."`
    )
    .join(',')}}`;
  return {
    max_tokens: 400 + fields.length * 90 + items.length * 50,
    content: `You are helping a D&D game master present a find to the players. The draft below was rolled on random tables, so its parts have nothing to do with each other. Turn it into one believable find whose details explain each other. Respond entirely in ${langName(p.lang)}.

Find draft:
${draft}${itemList}
${note}
Everything in the draft stays true. Do not add, remove, rename or reprice coins, gems, art, goods or magic items, and do not change what an item does.

Write only these fields. Each answer must be one short sentence the GM can take in at a glance during play (5-18 words), unless its description says otherwise:
${questions}

Make the parts connect: what is here should follow from who gathered it, and the complication should come from the same story. Invent no world-shaking events and keep place names generic.

Respond ONLY with a valid JSON object (no markdown, no backticks), using exactly these keys:
${shape}

Be vivid, specific, avoid clichés.`,
  };
}

// Pull the first {...} block out of a model reply and parse it.
// Returns { fields } on success or { error } with the user-facing message.
export function extractFields(raw) {
  const match = String(raw || '').match(/\{[\s\S]*\}/);
  if (!match) return { error: 'Model did not return valid character data.' };
  try {
    return { fields: JSON.parse(match[0]) };
  } catch {
    return { error: 'Could not parse character data.' };
  }
}

// ---- best-effort in-memory rate limit (per IP). ----
// Note: serverless instances are short-lived, so this is a soft guard, not a
// hard quota. For strict limits use a shared store (KV/Redis).
const WINDOW_MS = 60_000;
const MAX_REQ = 20;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQ;
}

// Anthropic API keys look like `sk-ant-...`; reject anything else up front so
// arbitrary header values never reach the upstream call.
const USER_KEY_RE = /^sk-ant-[A-Za-z0-9_-]{8,250}$/;

// BYOK key from the request header (empty string when absent/malformed type).
export function readUserKey(req) {
  const raw = req?.headers?.['x-user-api-key'];
  return typeof raw === 'string' ? raw.trim() : '';
}

// Core handler. Returns { status, json, consumedFree }. Never throws.
// `userKey` (BYOK) bypasses the free quota; otherwise `freeUsed` is checked
// against FREE_LIMIT and `consumedFree` tells the caller to bump the cookie.
export async function handleGenerate({
  body = {},
  ip = 'unknown',
  userKey = '',
  freeUsed = 0,
} = {}) {
  if (rateLimited(ip)) {
    return {
      status: 429,
      json: { error: 'Too many requests. Please wait a moment and try again.' },
    };
  }

  let apiKey;
  const usingUserKey = Boolean(userKey);
  if (usingUserKey) {
    if (!USER_KEY_RE.test(userKey)) {
      return { status: 401, json: { error: 'Invalid API key.', code: 'invalid_user_key' } };
    }
    apiKey = userKey;
  } else {
    if (FREE_LIMIT > 0 && freeUsed >= FREE_LIMIT) {
      return {
        status: 402,
        json: {
          error: 'Free generations used up. Add your own Anthropic API key to continue.',
          code: 'free_quota_exhausted',
          remaining: 0,
        },
      };
    }
    apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        status: 500,
        json: {
          error:
            'ANTHROPIC_API_KEY is not set on the server. Add it to the environment (see apps/hub/.env.example) and restart.',
        },
      };
    }
  }

  const mode = [
    'section',
    'tavern_enliven',
    'forge_drives',
    'forge_shadow',
    'forge_tables',
    'npc_deepen',
    'loot_enliven',
  ].includes(body.mode)
    ? body.mode
    : 'full';
  if (mode === 'section' && !REGEN_KEYS.has(body.section)) {
    return { status: 400, json: { error: 'Invalid section.' } };
  }
  if (mode === 'tavern_enliven' && !String(body.facts || '').trim()) {
    return { status: 400, json: { error: 'Invalid request.' } };
  }
  if (mode === 'npc_deepen' && !isValidNpcDeepen(body)) {
    return { status: 400, json: { error: 'Invalid request.' } };
  }
  if (mode === 'loot_enliven' && !isValidLootEnliven(body)) {
    return { status: 400, json: { error: 'Invalid request.' } };
  }

  const spec =
    mode === 'section'
      ? buildSection(body)
      : mode === 'tavern_enliven'
        ? buildTavernEnliven(body)
        : mode === 'forge_drives'
          ? buildDrives(body)
          : mode === 'forge_shadow'
            ? buildShadow(body)
            : mode === 'forge_tables'
              ? buildTables(body)
              : mode === 'npc_deepen'
                ? buildNpcDeepen(body)
                : mode === 'loot_enliven'
                  ? buildLootEnliven(body)
                  : buildFull(body);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let upstream, text;
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: spec.max_tokens,
        messages: [{ role: 'user', content: spec.content }],
      }),
      signal: controller.signal,
    });
    text = await upstream.text();
  } catch (e) {
    clearTimeout(timer);
    const aborted = e?.name === 'AbortError';
    return {
      status: aborted ? 504 : 502,
      json: {
        error: aborted
          ? 'The request timed out. Please try again.'
          : `Failed to reach the model API: ${String(e)}`,
      },
    };
  }
  clearTimeout(timer);

  if (!upstream.ok) {
    if (usingUserKey && upstream.status === 401) {
      return { status: 401, json: { error: 'Invalid API key.', code: 'invalid_user_key' } };
    }
    return { status: upstream.status, json: { error: `Model API error (${upstream.status}).` } };
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { status: 502, json: { error: 'Malformed response from model API.' } };
  }
  const raw = (data.content || []).map((i) => i.text || '').join('');
  let json;
  if (mode === 'tavern_enliven') {
    // plain prose, not JSON — the whole reply is the description
    const text = raw.trim();
    if (!text) {
      return { status: 502, json: { error: 'Model returned an empty description.' } };
    }
    json = { text };
  } else {
    const extracted = extractFields(raw);
    if (extracted.error) {
      return { status: 502, json: { error: extracted.error } };
    }
    json = { fields: extracted.fields };
  }
  let consumedFree = false;
  if (!usingUserKey && FREE_LIMIT > 0) {
    // Only successful generations spend quota; errors and timeouts are free.
    consumedFree = true;
    json.remaining = Math.max(0, FREE_LIMIT - freeUsed - 1);
  }
  return { status: 200, json, consumedFree };
}

export function getClientIp(req) {
  const xf = req.headers?.['x-forwarded-for'];
  if (xf) return String(xf).split(',')[0].trim();
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body; // pre-parsed (Vercel)
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
