import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { anthropicProxy } from './api/_dev-middleware.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(here, '../..');

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load every var from .env (not just VITE_-prefixed) and expose the key to the
  // dev/preview middleware via process.env. It is never injected into the bundle.
  const env = loadEnv(mode, here, '');
  if (env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
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
