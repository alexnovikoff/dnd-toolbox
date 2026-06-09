// _core.js — runtime-agnostic core for the Anthropic proxy (Variant A).
// Shared by the Vercel function (generate.js) and the Vite dev middleware
// (dev-middleware.js). The API key is read from process.env only and never
// leaves the server.

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
const SECTIONS = ['backstory', 'personality', 'goals', 'flaws', 'secret_desire'];

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

function buildFull(p) {
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

function buildSection(p) {
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

// Core handler. Returns { status, json }. Never throws.
export async function handleGenerate({ body = {}, ip = 'unknown' } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      status: 500,
      json: {
        error:
          'ANTHROPIC_API_KEY is not set on the server. Add it to the environment (see apps/hub/.env.example) and restart.',
      },
    };
  }
  if (rateLimited(ip)) {
    return { status: 429, json: { error: 'Too many requests. Please wait a moment and try again.' } };
  }

  const mode = body.mode === 'section' ? 'section' : 'full';
  if (mode === 'section' && !SECTIONS.includes(body.section)) {
    return { status: 400, json: { error: 'Invalid section.' } };
  }

  const spec = mode === 'section' ? buildSection(body) : buildFull(body);

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
    return { status: upstream.status, json: { error: `Model API error (${upstream.status}).` } };
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { status: 502, json: { error: 'Malformed response from model API.' } };
  }
  const raw = (data.content || []).map((i) => i.text || '').join('');
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    return { status: 502, json: { error: 'Model did not return valid character data.' } };
  }
  let parsed;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return { status: 502, json: { error: 'Could not parse character data.' } };
  }
  return { status: 200, json: { fields: parsed } };
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
