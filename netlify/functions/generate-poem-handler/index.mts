import { ZodError } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  GeneratePoemHandlerRequestSchema,
  type GeneratePoemHandlerInterface,
  type GeneratePoemHandlerResponseType,
} from '../../../src/types/generate-poem-handler.types';
import { getConnectedClient } from '../../lib/postgres/get-client';
import 'dotenv/config';
import { HttpException } from '../../lib/exceptions/http-exception';
import type { UserDataType } from '../../../src/types/user-data.types';
import type { Client } from 'pg';
import type { VerseDataType } from '../../../src/types/verse-data.types';
import { jsonResponse } from '../../lib/response/json-response';
import { getUsers } from '../../lib/postgres/users';
import { getModel } from '../../lib/llm/get-model';

export type UserVerseMapType = Record<string, VerseDataType>;

// Allow only letters (a-z, A-Z, Hungarian accented) and hyphens, max 20 chars
export const SAFE_KEYWORD_PATTERN = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\-]{1,20}$/u;

export const prepareKeywords = (keywords: string[], verseCount: number): string[] => {
  const maxKeywords = Math.floor(verseCount / 2);
  return keywords
    .map((keyword) => keyword.trim())
    .filter((keyword) => SAFE_KEYWORD_PATTERN.test(keyword))
    .map((keyword) => `<${keyword}>`)
    .slice(0, maxKeywords);
};

const getGeneratePoemPrompt = (verseCount: number, keywords?: string[]): string => {
  // Keywords are wrapped in angle brackets to minimize the risk of injection attacks
  const keywordsInstruction =
    keywords && keywords.length > 0
      ? `Használd fel az alábbi kulcsszavakat a versben: ${keywords.join(', ')}
        A megadott szavakat szervesen, erőltetés nélkül építsd be a szövegkörnyezetbe.
        Törekedj arra, hogy az összes megadott szó szerepeljen a kész műben.
        Amennyiben a kulcsszavak személyneveket, konkrét helyszíneket vagy speciális jellemzőket tartalmaznak, 
        a vers témáját és narratíváját igazítsd ezekhez, hogy a végeredmény személyes és célzott legyen.
        A név köré építs fel egy rövid, vicces szituációt vagy jellemrajzot.`
      : '';

  return `
  LEÍRÁS:
  Generálj egy egyedi, magyar nyelvű, modern húsvéti locsolóverset az alábbi szempontok alapján:
  Szerkezet és ritmus: A vers legyen pontosan ${verseCount} verssor hosszúságú.

  Minden egyes sor 12-14 szótagból álljon, hogy a versnek hömpölygő, magabiztos, mégis természetes lüktetése legyen. 
  Alkalmazz szigorú AABB (páros rím) képletet minden versszakon belül.
  Hangvétel és karakter: A stílus legyen erősen önironikus és humoros. 
  A locsoló ne egy klasszikus hős, hanem egy esendő, "anti-hős" karakter legyen (pl. kicsit lusta, technológiafüggő, éhes vagy éppen ügyetlen). 
  Kerüld a hagyományos, elcsépelt fordulatokat, mint a 'szép virágszál' vagy a 'zöld erdőben jártam'. A humor forrása a modern élet kihívásai és a hagyomány kontrasztja legyen.

  Nyelvezet: A szóhasználat legyen hétköznapi, de frappáns. Kerüld a túl magyarázó, száraz leírásokat. 
  A rímek legyenek tiszták, de ne dedósak. A vers tükrözze a 2020-as évek hangulatát (pl. kütyük, gazdaság, életmód trendek).
  A válaszod kizárólag a generált verset tartalmazza, ne fűzz hozzá bevezetőt vagy elemzést!
  Ne használj ismétlődő sorokat, minden sor legyen egyedi.

  ${keywordsInstruction}
  
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
  const client = await getConnectedClient();

  try {
    const usersResult = await getUsers(client);
    const currentUserIndex = usersResult.findIndex((user) => user.userId === request.userId);

    if (currentUserIndex === -1) {
      throw new HttpException(401, 'User is not registered');
    }

    const verseCount = usersResult.length;

    const keywords =
      request.keywords && request.keywords.length > 0
        ? prepareKeywords(request.keywords, verseCount)
        : undefined;

    const model = await getModel();

    const { response } = await model.generateContent(getGeneratePoemPrompt(verseCount, keywords));
    const poem = response.text();

    const poemId = uuidv4();

    const verses: VerseDataType[] = [...poem.matchAll(/\((\d+)\.\)\s+([^|]+)/g)].map((match) => ({
      poemId,
      ordinal: Number(match[1]),
      verse: match[2].trim(),
    }));

    if (verses.some((verse) => verse.ordinal <= 0)) {
      throw new HttpException(500, 'Generated poem contained an invalid verse ordinal');
    }

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

    console.log('[generate-poem-handler] Poem generated successfully for user:', {
      userId: parsedRequest.userId,
      poemId: response.verseData.poemId,
    });

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
