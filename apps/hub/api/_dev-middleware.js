// _dev-middleware.js — a Vite plugin that serves POST /api/generate locally,
// reusing the exact same handler as the Vercel function. This lets `pnpm dev`
// (and `vite preview`) work without `vercel dev`.
import { handleGenerate, getClientIp, readJsonBody, readUserKey } from './_core.js';
import { handleGenerateLocal } from './_local-claude.js';
import { readUsedFromCookie, quotaCookie } from './_quota.js';

async function middleware(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }
  const body = await readJsonBody(req);

  // LOCAL_CLAUDE=1 (apps/hub/.env): personal local mode — serve via the
  // developer's Claude Code CLI. No quota cookie, no BYOK, no `remaining`.
  if (process.env.LOCAL_CLAUDE === '1') {
    const { status, json } = await handleGenerateLocal({ body });
    res.statusCode = status;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(json));
    return;
  }

  const freeUsed = readUsedFromCookie(req);
  const { status, json, consumedFree } = await handleGenerate({
    body,
    ip: getClientIp(req),
    userKey: readUserKey(req),
    freeUsed,
  });
  if (consumedFree) res.setHeader('set-cookie', quotaCookie(freeUsed + 1));
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(json));
}

export function anthropicProxy() {
  return {
    name: 'anthropic-proxy',
    configureServer(server) {
      server.middlewares.use('/api/generate', middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/generate', middleware);
    },
  };
}
