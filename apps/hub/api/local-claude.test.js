// local-claude.test.js — handleGenerateLocal with a stubbed CLI runner.
// CI has no `claude` binary, so the runner is always injected here.
import { handleGenerateLocal } from './_local-claude.js';

const FIELDS = { backstory: 'b', personality: 'p', goals: 'g', flaws: 'f', secret_desire: 's' };

// Shape verified empirically against claude CLI 2.1.147 (--output-format json).
const envelope = (overrides = {}) =>
  JSON.stringify({
    type: 'result',
    subtype: 'success',
    is_error: false,
    result: JSON.stringify(FIELDS),
    ...overrides,
  });

describe('local Claude Code mode', () => {
  it('returns 200 with the five fields and no remaining counter', async () => {
    const r = await handleGenerateLocal({
      body: { mode: 'full', name: 'Kael', lang: 'en' },
      runClaude: async () => ({ stdout: envelope(), stderr: '', code: 0 }),
    });
    expect(r.status).toBe(200);
    expect(r.json.fields).toEqual(FIELDS);
    expect(r.json.remaining).toBeUndefined();
  });

  it('builds the prompt with the shared builders and passes it to the runner', async () => {
    let seen;
    await handleGenerateLocal({
      body: { mode: 'full', name: 'Kael', lang: 'en' },
      runClaude: async (prompt) => {
        seen = prompt;
        return { stdout: envelope(), stderr: '', code: 0 };
      },
    });
    expect(seen).toContain('Kael');
    expect(seen).toContain('Respond ONLY with a valid JSON object');
  });

  it('maps an is_error envelope to 502 with a result snippet', async () => {
    const r = await handleGenerateLocal({
      body: { mode: 'full', name: 'x', lang: 'en' },
      runClaude: async () => ({
        stdout: envelope({ is_error: true, result: 'Failed to authenticate.' }),
        stderr: '',
        code: 1,
      }),
    });
    expect(r.status).toBe(502);
    expect(r.json.error).toContain('Failed to authenticate');
  });

  it('maps a garbage (non-JSON) completion to 502', async () => {
    const r = await handleGenerateLocal({
      body: { mode: 'full', name: 'x', lang: 'en' },
      runClaude: async () => ({
        stdout: envelope({ result: 'sorry, I cannot do JSON today' }),
        stderr: '',
        code: 0,
      }),
    });
    expect(r.status).toBe(502);
    expect(r.json.error).toBe('Model did not return valid character data.');
  });

  it('maps unparseable CLI stdout to 502', async () => {
    const r = await handleGenerateLocal({
      body: { mode: 'full', name: 'x', lang: 'en' },
      runClaude: async () => ({ stdout: 'not json at all', stderr: '', code: 0 }),
    });
    expect(r.status).toBe(502);
    expect(r.json.error).toBe('Malformed response from model API.');
  });

  it('maps ENOENT to 500 with the install hint', async () => {
    const r = await handleGenerateLocal({
      body: { mode: 'full', name: 'x', lang: 'en' },
      runClaude: async () => {
        throw Object.assign(new Error('spawn claude ENOENT'), { code: 'ENOENT' });
      },
    });
    expect(r.status).toBe(500);
    expect(r.json.error).toContain('install Claude Code or unset LOCAL_CLAUDE');
  });

  it('maps a runner timeout to 504', async () => {
    const r = await handleGenerateLocal({
      body: { mode: 'full', name: 'x', lang: 'en' },
      runClaude: async () => {
        throw Object.assign(new Error('claude CLI timed out'), { code: 'ETIMEDOUT' });
      },
    });
    expect(r.status).toBe(504);
    expect(r.json.error).toBe('The request timed out. Please try again.');
  });

  it('rejects an invalid section with 400 before running the CLI', async () => {
    const runner = vi.fn();
    const r = await handleGenerateLocal({
      body: { mode: 'section', section: 'nope' },
      runClaude: runner,
    });
    expect(r.status).toBe(400);
    expect(r.json.error).toBe('Invalid section.');
    expect(runner).not.toHaveBeenCalled();
  });

  it('regenerates a single lens (drives) field, injecting its English question', async () => {
    let seen;
    const r = await handleGenerateLocal({
      body: { mode: 'section', section: 'flees', character: FIELDS, lang: 'en' },
      runClaude: async (prompt) => {
        seen = prompt;
        return {
          stdout: envelope({ result: JSON.stringify({ flees: 'Toward a horizon that keeps receding.' }) }),
          stderr: '',
          code: 0,
        };
      },
    });
    expect(r.status).toBe(200);
    expect(r.json.fields).toEqual({ flees: 'Toward a horizon that keeps receding.' });
    // the bare key 'flees' is meaningless to the model — the prompt must carry the question
    expect(seen).toContain('flees');
    expect(seen).toContain('running toward');
  });

  it('regenerates a single lens (shadow) field by key', async () => {
    let seen;
    const r = await handleGenerateLocal({
      body: { mode: 'section', section: 'line', character: FIELDS, lang: 'en' },
      runClaude: async (prompt) => {
        seen = prompt;
        return {
          stdout: envelope({ result: JSON.stringify({ line: 'Never raise a hand against the helpless.' }) }),
          stderr: '',
          code: 0,
        };
      },
    });
    expect(r.status).toBe(200);
    expect(r.json.fields).toEqual({ line: 'Never raise a hand against the helpless.' });
    expect(seen).toContain('sworn never to cross');
  });

  it('serves tavern_enliven as plain text wrapped in { text }', async () => {
    let seen;
    const r = await handleGenerateLocal({
      body: {
        mode: 'tavern_enliven',
        facts: 'Название: «Пьяный Кабан»\nТон: Уютная',
        lang: 'ru',
      },
      runClaude: async (prompt) => {
        seen = prompt;
        return {
          stdout: envelope({ result: ' Тёплый свет стелется по дубовым столам. ' }),
          stderr: '',
          code: 0,
        };
      },
    });
    expect(r.status).toBe(200);
    expect(r.json).toEqual({ text: 'Тёплый свет стелется по дубовым столам.' });
    // the server-built prompt carries the facts and the handoff template
    expect(seen).toContain('Ты помогаешь мастеру D&D');
    expect(seen).toContain('Пьяный Кабан');
    expect(seen).toContain('2–3 предложения');
  });

  it('rejects tavern_enliven without facts with 400 before running the CLI', async () => {
    const runner = vi.fn();
    const r = await handleGenerateLocal({
      body: { mode: 'tavern_enliven', lang: 'ru' },
      runClaude: runner,
    });
    expect(r.status).toBe(400);
    expect(r.json.error).toBe('Invalid request.');
    expect(runner).not.toHaveBeenCalled();
  });
});
