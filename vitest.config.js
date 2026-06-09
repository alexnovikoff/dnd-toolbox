import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    include: [
      'packages/**/*.test.{js,jsx}',
      'modules/**/*.test.{js,jsx}',
      'apps/**/*.test.{js,jsx}',
    ],
  },
});
