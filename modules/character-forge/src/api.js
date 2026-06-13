// api.js — thin client for the server-side Anthropic proxy (Variant A).
// The browser only ever talks to /api/generate. By default the server key is
// used (a limited number of free generations, tracked by the server in a
// signed cookie); the user may store their own Anthropic key here (BYOK) —
// it lives only in this browser's localStorage and is sent as a header.

const KEY_STORAGE = 'ddtb_user_key';

export function getUserKey() {
  try {
    return localStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setUserKey(key) {
  try {
    const k = String(key || '').trim();
    if (k) localStorage.setItem(KEY_STORAGE, k);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* storage unavailable */
  }
}

async function post(payload) {
  const headers = { 'Content-Type': 'application/json' };
  const userKey = getUserKey();
  if (userKey) headers['x-user-api-key'] = userKey;
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || !data || data.error) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.code = data?.code; // 'free_quota_exhausted' | 'invalid_user_key' | undefined
    err.status = res.status;
    throw err;
  }
  // { fields: {…}, remaining?: number } — remaining is present on free-tier calls
  return data;
}

// Generate a full character. params: { name, race, cls, vibe, gender, length, lang }
export function generateCharacter(params) {
  return post({ mode: 'full', ...params });
}

// Regenerate one section. params: { section, character, gender, length, lang }
export function regenerateSection(params) {
  return post({ mode: 'section', ...params });
}

// Generate an alternative "lens" tab (drives / shadow). The mode comes from
// TAB_MODE in forge-tabs.js. params: { name, race, cls, vibe, gender, length, lang }
export function generateForge(mode, params) {
  return post({ mode, ...params });
}
