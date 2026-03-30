import { Client } from 'pg';

import 'dotenv/config';

export async function getConnectedClient(): Promise<Client> {
  const connectionString = process.env.PG_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('PG_CONNECTION_STRING environment variable is not set');
  }
  const client = new Client({ connectionString });
  await client.connect();
  return client;
}
