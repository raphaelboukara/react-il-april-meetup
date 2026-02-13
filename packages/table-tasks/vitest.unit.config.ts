import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@demo/progress-with-hover-and-reset', replacement: resolve(__dirname, '../progress-with-hover-and-reset/src/index.ts') },
    ],
  },
  test: {
    include: ['src/**/*.unit.test.tsx'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.unit.setup.ts'],
  },
});
