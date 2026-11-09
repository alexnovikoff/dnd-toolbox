// api.js — thin client for the server-side Anthropic proxy (Variant A).
// Mirrors modules/tavern-builder/src/api.js: the browser only ever talks to
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

export const hasUserKey = () => Boolean(getUserKey());

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

// Ties a table-rolled draft into one person.
// params: { facts, level, keep, hint, gender, lang }
export function deepenNpc(params) {
  return post({ mode: 'npc_deepen', ...params });
}
