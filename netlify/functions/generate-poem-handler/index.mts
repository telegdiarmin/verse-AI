import { GoogleGenerativeAI } from '@google/generative-ai';
import { ZodError } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  GeneratePoemHandlerRequestSchema,
  type GeneratePoemHandlerInterface,
  type GeneratePoemHandlerResponseType,
} from '../../../src/types/generate-poem-handler.types';
import { PostgresClient } from '../../lib/postgres/get-client';
import 'dotenv/config';
import { HttpException } from '../../lib/exceptions/http-exception';
import type { UserDataType } from '../../../src/types/user-data.types';
import type { Client } from 'pg';
import type { VerseDataType } from '../../../src/types/verse-data.types';

export type UserVerseMapType = Record<string, VerseDataType>;

const getUsers = async (client: Client): Promise<UserDataType[]> => {
  const usersResult = await client.query(/* sql */
  `
    SELECT
      id,
      name
    FROM
      users;
  `);

  const users: UserDataType[] = usersResult.rows.map((row) => ({
    userId: row.id,
    name: row.name,
  }));

  return users;
};

const getGeneratePoemPrompt = (verseCount: number): string => {
  return `
  LEÍRÁS:
  Generálj egy magyar nyelvű húsvéti locsolóverset, amely ${verseCount} sorból áll.
  A vers álljon egységesen 12-14 szótagú sorokból és a rímképlet legyen AABB.
  A vers legyen humoros és könnyed, legyen modern stílusú és tartalmazzon egy vagy több utalást a tavaszra vagy a húsvétra.
  Ne használj ismétlődő sorokat, minden sor legyen egyedi.
  VISSZATÉRÉSI FORMÁTUM:
  A verset sorokra bontva add vissza a következő formátumban: pl. "(1.) Első sor szövege  | (2.) Második sor szövege" | ..."
  `;
};

const randomMapVersesToUsers = (
  verses: VerseDataType[],
  users: UserDataType[],
): UserVerseMapType => {
  const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
  const userVerseMap: UserVerseMapType = {};

  verses.forEach((verse, index) => {
    const user = shuffledUsers[index % shuffledUsers.length];
    userVerseMap[user.userId] = verse;
  });

  return userVerseMap;
};

const insertVerseAndLinkToUser = async (
  client: Client,
  userId: string,
  verseData: VerseDataType,
) => {
  const { poemId, ordinal, verse } = verseData;
  await client.query(
    /* sql */ `
      WITH
        inserted_verse AS (
          INSERT INTO
            verses (poem_id, ordinal, text)
          VALUES
            ($1, $2, $3)
          RETURNING
            poem_id,
            verse_id
        )
      INSERT INTO
        users_verses (user_id, poem_id, verse_id)
      SELECT
        $4,
        poem_id,
        verse_id
      FROM
        inserted_verse;
    `,
    [poemId, ordinal, verse, userId],
  );
};

const transaction = async (
  client: Client,
  verseData: UserVerseMapType,
  callback: (client: Client, userId: string, verse: VerseDataType) => Promise<void>,
): Promise<void> => {
  await client.query('BEGIN');

  try {
    for (const [userId, verse] of Object.entries(verseData)) {
      await callback(client, userId, verse);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

const generatePoemHandler: GeneratePoemHandlerInterface = async (request) => {
  const client = await PostgresClient.getConnectedClient();

  try {
    const usersResult = await getUsers(client);
    const userIndex = usersResult.findIndex((user) => user.userId === request.userId);

    if (userIndex === -1) {
      throw new HttpException(401, 'User is not registered');
    }

    const verseCount = usersResult.length;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const { response } = await model.generateContent(getGeneratePoemPrompt(verseCount));
    const poem = response.text();

    const poemId = uuidv4();

    const verses: VerseDataType[] = [...poem.matchAll(/\((\d+)\.\)\s+([^|]+)/g)].map((match) => ({
      poemId,
      ordinal: Number(match[1]),
      verse: match[2].trim(),
    }));

    const userVerseMap = randomMapVersesToUsers(verses, usersResult);

    await transaction(client, userVerseMap, insertVerseAndLinkToUser);

    const responseData: GeneratePoemHandlerResponseType = {
      userId: request.userId,
      verseData: userVerseMap[request.userId],
    };

    return responseData;
  } finally {
    await client.end();
  }
};

export default async (request: Request) => {
  try {
    const parsedRequest = GeneratePoemHandlerRequestSchema.parse(await request.json());
    const response = await generatePoemHandler(parsedRequest);
    return jsonResponse(response, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse({ error: error.message }, 400);
    }

    if (error instanceof HttpException) {
      return jsonResponse({ error: error.message }, error.statusCode);
    }

    console.error('[generate-poem-handler] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return jsonResponse({ error: message }, 500);
  }
};

const jsonResponse = (body: object, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
