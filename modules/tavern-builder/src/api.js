// api.js — thin client for the server-side Anthropic proxy (Variant A).
// Mirrors modules/character-forge/src/api.js: the browser only ever talks to
// /api/generate. The user's own Anthropic key (BYOK) — stored by Character
// Forge under the shared localStorage key — rides along as a header when
// present; it never appears in the payload.

const KEY_STORAGE = 'ddtb_user_key';

function getUserKey() {
  try {
    return localStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
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
  // { text: '…', remaining?: number } — remaining is present on free-tier calls
  return data;
}

// 2–3 sentences of atmospheric read-aloud text. params: { facts, lang }
export function enlivenTavern(params) {
  return post({ mode: 'tavern_enliven', ...params });
}
