import type { GeneratePoemHandlerRequestType } from '../../../src/types/generate-poem-handler.types';
import type { RegisterUserHandlerResponseType } from '../../../src/types/register-user-handler.types';
import type { UserDataType } from '../../../src/types/user-data.types';
import {
  createTestClient,
  getUserVerseData,
  insertMockUsers,
  seedTables,
  truncateTables,
} from '../../test-utils/db';
import registerUserHandler from '../register-user-handler/index.mts';
import handler from './index.mts';

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

// This test suite includes live integration tests for Gemini API
// Skipped by default to avoid unnecessary API calls during regular test runs
// Don't forget to reset to "skip" after running it
describe.skip('generatePoemHandler with live API', async () => {
  const testClient = await createTestClient();

  let mockGeneratingUserId: UserDataType['userId'];
  const mockUserData: UserDataType[] = [
    { userId: '00000000-0000-0000-0000-000000000001', name: 'User 1' },
    { userId: '00000000-0000-0000-0000-000000000002', name: 'User 2' },
    { userId: '00000000-0000-0000-0000-000000000003', name: 'User 3' },
    { userId: '00000000-0000-0000-0000-000000000004', name: 'User 4' },
    { userId: '00000000-0000-0000-0000-000000000005', name: 'User 5' },
  ];

  beforeAll(async () => {
    await testClient.connect();
    await truncateTables(testClient, { users: true });

    await insertMockUsers(testClient, mockUserData);
    mockGeneratingUserId = await registerMockUser('Test User');
  });

  afterAll(async () => {
    await seedTables(testClient, { users: true });
    await testClient.end();

    vi.resetAllMocks();
  });

  it('should generate a poem and store verses linked to users', async () => {
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

    expect(response!.status).toBe(200);

    const combinedMockUserIds = [...mockUserData.map((user) => user.userId), mockGeneratingUserId];
    const userVerseDataResult = await getUserVerseData(testClient, combinedMockUserIds);

    console.log('User verse data from DB:', userVerseDataResult);
  });
}, 30000); // Increased timeout for live API calls

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
