# API Proxy (Variant A — server-side key)

The Anthropic API key **must never** ship in a client bundle. The hub exposes a
small server endpoint that holds the key and proxies requests; the browser only
ever calls `/api/generate`.

## Pieces

| File | Role |
|---|---|
| `apps/hub/api/_core.js` | Runtime-agnostic core: prompt building, Anthropic call, timeout, rate limit, BYOK. `handleGenerate({ body, ip, userKey, freeUsed }) → { status, json, consumedFree }`. |
| `apps/hub/api/_quota.js` | Free-tier quota: signed `ddtb_quota` cookie (HMAC), `FREE_LIMIT`. |
| `apps/hub/api/generate.js` | Vercel Serverless Function wrapping the core. |
| `apps/hub/api/_dev-middleware.js` | Vite plugin mounting `/api/generate` in dev/preview using the same core. (Underscore prefix keeps Vercel from deploying it as a function.) |
| `modules/character-forge/src/api.js` | Thin browser client (`fetch('/api/generate', …)`), user-key storage. |
| `modules/tavern-builder/src/api.js` | Same pattern for the tavern "enliven" call (shares the stored user key). |

## Request contract

The client sends **parameters only** — never a model id, raw messages, or a key.

```jsonc
// full character
{ "mode": "full", "name": "Kael", "race": "Tiefling", "cls": "Warlock",
  "vibe": "brooding", "gender": "male", "length": "normal", "lang": "ru" }

// regenerate one section
{ "mode": "section", "section": "backstory",
  "character": { ... }, "gender": "male", "length": "normal", "lang": "ru" }

// tavern read-aloud description (Tavern Builder «Оживить описание»)
{ "mode": "tavern_enliven", "lang": "ru",
  "facts": "Название: «Пьяный Грифон»\nТон: Уютная\n…" }
```

Response for `full`/`section`:
`{ "fields": { backstory, personality, goals, flaws, secret_desire } }`;
for `tavern_enliven`: `{ "text": "…" }` (2–3 sentences of plain prose). Both
add `"remaining": n` on free-tier calls; errors are `{ "error": "…", "code"?: "…" }`
with an appropriate HTTP status. All modes share one free-tier quota pool.

The server constructs the prompt (`langName`, gendered-language note, length
spec), calls `claude-sonnet-4-6`, and extracts the JSON object from the reply.
Building the prompt server-side means the client can't abuse your key to call
arbitrary models or inject arbitrary content.

## Hardening (built in)

- **Timeout:** `AbortController`, 30s → `504`.
- **Errors:** missing key → `500` with guidance; upstream non-2xx → passthrough
  status; malformed/empty model output → `502`.
- **Rate limit:** best-effort in-memory sliding window (20 req / 60s / IP) → `429`.
  Serverless instances are short-lived, so for a hard quota use a shared store
  (Vercel KV / Upstash Redis) keyed by IP or user.

## Free tier + BYOK

Each browser gets **`FREE_GENERATIONS`** (default 10) successful generations on
the server key. The used count travels in a signed, HttpOnly cookie
(`ddtb_quota`): tamper-proof via HMAC (secret = `QUOTA_SECRET`, defaulting to a
derivation of the API key), but clearable — this is a *soft* free tier. Only
successful generations spend quota; errors are free.

After the limit, `/api/generate` returns **`402` + `code: "free_quota_exhausted"`**
and the UI prompts for the user's own Anthropic key (BYOK):

- The key is stored **only in the user's browser** (`localStorage`,
  `ddtb_user_key`) and sent per request as the **`x-user-api-key`** header.
- The server validates the `sk-ant-…` shape, forwards it to Anthropic
  **in-memory only** — never logged, never persisted — and skips the quota.
- A bad key maps to **`401` + `code: "invalid_user_key"`** (upstream 401 included).
- `FREE_GENERATIONS=0` disables the free tier (a user key is always required).

The model and `max_tokens` stay fixed server-side in both modes, so neither the
free tier nor BYOK can be abused for arbitrary prompts or large outputs.

## Local development

`apps/hub/vite.config.js` loads `.env` and puts `ANTHROPIC_API_KEY` on
`process.env`, then mounts the dev middleware. So:

```bash
cp apps/hub/.env.example apps/hub/.env   # ANTHROPIC_API_KEY=sk-ant-...
pnpm dev
```

No `vercel dev` needed. Without a key the endpoint returns a clear `500` and the
UI shows an error instead of crashing.

## Local mode (Claude Code CLI) — personal

With `LOCAL_CLAUDE=1` in `apps/hub/.env`, the dev middleware serves
`/api/generate` by spawning the locally installed **Claude Code CLI**
(`claude -p … --output-format json`) instead of calling the Anthropic API.
It runs on your Claude subscription — no `ANTHROPIC_API_KEY` needed.

| Var | Default | Meaning |
|---|---|---|
| `LOCAL_CLAUDE` | unset | `1` routes **all** dev `/api/generate` traffic through the CLI |
| `LOCAL_CLAUDE_MODEL` | `sonnet` | Passed to `claude --model` |
| `LOCAL_CLAUDE_BIN` | `claude` | CLI binary path (for non-PATH installs) |

- Quota and BYOK are skipped entirely (it's the owner's machine): responses are
  bare `{ fields }` — no `remaining`, no quota cookie — so the UI hides the
  free counter.
- Same prompts, validation, and response shapes as the API path (the
  `_core.js` builders are reused). CLI failures map to `500` (binary missing),
  `502` (CLI/auth/parse errors), `504` (90s timeout).
- The CLI is spawned without a shell and with `ANTHROPIC_*` env stripped, so
  it always authenticates with your `claude` login.
- **Personal use only.** `_local-claude.js` is imported solely by the dev
  middleware and must never be deployed or exposed publicly — proxying a
  Claude subscription to third parties violates Anthropic's usage policy;
  running Claude Code locally for yourself is the sanctioned path.

## Production (Vercel)

1. Root Directory = `apps/hub` (framework: Vite).
2. Env var `ANTHROPIC_API_KEY` (Production + Preview). Optional:
   `FREE_GENERATIONS`, `QUOTA_SECRET` (see Free tier + BYOK above).
3. `vercel.json` rewrites everything except `/api/*` to `index.html` (SPA routing).

## Other platforms

`_core.js` is platform-neutral. To use Cloudflare Workers / Netlify Functions,
write a thin adapter that reads the JSON body + client IP and calls
`handleGenerate`, then returns `{ status, json }`. Keep the key in that platform's
secret store.
