import { ZodError } from 'zod';

import {
  RegisterUserHandlerRequestSchema,
  type RegisterUserHandlerInterface,
  type RegisterUserHandlerResponseType,
} from '../../../src/types/register-user-handler.types';
import { PostgresClient } from '../../lib/postgres/get-client';

import 'dotenv/config';
import { jsonResponse } from '../../lib/response/json-response';
import { HttpException } from '../../lib/exceptions/http-exception';

const registerUserHandler: RegisterUserHandlerInterface = async (request) => {
  const client = await PostgresClient.getConnectedClient();

  try {
    const result = await client.query(
      /* sql */
      `
        INSERT INTO
          users (name)
        VALUES
          ($1)
        RETURNING
          name,
          id;
      `,
      [request.name],
    );

    const responseData: RegisterUserHandlerResponseType = {
      userData: {
        name: result.rows[0].name,
        userId: result.rows[0].id,
      },
    };

    return responseData;
  } finally {
    await client.end();
  }
};

export default async (request: Request) => {
  try {
    const parsedRequest = RegisterUserHandlerRequestSchema.parse(await request.json());
    const response = await registerUserHandler(parsedRequest);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse({ error: error.message }, 400);
    }

    if (error instanceof HttpException) {
      return jsonResponse({ error: error.message }, error.statusCode);
    }

    console.error('[register-user-handler] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return jsonResponse({ error: message }, 500);
  }
};
