import { Client } from 'pg';

import 'dotenv/config';

export function sanitizeConnectionStringForLog(connectionString: string): string {
  return connectionString
    .replace(
      /(postgres\.)(.{3})[^:]*:([\s\S]*)(.{3})@(?=[a-zA-Z0-9][\w.-]+:\d)/,
      (_, prefix, userStart, _mid, pwdEnd) => `${prefix}${userStart}***:***${pwdEnd}@`,
    )
    .replace(
      /:\/\/([^.:/]+):([\s\S]*)(.{3})@(?=[a-zA-Z0-9][\w.-]+:\d)/,
      (_, user, _mid, pwdEnd) => `://${user}:***${pwdEnd}@`,
    );
}

export async function getConnectedClient(): Promise<Client> {
  const connectionString = process.env.PG_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('PG_CONNECTION_STRING environment variable is not set');
  }
  console.log(
    'Connecting to PostgreSQL with connection string:',
    sanitizeConnectionStringForLog(connectionString),
  );
  const client = new Client({ connectionString });
  await client.connect();
  return client;
}
