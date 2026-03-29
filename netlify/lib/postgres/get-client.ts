import { Client } from 'pg';

import 'dotenv/config';

export class PostgresClient {
  static async getConnectedClient(): Promise<Client> {
    const client = new Client({
      connectionString: process.env.PG_CONNECTION_STRING ?? '',
    });
    await client.connect();
    return client;
  }
}
