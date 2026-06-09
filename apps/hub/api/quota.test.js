// quota.test.js — free-tier quota + BYOK behavior of the proxy core, with the
// upstream Anthropic call mocked. Each test uses a distinct ip so the
// module-level rate limiter never interferes.
import { handleGenerate } from './_core.js';
import { readUsedFromCookie, quotaCookie, FREE_LIMIT } from './_quota.js';

const FIELDS_TEXT = JSON.stringify({
  backstory: 'b',
  personality: 'p',
  goals: 'g',
  flaws: 'f',
  secret_desire: 's',
});

const okUpstream = () => ({
  ok: true,
  status: 200,
  text: async () => JSON.stringify({ content: [{ text: FIELDS_TEXT }] }),
});

describe('free quota + BYOK', () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-server-key';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('spends a free generation and reports the remainder', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => okUpstream()));
    const r = await handleGenerate({
      body: { mode: 'full', name: 'Kael', lang: 'en' },
      ip: 'quota-1',
      freeUsed: 0,
    });
    expect(r.status).toBe(200);
    expect(r.consumedFree).toBe(true);
    expect(r.json.remaining).toBe(FREE_LIMIT - 1);
    expect(r.json.fields.backstory).toBe('b');
  });

  it('returns 402 without calling upstream once the quota is spent', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const r = await handleGenerate({
      body: { mode: 'full', name: 'x', lang: 'en' },
      ip: 'quota-2',
      freeUsed: FREE_LIMIT,
    });
    expect(r.status).toBe(402);
    expect(r.json.code).toBe('free_quota_exhausted');
    expect(r.consumedFree).toBeFalsy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('a user key bypasses the quota and is the key sent upstream', async () => {
    const userKey = 'sk-ant-user-0123456789';
    const fetchMock = vi.fn(async (url, opts) => {
      expect(opts.headers['x-api-key']).toBe(userKey);
      return okUpstream();
    });
    vi.stubGlobal('fetch', fetchMock);
    const r = await handleGenerate({
      body: { mode: 'full', name: 'x', lang: 'en' },
      ip: 'quota-3',
      userKey,
      freeUsed: FREE_LIMIT, // exhausted — must not matter with BYOK
    });
    expect(r.status).toBe(200);
    expect(r.consumedFree).toBeFalsy();
    expect(r.json.remaining).toBeUndefined();
  });

  it('rejects malformed user keys before any upstream call', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const r = await handleGenerate({
      body: { mode: 'full', name: 'x', lang: 'en' },
      ip: 'quota-4',
      userKey: 'not-a-real-key',
    });
    expect(r.status).toBe(401);
    expect(r.json.code).toBe('invalid_user_key');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps an upstream 401 on a user key to invalid_user_key', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 401, text: async () => '{}' }))
    );
    const r = await handleGenerate({
      body: { mode: 'full', name: 'x', lang: 'en' },
      ip: 'quota-5',
      userKey: 'sk-ant-user-0123456789',
    });
    expect(r.status).toBe(401);
    expect(r.json.code).toBe('invalid_user_key');
  });

  it('round-trips the signed cookie and treats tampering as a fresh quota', () => {
    const setCookie = quotaCookie(3);
    const cookiePair = setCookie.split(';')[0]; // "ddtb_quota=<value>"
    expect(readUsedFromCookie({ headers: { cookie: cookiePair } })).toBe(3);

    // forge the count without re-signing → signature mismatch → 0
    const [name, encoded] = cookiePair.split('=');
    const forged = '9' + decodeURIComponent(encoded).slice(1);
    expect(
      readUsedFromCookie({ headers: { cookie: `${name}=${encodeURIComponent(forged)}` } })
    ).toBe(0);
  });
});
