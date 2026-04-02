import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['netlify/**/*.test.ts'],
    exclude: ['netlify/tests/**'],
    fileParallelism: false, // Temporarily disable to prevent DB operation conflicts
  },
});
