import { Client } from 'pg';

import 'dotenv/config';

export class PostgresClient {
  private static instance: PostgresClient;
  private client: Client;

  private constructor() {
    this.client = new Client({
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
