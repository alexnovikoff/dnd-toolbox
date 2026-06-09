// api.js — thin client for the server-side Anthropic proxy (Variant A).
// The browser only ever talks to /api/generate; the API key lives on the server
// (apps/hub/api/generate.js) and never reaches the bundle.

async function post(payload) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || !data || data.error) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data.fields; // { backstory, personality, goals, flaws, secret_desire }
}

// Generate a full character. params: { name, race, cls, vibe, gender, length, lang }
export function generateCharacter(params) {
  return post({ mode: 'full', ...params });
}

// Regenerate one section. params: { section, character, gender, length, lang }
export function regenerateSection(params) {
  return post({ mode: 'section', ...params });
}
