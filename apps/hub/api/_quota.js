// _quota.js — free-generation quota tracked in a signed, HttpOnly cookie.
// No external store: the count lives in the user's browser, the HMAC signature
// makes it tamper-proof. Clearing cookies resets the quota — acceptable for a
// soft free tier; swap for a KV/Redis counter if hard enforcement is ever needed.
import crypto from 'node:crypto';

const COOKIE = 'ddtb_quota';
const YEAR = 60 * 60 * 24 * 365;

// Free generations served on the server key before a user key is required.
// Override with FREE_GENERATIONS; 0 disables the free tier (key always required).
export const FREE_LIMIT = (() => {
  const n = parseInt(process.env.FREE_GENERATIONS ?? '10', 10);
  return Number.isFinite(n) && n >= 0 ? n : 10;
})();

// HMAC secret: QUOTA_SECRET if set, else derived from the API key so no extra
// env var is required (an HMAC never reveals its key material).
function secret() {
  const src = process.env.QUOTA_SECRET || process.env.ANTHROPIC_API_KEY || 'ddtb-dev-secret';
  return crypto.createHash('sha256').update(`ddtb-quota:${src}`).digest();
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

// Used count from the request cookie. Missing or tampered → 0 (fresh quota;
// forging a reset is equivalent to clearing cookies, so nothing is gained).
export function readUsedFromCookie(req) {
  const header = req?.headers?.cookie || '';
  const match = header.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return 0;
  const [value, sig] = decodeURIComponent(match[1]).split('.');
  if (!value || !sig || sign(value) !== sig) return 0;
  const used = parseInt(value, 10);
  return Number.isFinite(used) && used >= 0 ? used : 0;
}

// Set-Cookie header value persisting the new used count.
export function quotaCookie(used) {
  const value = String(used);
  const attrs = ['Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${YEAR}`];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return `${COOKIE}=${encodeURIComponent(`${value}.${sign(value)}`)}; ${attrs.join('; ')}`;
}
