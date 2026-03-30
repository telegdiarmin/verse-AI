import {
  GenerativeModel,
  GoogleGenerativeAI,
  type GenerateContentResult,
} from '@google/generative-ai';
import { createTestClient, seedTables, truncateTables } from '../../test-utils/db';
import type { UserDataType } from '../../../src/types/user-data.types';
import type { DeepPartial } from '../../test-utils/types';
import { generateMockPoem, insertMockUsers } from '../../test-utils/helpers';
import type { ResetHandlerRequestType } from '../../../src/types/reset-handler.types';
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
  { userId: '8cd82c48-ddd0-4e13-bdf8-fd5311ee2881', name: 'User 4' },
];

describe('resetHandler', async () => {
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

  it('should reset all data for an existing user', async () => {
    const mockGeneratingUserId = mockUserData[0].userId;

    await generateMockPoem(mockGeneratingUserId);

    const payload: ResetHandlerRequestType = {
      userId: mockGeneratingUserId,
    };

    const response = await handler(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    );

    expect(response!.status).toBe(200);

    const versesResponse = await testClient.query(/* sql */ `
      SELECT
        *
      FROM
        verses;
    `);

    const usersVersesResponse = await testClient.query(/* sql */ `
      SELECT
        *
      FROM
        users_verses;
    `);

    const usersResponse = await testClient.query(/* sql */ `
      SELECT
        *
      FROM
        users;
    `);

    expect(versesResponse.rows).toEqual([]);
    expect(usersVersesResponse.rows).toEqual([]);
    expect(usersResponse.rows).toEqual([]);
  });

  it('should return 401 if the user is not registered', async () => {
    const payload: ResetHandlerRequestType = {
      userId: '9d87783e-14ed-4476-8a4d-9f9183b332dd', // Non-existent user ID
    };

    const response = await handler(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    );

    expect(response!.status).toBe(401);
  });

  it('should return a validation error when input is invalid', async () => {
    const payload: ResetHandlerRequestType = {
      userId: 'invalid-uuid',
    };
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
