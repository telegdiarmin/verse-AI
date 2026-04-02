import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['netlify/tests/**/*.test.ts'],
    fileParallelism: false,
  },
});
