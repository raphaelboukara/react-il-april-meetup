import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@demo/table-tasks-with-data', replacement: resolve(__dirname, './src/index.ts') },
      { find: '@demo/progress-with-hover-and-reset', replacement: resolve(__dirname, '../progress-with-hover-and-reset/src/index.ts') },
    ],
  },
  test: {
    include: ['src/**/*.browser.test.tsx'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
