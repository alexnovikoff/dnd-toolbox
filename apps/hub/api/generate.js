// api/generate.js — Vercel Serverless Function (Node runtime).
// POST /api/generate → proxies to the Anthropic Messages API with the
// server-side key (free tier, counted via signed cookie) or the caller's own
// key (`x-user-api-key`, BYOK). See _core.js / _quota.js for the details.
import { handleGenerate, getClientIp, readJsonBody, readUserKey } from './_core.js';
import { readUsedFromCookie, quotaCookie } from './_quota.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }
  const body = await readJsonBody(req);
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
