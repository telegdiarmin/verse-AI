import { Client } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import 'dotenv/config';

export const createTestClient = async (): Promise<Client> => {
  const PG_CONNECTION_STRING = process.env.PG_CONNECTION_STRING;

  const client = new Client({ connectionString: PG_CONNECTION_STRING });
  return client;
};

export type TableConfig = {
  users?: boolean;
  verses?: boolean;
  users_verses?: boolean;
};

const ALL_TABLES_ENABLED: Required<TableConfig> = {
  users: true,
  verses: true,
  users_verses: true,
};

const SEED_FILES: Record<keyof TableConfig, string | null> = {
  users: 'supabase/seeds/01_users.sql',
  verses: 'supabase/seeds/02_verses.sql',
  users_verses: 'supabase/seeds/03_users_verses.sql',
};

// Truncation order must respect FK constraints (dependents first)
const TRUNCATE_ORDER: (keyof TableConfig)[] = ['users_verses', 'verses', 'users'];

// Seed insertion order must respect FK constraints (parents first)
const SEED_ORDER: (keyof TableConfig)[] = ['users', 'verses', 'users_verses'];

export const truncateTables = async (
  client: Client,
  config: TableConfig = ALL_TABLES_ENABLED,
): Promise<void> => {
  const tables = TRUNCATE_ORDER.filter((table) => config[table] ?? false);

  if (tables.length === 0) return;

  await client.query(`TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE;`);
};

export const seedTables = async (
  client: Client,
  config: TableConfig = ALL_TABLES_ENABLED,
): Promise<void> => {
  await truncateTables(client, config);

  const tablesToSeed = SEED_ORDER.filter((table) => {
    const enabled = config[table] ?? false;
    const seedFile = SEED_FILES[table];
    return enabled && seedFile !== null;
  });

  for (const table of tablesToSeed) {
    const filePath = resolve(process.cwd(), SEED_FILES[table]!);
    const sql = readFileSync(filePath, 'utf-8');
    await client.query(sql);
  }
};
