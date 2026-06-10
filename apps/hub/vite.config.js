import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { anthropicProxy } from './api/_dev-middleware.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(here, '../..');

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load every var from .env (not just VITE_-prefixed) and expose what the
  // dev/preview middleware needs via process.env. Never injected into the bundle.
  const env = loadEnv(mode, here, '');
  for (const key of ['ANTHROPIC_API_KEY', 'LOCAL_CLAUDE', 'LOCAL_CLAUDE_MODEL', 'LOCAL_CLAUDE_BIN']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [react(), anthropicProxy()],
    resolve: { dedupe: ['react', 'react-dom'] },
    server: {
      // allow Vite to serve workspace package sources (packages/*, modules/*)
      fs: { allow: [workspaceRoot] },
    },
  };
});
