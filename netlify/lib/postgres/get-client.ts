import { Client } from 'pg';

import 'dotenv/config';

export class PostgresClient {
  private static instance: PostgresClient;
  private client: Client;

  private constructor() {
    this.client = new Client({
      host: process.env.PG_HOST ?? '',
      port: Number(process.env.PG_PORT ?? ''),
      database: process.env.PG_DATABASE ?? '',
      user: process.env.PG_USER ?? '',
      connectionString: process.env.PG_CONNECTION_STRING ?? '',
    });
  }

  static async getClient(): Promise<Client> {
    if (!PostgresClient.instance) {
      PostgresClient.instance = new PostgresClient();
      await PostgresClient.instance.client.connect();
    }

    return PostgresClient.instance.client;
  }
}
