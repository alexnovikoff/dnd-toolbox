// _local-claude.js — dev-only backend for /api/generate: runs the prompt
// through the locally installed Claude Code CLI (`claude -p`) on the
// developer's own subscription. Personal use only. Imported exclusively by
// _dev-middleware.js — never by generate.js — so it cannot reach production.
import { spawn } from 'node:child_process';
import { buildFull, buildSection, buildTavernEnliven, extractFields, SECTIONS } from './_core.js';

const TIMEOUT_MS = 90_000;

// The CLI must authenticate with the developer's `claude` login. Env API keys
// override that login, and nested Claude-Code session markers make the CLI
// expect host-managed auth — strip both so it behaves like a fresh terminal.
function cleanEnv() {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (/^(ANTHROPIC_|CLAUDE_CODE_)/.test(key)) continue;
    if (key === 'CLAUDECODE' || key === 'CLAUDE_AGENT_SDK_VERSION') continue;
    env[key] = value;
  }
  return env;
}

// Spawn without a shell (array args — no escaping issues), collect
// stdout/stderr, kill after TIMEOUT_MS. Resolves { stdout, stderr, code };
// rejects with the spawn error (ENOENT when the binary is missing) or an
// error with code 'ETIMEDOUT' on timeout.
function defaultRunClaude(prompt) {
  const bin = process.env.LOCAL_CLAUDE_BIN || 'claude';
  const model = process.env.LOCAL_CLAUDE_MODEL || 'sonnet';
  return new Promise((resolve, reject) => {
    const child = spawn(bin, ['-p', prompt, '--output-format', 'json', '--model', model], {
      env: cleanEnv(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      reject(Object.assign(new Error('claude CLI timed out'), { code: 'ETIMEDOUT' }));
    }, TIMEOUT_MS);
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ stdout, stderr, code });
    });
  });
}

// Local-mode handler: same validation and response shapes as handleGenerate,
// but no quota/BYOK and no `remaining` field (it's the owner's machine).
export async function handleGenerateLocal({ body = {}, runClaude = defaultRunClaude } = {}) {
  const mode = ['section', 'tavern_enliven'].includes(body.mode) ? body.mode : 'full';
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
        : buildFull(body);

  let run;
  try {
    run = await runClaude(spec.content);
  } catch (e) {
    if (e?.code === 'ENOENT') {
      return {
        status: 500,
        json: { error: 'claude CLI not found — install Claude Code or unset LOCAL_CLAUDE.' },
      };
    }
    if (e?.code === 'ETIMEDOUT') {
      return { status: 504, json: { error: 'The request timed out. Please try again.' } };
    }
    return { status: 502, json: { error: `Failed to run the claude CLI: ${String(e)}` } };
  }

  // `--output-format json` prints one JSON envelope: completion text in
  // `result`, failures flagged by `is_error` (verified against CLI 2.1.147;
  // `subtype` stays "success" even on errors, so don't check it).
  let envelope = null;
  try {
    envelope = JSON.parse(run.stdout);
  } catch {
    envelope = null;
  }
  if (!envelope) {
    if (run.code !== 0) {
      const detail = String(run.stderr || '')
        .trim()
        .slice(0, 200);
      return {
        status: 502,
        json: { error: `claude CLI error: ${detail || `exit code ${run.code}`}` },
      };
    }
    return { status: 502, json: { error: 'Malformed response from model API.' } };
  }
  if (envelope.is_error || run.code !== 0) {
    const detail = String(envelope.result || run.stderr || `exit code ${run.code}`).slice(0, 200);
    return { status: 502, json: { error: `claude CLI error: ${detail}` } };
  }

  if (mode === 'tavern_enliven') {
    // plain prose, not JSON — the whole reply is the description
    const text = String(envelope.result || '').trim();
    if (!text) {
      return { status: 502, json: { error: 'Model returned an empty description.' } };
    }
    return { status: 200, json: { text } };
  }
  const extracted = extractFields(envelope.result);
  if (extracted.error) {
    return { status: 502, json: { error: extracted.error } };
  }
  return { status: 200, json: { fields: extracted.fields } };
}
