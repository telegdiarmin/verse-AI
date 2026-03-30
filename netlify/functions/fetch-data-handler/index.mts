import { ZodError } from 'zod';
import {
  FetchDataHandlerRequestSchema,
  type FetchDataHandlerInterface,
  type FetchDataHandlerResponseType,
} from '../../../src/types/fetch-data-handler.types';
import { jsonResponse } from '../../lib/response/json-response';
import { HttpException } from '../../lib/exceptions/http-exception';
import { PostgresClient } from '../../lib/postgres/get-client';
import { getUsers } from '../../lib/postgres/users';
import type { Client } from 'pg';
import type { VerseDataType } from '../../../src/types/verse-data.types';

const getVerseData = async (client: Client, userId: string): Promise<VerseDataType | undefined> => {
  const response = await client.query(
    /* sql */
    `
      SELECT
        v.poem_id,
        v.ordinal,
        v.text
      FROM
        verses v
        JOIN users_verses uv ON v.poem_id = uv.poem_id
        AND v.verse_id = uv.verse_id
      WHERE
        uv.user_id = $1
    `,
    [userId],
  );

  if (response.rows.length === 0) {
    return undefined;
  }

  const verseData: VerseDataType = {
    poemId: response.rows[0].poem_id,
    ordinal: response.rows[0].ordinal,
    verse: response.rows[0].text,
  };

  return verseData;
};

const fetchDataHandler: FetchDataHandlerInterface = async (request) => {
  const client = await PostgresClient.getConnectedClient();

  try {
    const registeredUsersData = await getUsers(client);
    const registeredUserNames = registeredUsersData.reduce<string[]>((names, user) => {
      if (user.name && user.userId !== request.userId) {
        names.push(user.name);
      }
      return names;
    }, []);
    const currentUserData = registeredUsersData.find((user) => user.userId === request.userId);

    const verseData = currentUserData
      ? await getVerseData(client, currentUserData.userId)
      : undefined;

    const responseData: FetchDataHandlerResponseType = {
      registeredUsers: registeredUserNames,
      userData: currentUserData,
      verseData,
    };

    return responseData;
  } catch (error) {
    throw error;
  }
};

export default async (request: Request) => {
  try {
    const parsedRequest = FetchDataHandlerRequestSchema.parse(await request.json());
    const response = await fetchDataHandler(parsedRequest);
    return jsonResponse(response, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse({ error: error.message }, 400);
    }

    if (error instanceof HttpException) {
      return jsonResponse({ error: error.message }, error.statusCode);
    }

    console.error('[fetch-data-handler] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return jsonResponse({ error: message }, 500);
  }
};
