# API Proxy (Variant A — server-side key)

The Anthropic API key **must never** ship in a client bundle. The hub exposes a
small server endpoint that holds the key and proxies requests; the browser only
ever calls `/api/generate`.

## Pieces

| File | Role |
|---|---|
| `apps/hub/api/_core.js` | Runtime-agnostic core: prompt building, Anthropic call, timeout, rate limit. `handleGenerate({ body, ip }) → { status, json }`. |
| `apps/hub/api/generate.js` | Vercel Serverless Function wrapping the core. |
| `apps/hub/api/dev-middleware.js` | Vite plugin mounting `/api/generate` in dev/preview using the same core. |
| `modules/character-forge/src/api.js` | Thin browser client (`fetch('/api/generate', …)`). |

## Request contract

The client sends **parameters only** — never a model id, raw messages, or a key.

```jsonc
// full character
{ "mode": "full", "name": "Kael", "race": "Tiefling", "cls": "Warlock",
  "vibe": "brooding", "gender": "male", "length": "normal", "lang": "ru" }

// regenerate one section
{ "mode": "section", "section": "backstory",
  "character": { ... }, "gender": "male", "length": "normal", "lang": "ru" }
```

Response: `{ "fields": { backstory, personality, goals, flaws, secret_desire } }`
or `{ "error": "…" }` with an appropriate HTTP status.

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

## Local development

`apps/hub/vite.config.js` loads `.env` and puts `ANTHROPIC_API_KEY` on
`process.env`, then mounts the dev middleware. So:

```bash
cp apps/hub/.env.example apps/hub/.env   # ANTHROPIC_API_KEY=sk-ant-...
pnpm dev
```

No `vercel dev` needed. Without a key the endpoint returns a clear `500` and the
UI shows an error instead of crashing.

## Production (Vercel)

1. Root Directory = `apps/hub` (framework: Vite).
2. Env var `ANTHROPIC_API_KEY` (Production + Preview).
3. `vercel.json` rewrites everything except `/api/*` to `index.html` (SPA routing).

## Other platforms

`_core.js` is platform-neutral. To use Cloudflare Workers / Netlify Functions,
write a thin adapter that reads the JSON body + client IP and calls
`handleGenerate`, then returns `{ status, json }`. Keep the key in that platform's
secret store.
