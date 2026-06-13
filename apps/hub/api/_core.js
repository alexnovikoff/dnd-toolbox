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
  const len = LENGTH_SPEC[p.length] || LENGTH_SPEC.normal;
  const sec = p.section;
  const safeCharacter = JSON.stringify(p.character || {}).slice(0, 4000);
  return {
    max_tokens: 400,
    content: `Regenerate only the "${sec}" field for this D&D character. Respond in ${langName(p.lang)}.${genderNote(p.lang, p.gender)}
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
export const DRIVES_KEYS = Object.keys(DRIVES_FIELDS);
export const SHADOW_KEYS = Object.keys(SHADOW_FIELDS);

// Shared builder for the lens tabs: same seed/gender/length/language handling
// as buildFull, but the output is the answers to a fixed set of questions.
function buildQuestions(p, fields, maxTokens) {
  const len = LENGTH_SPEC[p.length] || LENGTH_SPEC.normal;
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

  const mode = ['section', 'tavern_enliven', 'forge_drives', 'forge_shadow'].includes(body.mode)
    ? body.mode
    : 'full';
  if (mode === 'section' && !SECTIONS.includes(body.section)) {
    return { status: 400, json: { error: 'Invalid section.' } };
  }
  if (mode === 'tavern_enliven' && !String(body.facts || '').trim()) {
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
