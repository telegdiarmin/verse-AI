import registerUserHandler from '../functions/register-user-handler/index.mts';
import generatePoemHandler from '../functions/generate-poem-handler/index.mts';
import type { RegisterUserHandlerResponseType } from '../../src/types/register-user-handler.types';
import type { DeepPartial } from './types';
import type { Client } from 'pg';
import type { UserDataType } from '../../src/types/user-data.types';
import type { VerseDataType } from '../../src/types/verse-data.types';
import type { GeneratePoemHandlerResponseType } from '../../src/types/generate-poem-handler.types';

export const registerMockUser = async (name: string): Promise<string> => {
  const registerResponse = await registerUserHandler(
    new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }),
  );
  const registerData = (await registerResponse.json()) as {
    userData: { userId: string };
  } satisfies DeepPartial<RegisterUserHandlerResponseType>;
  return registerData.userData.userId;
};

export const generateMockPoem = async (
  userId: string,
): Promise<GeneratePoemHandlerResponseType> => {
  const generateResponse = await generatePoemHandler(
    new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }),
  );
  if (!generateResponse.ok) {
    const errorBody = await generateResponse.text();
    throw new Error(`generateMockPoem failed with HTTP ${generateResponse.status}: ${errorBody}`);
  }
  const generateData = (await generateResponse.json()) as GeneratePoemHandlerResponseType;
  return generateData;
};

export const insertMockUsers = async (client: Client, users: UserDataType[]): Promise<void> => {
  if (users.length === 0) return;
  const valuePlaceholders = users.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(', ');
  const params = users.flatMap((user) => [user.userId, user.name]);

  await client.query(`INSERT INTO users (id, name) VALUES ${valuePlaceholders}`, params);
};

export const getUserVerseData = async (
  client: Client,
  userIds: string[],
): Promise<Record<string, VerseDataType>> => {
  if (userIds.length === 0) return {};
  const placeholders = userIds.map((_, i) => `$${i + 1}`).join(', ');

  const result = await client.query(
    `
      SELECT
        uv.user_id,
        v.poem_id,
        v.ordinal,
        v.text
      FROM
        verses v
        JOIN users_verses uv ON v.poem_id = uv.poem_id AND v.verse_id = uv.verse_id
      WHERE
        uv.user_id IN (${placeholders})
    `,
    userIds,
  );

  const map: Record<string, VerseDataType> = {};
  for (const row of result.rows) {
    map[row.user_id] = { poemId: row.poem_id, ordinal: row.ordinal, verse: row.text };
  }
  return map;
};
