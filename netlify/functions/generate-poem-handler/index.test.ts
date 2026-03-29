import type {
  GeneratePoemHandlerRequestType,
  GeneratePoemHandlerResponseType,
} from '../../../src/types/generate-poem-handler.types';
import handler from './index.mts';
import registerUserHandler from '../register-user-handler/index.mts';
import {
  createTestClient,
  getUserVerseData,
  insertMockUsers,
  seedTables,
  truncateTables,
} from '../../test-utils/db';
import type { UserDataType } from '../../../src/types/user-data.types';
import type { RegisterUserHandlerResponseType } from '../../../src/types/register-user-handler.types';
import {
  GenerativeModel,
  GoogleGenerativeAI,
  type GenerateContentResult,
} from '@google/generative-ai';
import type { VerseDataType } from '../../../src/types/verse-data.types';
import type { DeepPartial } from '../../test-utils/types';

const mockGenerateContentResponse: Promise<GenerateContentResult> = Promise.resolve({
  response: {
    text: () => `
      (1.) First verse | (2.) Second verse | (3.) Third verse | (4.) Fourth verse |
    `,
    functionCalls: () => undefined,
    functionCall: () => undefined,
  },
});

const mockModel: DeepPartial<GenerativeModel> = {
  generateContent: () => mockGenerateContentResponse,
};

const GoogleGenerativeAiSpy = vi.spyOn(GoogleGenerativeAI.prototype, 'getGenerativeModel');

const mockUserData: UserDataType[] = [
  { userId: '8e4ef280-3ced-4e59-b170-84525217fb1d', name: 'User 1' },
  { userId: 'deeb478d-81d0-46d8-ba7a-467142c7a04b', name: 'User 2' },
  { userId: '4d2328b3-af45-47d1-9a71-fa3bc319d934', name: 'User 3' },
];

describe('generatePoemHandler', async () => {
  const testClient = await createTestClient();

  let mockGeneratingUserId: UserDataType['userId'];

  beforeAll(async () => {
    await testClient.connect();

    await truncateTables(testClient);
    await insertMockUsers(testClient, mockUserData);

    mockGeneratingUserId = await registerMockUser('Test User');

    GoogleGenerativeAiSpy.mockReturnValue(mockModel as GenerativeModel);
  });

  afterEach(async () => {
    await truncateTables(testClient, { verses: true, users_verses: true });
  });

  afterAll(async () => {
    await seedTables(testClient, { users: true });
    await testClient.end();

    vi.resetAllMocks();
  });

  it('should generate a poem and return verse data for the requesting user', async () => {
    const payload: GeneratePoemHandlerRequestType = {
      userId: mockGeneratingUserId,
    };

    const response = await handler(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    );

    const responseData = await response.json();

    const expectedResult: GeneratePoemHandlerResponseType = {
      userId: expect.any(String),
      verseData: {
        poemId: expect.any(String),
        ordinal: expect.any(Number),
        verse: expect.any(String),
      },
    };

    expect(response!.status).toBe(200);
    expect(responseData).toMatchObject(expectedResult);
  });

  it('should save the generated verses and their associations to the database', async () => {
    const payload: GeneratePoemHandlerRequestType = {
      userId: mockGeneratingUserId,
    };

    await handler(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    );

    const combinedMockUserIds = [...mockUserData.map((user) => user.userId), mockGeneratingUserId];
    const userVerseDataResult = await getUserVerseData(testClient, combinedMockUserIds);

    const expectedResult: Record<string, VerseDataType> = {
      poemId: expect.any(String),
      ordinal: expect.any(Number),
      verse: expect.any(String),
    };

    for (const [userId, verseData] of Object.entries(userVerseDataResult)) {
      expect(combinedMockUserIds).toContain(userId);
      expect(verseData).toEqual(expectedResult);
    }
  });

  it('should return a validation error when input is invalid', async () => {
    const payload: GeneratePoemHandlerRequestType = { userId: 'invalid-uuid' };

    const response = await handler(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    );

    expect(response!.status).toBe(400);

    await expect(response!.json()).resolves.toMatchObject({
      error: expect.stringContaining('Invalid UUID'),
    });
  });
});

const registerMockUser = async (name: string): Promise<string> => {
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
