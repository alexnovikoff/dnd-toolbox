// dev-middleware.js — a Vite plugin that serves POST /api/generate locally,
// reusing the exact same handler as the Vercel function. This lets `pnpm dev`
// (and `vite preview`) work without `vercel dev`.
import { handleGenerate, getClientIp, readJsonBody } from './_core.js';

async function middleware(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }
  const body = await readJsonBody(req);
  const { status, json } = await handleGenerate({ body, ip: getClientIp(req) });
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
