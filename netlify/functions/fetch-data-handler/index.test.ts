import {
  GenerativeModel,
  GoogleGenerativeAI,
  type GenerateContentResult,
} from '@google/generative-ai';
import type {
  FetchDataHandlerRequestType,
  FetchDataHandlerResponseType,
} from '../../../src/types/fetch-data-handler.types';
import type { RegisterUserHandlerResponseType } from '../../../src/types/register-user-handler.types';
import type { UserDataType } from '../../../src/types/user-data.types';
import { createTestClient, insertMockUsers, seedTables, truncateTables } from '../../test-utils/db';
import type { DeepPartial } from '../../test-utils/types';
import generatePoemHandler from '../generate-poem-handler/index.mts';
import registerUserHandler from '../register-user-handler/index.mts';
import handler from './index.mts';

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

describe('fetchDataHandler', async () => {
  const testClient = await createTestClient();

  beforeAll(async () => {
    await testClient.connect();

    await truncateTables(testClient);
    await insertMockUsers(testClient, mockUserData);

    GoogleGenerativeAiSpy.mockReturnValue(mockModel as GenerativeModel);
  });

  afterEach(async () => {
    await truncateTables(testClient);
    await insertMockUsers(testClient, mockUserData);
  });

  afterAll(async () => {
    await seedTables(testClient, { users: true });
    await testClient.end();

    vi.resetAllMocks();
  });

  it('should return registered users names only when the user is not registered', async () => {
    const payload: FetchDataHandlerRequestType = { userId: undefined };

    const response = await handler(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    );

    expect(response).toBeDefined();
    const responseData = await response!.json();

    const expectedResult: Partial<FetchDataHandlerResponseType> = {
      registeredUsers: ['User 1', 'User 2', 'User 3'],
    };

    expect(responseData).toMatchObject(expectedResult);
    expect(responseData).not.toHaveProperty('userData');
    expect(responseData).not.toHaveProperty('verseData');
  });

  it('should return registered users names and user data when the user is registered', async () => {
    const mockUserId = await registerMockUser('Test User');

    const payload: FetchDataHandlerRequestType = { userId: mockUserId };

    const response = await handler(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    );

    expect(response).toBeDefined();
    const responseData = (await response!.json()) as FetchDataHandlerResponseType;

    const exectedResult: Partial<FetchDataHandlerResponseType> = {
      registeredUsers: ['User 1', 'User 2', 'User 3'],
      userData: { userId: mockUserId, name: 'Test User' },
    };

    expect(responseData).toMatchObject(exectedResult);
    expect(responseData.registeredUsers).not.toContain('Test User');
    expect(responseData).not.toHaveProperty('verseData');
  });

  it('should return registered users names, user and verse data when the user is registered and a poem has been generated', async () => {
    const mockUserId = await registerMockUser('Test User');

    await generateMockPoem(mockUserData[0].userId);

    const payload: FetchDataHandlerRequestType = { userId: mockUserId };

    const response = await handler(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    );

    expect(response).toBeDefined();
    const responseData = await response!.json();

    const expectedResult: FetchDataHandlerResponseType = {
      registeredUsers: ['User 1', 'User 2', 'User 3'],
      userData: { userId: mockUserId, name: 'Test User' },
      verseData: {
        poemId: expect.any(String),
        ordinal: expect.any(Number),
        verse: expect.any(String),
      },
    };

    expect(responseData).toMatchObject(expectedResult);
  });

  it('should return a validation error when input is invalid', async () => {
    const payload = { userId: 'invalid-uuid' };

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

const generateMockPoem = async (userId: string): Promise<void> => {
  await generatePoemHandler(
    new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }),
  );
};
