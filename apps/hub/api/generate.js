// api/generate.js — Vercel Serverless Function (Node runtime).
// POST /api/generate → proxies to the Anthropic Messages API with the
// server-side key. See _core.js for prompt building, timeout and rate limiting.
import { handleGenerate, getClientIp, readJsonBody } from './_core.js';

export default async function handler(req, res) {
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
