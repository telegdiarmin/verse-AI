import { ZodError } from 'zod';

import {
  RegisterUserHandlerRequestSchema,
  type RegisterUserHandlerInterface,
  type RegisterUserHandlerResponseType,
} from '../../../src/types/register-user-handler.types';
import { PostgresClient } from '../../lib/postgres/get-client';

import 'dotenv/config';

const registerUserHandler: RegisterUserHandlerInterface = async (request) => {
  const client = await PostgresClient.getClient();

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
  } catch (error) {
    throw error;
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
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: 'An unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
};
