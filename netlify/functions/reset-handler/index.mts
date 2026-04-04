import { ZodError } from 'zod';
import {
  ResetHandlerRequestSchema,
  type ResetHandlerInterface,
} from '../../../src/types/reset-handler.types';
import { HttpException } from '../../lib/exceptions/http-exception';
import { jsonResponse } from '../../lib/response/json-response';
import { getConnectedClient } from '../../lib/postgres/get-client';

const resetHandler: ResetHandlerInterface = async (request) => {
  const client = await getConnectedClient();

  try {
    const currentUserResult = await client.query(
      /* sql */
      `
        SELECT
          id
        FROM
          users
        WHERE
          id = $1;
      `,
      [request.userId],
    );

    if (currentUserResult.rows.length === 0) {
      throw new HttpException(401, 'User is not registered');
    }

    await client.query(/* sql */
    `
      TRUNCATE TABLE users_verses,
      verses,
      users RESTART IDENTITY CASCADE;
    `);
  } finally {
    await client.end();
  }
};

export default async (request: Request) => {
  try {
    const parsedRequest = ResetHandlerRequestSchema.parse(await request.json());
    await resetHandler(parsedRequest);

    console.log('[reset-handler] Database reset successfully by user:', {
      userId: parsedRequest.userId,
    });

    return jsonResponse({}, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse({ error: error.message }, 400);
    }

    if (error instanceof HttpException) {
      return jsonResponse({ error: error.message }, error.statusCode);
    }

    console.error('[reset-handler] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return jsonResponse({ error: message }, 500);
  }
};
