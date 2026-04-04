import { Client } from 'pg';
import { getConnectedClient, sanitizeConnectionStringForLog } from './get-client';

describe('getConnectedClient', () => {
  it('should connect to the database and return a connected client', async () => {
    const client = await getConnectedClient();

    expect(client).toBeInstanceOf(Client);

    const result = await client.query('SELECT 1 AS value');
    expect(result.rows[0].value).toBe(1);

    await client.end();
  });
});

describe('sanitizeConnectionStringForLog', () => {
  it('should mask credentials in a local connection string', () => {
    const input = 'postgresql://postgres:postgres@localhost:54322/postgres';
    const result = sanitizeConnectionStringForLog(input);

    expect(result).toBe('postgresql://postgres:***res@localhost:54322/postgres');
    expect(result).not.toContain(':postgres@');
  });

  it('should mask credentials in a remote Supabase connection string', () => {
    const input =
      'postgresql://postgres.aifeeoihgiaegfienfao:A7k$zQ!9pL2@xV#eR8w^T1b&Y@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';
    const result = sanitizeConnectionStringForLog(input);

    expect(result).toBe(
      'postgresql://postgres.aif***:***b&Y@aws-1-eu-west-1.pooler.supabase.com:6543/postgres',
    );
    expect(result).not.toContain('aifeeoihgiaegfienfao');
    expect(result).not.toContain('A7k$zQ!9pL2@xV#eR8w^T1b&Y');
  });
});
