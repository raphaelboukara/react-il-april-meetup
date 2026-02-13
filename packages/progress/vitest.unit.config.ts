import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.unit.test.tsx'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.unit.setup.ts'],
  },
});
