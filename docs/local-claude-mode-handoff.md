# Handoff: Local Claude Code mode for Character Forge

A self-contained brief for implementing **"Route 2 — local Claude Code backend"**
in a future session. Source of truth for that task: follow this document.

## The prompt (copy into a new chat)

> Implement the **local Claude Code mode** in `dnd-toolbox`. Read
> `docs/local-claude-mode-handoff.md` first and follow it as the source of
> truth (design decisions, file map, response contract, acceptance criteria).
> Before wiring anything, smoke-test the CLI yourself
> (`claude -p 'Say hi' --output-format json`) to confirm the output shape.
> Keep the Vercel function path (`apps/hub/api/generate.js`) untouched — pushes
> to `main` auto-deploy to production. Run tests/lint/build, verify in the
> browser (preview config `dnd-hub`, resize to ~1440px), commit with explicit
> file paths (never `git add -A`), and push.

---

## 1. Goal

On the developer's own machine, `/api/generate` can be served by the locally
installed **Claude Code CLI** (`claude -p`, headless "print mode") using the
developer's Claude subscription — **no `ANTHROPIC_API_KEY` needed**. Opt-in via
env flag. **Personal use only**: this backend exists only inside the Vite dev
middleware and must never be deployed or exposed publicly (proxying a Claude
subscription to third parties violates Anthropic's usage policy; running your
own Claude Code locally is the sanctioned path — since 2026-06-15 such usage
draws from the subscription's "Agent SDK credit" pool).

## 2. Current state (what exists today)

- `apps/hub/api/_core.js` — runtime-agnostic proxy core.
  `handleGenerate({ body, ip, userKey, freeUsed }) → { status, json, consumedFree }`.
  Builds the prompt server-side (`buildFull` / `buildSection`, module-private),
  calls `api.anthropic.com` (model `claude-sonnet-4-6`, fixed `max_tokens`),
  extracts the first `{…}` JSON block from the reply, returns `{ fields }`.
  Also: 30s `AbortController` timeout, per-IP rate limit, free-quota gate
  (402 `free_quota_exhausted`), BYOK (`x-user-api-key`, 401 `invalid_user_key`).
- `apps/hub/api/_quota.js` — signed-cookie free-tier counter (`FREE_LIMIT`).
- `apps/hub/api/generate.js` — Vercel function wrapper (production). **Do not touch.**
- `apps/hub/api/_dev-middleware.js` — Vite plugin mounting `/api/generate` in
  `vite dev` / `vite preview`; wraps the same core + quota cookie.
- `apps/hub/vite.config.js` — `loadEnv` reads `apps/hub/.env` and copies
  `ANTHROPIC_API_KEY` onto `process.env` for the middleware.
- Client (`modules/character-forge/src/api.js` + `CharacterForge.jsx`) expects
  `{ fields, remaining? }`; when `remaining` is absent the free counter simply
  isn't shown — local mode can return bare `{ fields }` with no client changes.
- Underscore-prefixed files in `api/` are NOT deployed as Vercel functions.

## 3. Design decisions (locked)

1. **Flag:** `LOCAL_CLAUDE=1` in `apps/hub/.env` routes **all** `/api/generate`
   traffic in the dev middleware through the CLI — quota and BYOK are skipped
   entirely (it's the owner's machine). Optional: `LOCAL_CLAUDE_MODEL`
   (default `sonnet`) and `LOCAL_CLAUDE_BIN` (default `claude`, for non-PATH installs).
2. **New file `apps/hub/api/_local-claude.js`** with
   `handleGenerateLocal({ body, runClaude? }) → { status, json }`:
   - Reuse the exact prompt builders and JSON extraction from `_core.js` —
     export `buildFull`, `buildSection` (and, if useful, a shared
     `extractFields(text)` helper) from `_core.js` rather than duplicating them.
     Same request validation (mode/section) and the same response/error shapes.
   - Spawn without a shell: `spawn(bin, ['-p', prompt, '--output-format', 'json', '--model', model])`
     (array args → no escaping issues). Collect stdout/stderr; kill after ~90s → 504.
   - `--output-format json` prints a single JSON object; the completion text is
     in its `result` field and `is_error` flags failures. **Verify the shape
     empirically before coding against it** — run
     `claude -p 'Say hi' --output-format json` and adjust if it differs.
   - Error mapping: binary missing (`ENOENT`) → 500 with a clear message
     ("claude CLI not found — install Claude Code or unset LOCAL_CLAUDE");
     non-zero exit / `is_error` → 502 with a short stderr/result snippet;
     unparseable output → 502 (same wording as `_core.js` uses).
   - Inject the runner (`runClaude` param) so tests can stub it — CI has no
     `claude` binary and must stay green.
3. **`_dev-middleware.js`:** if `process.env.LOCAL_CLAUDE === '1'`, call
   `handleGenerateLocal` and skip the quota cookie; otherwise behave exactly as
   today. Import `_local-claude.js` only here — never from `generate.js`.
4. **`vite.config.js`:** copy `LOCAL_CLAUDE`, `LOCAL_CLAUDE_MODEL`,
   `LOCAL_CLAUDE_BIN` from `loadEnv` onto `process.env` (mirror the existing
   `ANTHROPIC_API_KEY` pattern).
5. **`.env.example`:** add commented `# LOCAL_CLAUDE=1`, `# LOCAL_CLAUDE_MODEL=sonnet`,
   `# LOCAL_CLAUDE_BIN=claude` with a one-line "personal use only" note.

## 4. Tests (vitest picks up `apps/**/*.test.js`)

In `apps/hub/api/local-claude.test.js`, with a stubbed `runClaude`:
- success path → 200, `{ fields }` with the five sections;
- CLI JSON wrapper with `is_error: true` → 502;
- garbage/non-JSON completion → 502;
- ENOENT from the runner → 500 with the install hint;
- invalid body (`mode: 'section'`, bad `section`) → 400 (same as core).

Existing tests must stay green (`corepack pnpm@9.12.3 test` — 14 today).

## 5. Docs to update

- `README.md`: short "Local Claude Code mode (optional, personal)" note in the
  Quickstart area.
- `wiki/API-Proxy.md`: a "Local mode" subsection (flag, how it works, ToS note);
  re-publish the wiki (clone `git@github.com:alexnovikoff/dnd-toolbox.wiki.git`,
  copy `wiki/*.md`, commit, push — branch `master`).
- `CLAUDE.md`: one line under Secrets/API about `LOCAL_CLAUDE=1`.

## 6. Acceptance criteria

1. `LOCAL_CLAUDE=1 pnpm dev` with **no** `ANTHROPIC_API_KEY` set:
   `curl -X POST localhost:5173/api/generate -H 'content-type: application/json' -d '{"mode":"full","name":"Kael","lang":"en"}'`
   → `200` with all five fields (this exercises the real CLI + subscription).
2. Character Forge generates in the browser in local mode; no free-counter row
   (no `remaining` in responses); section regeneration works.
3. Without the flag, behavior is byte-identical to today (free quota + BYOK
   probes from `wiki/API-Proxy.md` still pass; no `Set-Cookie` in local mode).
4. `pnpm build` output unchanged in behavior; `dist/` contains no reference to
   `_local-claude` (dev-only import); lint and all tests green.
5. Committed with explicit paths and pushed; production verified untouched
   (prod `/api/generate` still returns `remaining` on a keyless call).

## 7. Out of scope

Streaming, exposing local mode in production builds, any UI for switching
backends (env flag only), Windows support beyond best-effort `LOCAL_CLAUDE_BIN`.
