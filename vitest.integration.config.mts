import { defineConfig } from 'vitest/config';
import 'dotenv/config';

const connectionString =
  process.env.PG_CONNECTION_STRING_LIVE || process.env.PG_CONNECTION_STRING || '';

export default defineConfig({
  test: {
    globals: true,
    include: ['netlify/tests/**/*.test.ts'],
    fileParallelism: false,
    env: {
      PG_CONNECTION_STRING: connectionString,
    },
  },
});
