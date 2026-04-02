import { Client } from 'pg';

import { createTestClient, truncateTables } from '../test-utils/db';
import type { FetchDataHandlerResponseType } from '../../src/types/fetch-data-handler.types';
import type { GeneratePoemHandlerResponseType } from '../../src/types/generate-poem-handler.types';
import type { RegisterUserHandlerResponseType } from '../../src/types/register-user-handler.types';

/**
 * MOCK_LLM toggle (currently unused — real Gemini API is called).
 *
 * To enable mocking when set to true, switch from HTTP fetch calls to direct
 * handler imports and add:
 *   vi.spyOn(GoogleGenerativeAI.prototype, 'getGenerativeModel').mockReturnValue(mockModel)
 * See netlify/functions/generate-poem-handler/index.test.ts for the full pattern.
 */
const MOCK_LLM = false;

if (MOCK_LLM) {
  // TODO: configure vi.spyOn mock for GoogleGenerativeAI here
}

const BASE_URL = 'http://localhost:8888/.netlify/functions';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

type Role = 'user' | 'admin';

interface TestUser {
  name: string;
  role: Role;
  userId?: string;
  /** poemId seen in fetch-data response after the first poem is generated (step d) */
  poemIdAfterFirstGen?: string;
  /** poemId seen in fetch-data response after the second poem is generated (step h) */
  poemIdAfterSecondGen?: string;
}

/**
 * Initial users — adjust count and roles here to scale the test.
 * At least one user must have role 'admin' (can generate poems, reset data).
 * All others with role 'user' can register and fetch data.
 */
const INITIAL_USERS: TestUser[] = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Carol', role: 'user' },
  { name: 'Dave', role: 'user' },
  { name: 'Eve', role: 'user' },
];

const ADDITIONAL_USER: TestUser = { name: 'Frank', role: 'user' };

// --- HTTP helpers ---

async function openApp(userId?: string): Promise<Response> {
  return fetch(`${BASE_URL}/fetch-data-handler`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
}

async function registerUser(user: TestUser): Promise<Response> {
  return fetch(`${BASE_URL}/register-user-handler`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: user.name }),
  });
}

async function generatePoem(userId: string): Promise<Response> {
  return fetch(`${BASE_URL}/generate-poem-handler`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
}

async function resetData(userId: string): Promise<Response> {
  return fetch(`${BASE_URL}/reset-handler`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
}

// --- Logging ---

function logResult(step: string, label: string, status: number, expected = 200): void {
  const pass = status === expected;
  const symbol = pass ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
  console.log(`  ${symbol} ${step} — ${label} → HTTP ${status}`);
}

function logAssertion(label: string, pass: boolean): void {
  const symbol = pass ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
  console.log(`  ${symbol} ${label}`);
}

async function logErrorBody(response: Response): Promise<void> {
  if (response.status !== 200) {
    const body = await response.clone().text();
    console.log(`${RED}    Response body: ${body}${RESET}`);
  }
}

// --- Test suite ---

describe('Integration: multi-user flow', () => {
  // Shallow copies so userId mutations don't affect INITIAL_USERS / ADDITIONAL_USER constants
  const allUsers: TestUser[] = INITIAL_USERS.map((u) => ({ ...u }));
  const additionalUser: TestUser = { ...ADDITIONAL_USER };
  const admin = allUsers.find((u) => u.role === 'admin')!;

  /** poemId returned directly by the first generate-poem call (step c) */
  let firstPoemId: string;
  /** poemId returned directly by the second generate-poem call (step g) */
  let secondPoemId: string;

  let testClient: Client;

  beforeAll(async () => {
    testClient = await createTestClient();
    await testClient.connect();
    // Start from a clean slate regardless of previous test run state
    await truncateTables(testClient);
  });

  afterAll(async () => {
    // Safety net: clean up if step i (reset) was not reached due to a failure
    await truncateTables(testClient);
    await testClient.end();
  });

  it('a. 5 users open the app', async () => {
    for (const user of allUsers) {
      const response = await openApp();
      logResult('a', `${user.name} opens app`, response.status);
      await logErrorBody(response);
      expect(response.status).toBe(200);
    }
  });

  it('b. 5 users register', async () => {
    for (const user of allUsers) {
      const response = await registerUser(user);
      logResult('b', `${user.name} registers`, response.status);
      await logErrorBody(response);
      expect(response.status).toBe(200);
      const data = (await response.json()) as RegisterUserHandlerResponseType;
      user.userId = data.userData.userId;
    }
  });

  it('c. admin generates a poem', async () => {
    const response = await generatePoem(admin.userId!);
    logResult('c', `${admin.name} generates poem`, response.status);
    await logErrorBody(response);
    expect(response.status).toBe(200);
    const data = (await response.json()) as GeneratePoemHandlerResponseType;
    firstPoemId = data.verseData.poemId;
  });

  it('d. 5 users fetch data', async () => {
    for (const user of allUsers) {
      const response = await openApp(user.userId);
      logResult('d', `${user.name} fetches data`, response.status);
      await logErrorBody(response);
      expect(response.status).toBe(200);
      const data = (await response.json()) as FetchDataHandlerResponseType;
      if (data.verseData) {
        user.poemIdAfterFirstGen = data.verseData.poemId;
      }
    }
  });

  it('e. additional user opens the app', async () => {
    const response = await openApp();
    logResult('e', `${additionalUser.name} opens app`, response.status);
    await logErrorBody(response);
    expect(response.status).toBe(200);
  });

  it('f. additional user registers', async () => {
    const response = await registerUser(additionalUser);
    logResult('f', `${additionalUser.name} registers`, response.status);
    await logErrorBody(response);
    expect(response.status).toBe(200);
    const data = (await response.json()) as RegisterUserHandlerResponseType;
    additionalUser.userId = data.userData.userId;
    allUsers.push(additionalUser);
  });

  it('g. admin generates a new poem', async () => {
    const response = await generatePoem(admin.userId!);
    logResult('g', `${admin.name} generates new poem`, response.status);
    await logErrorBody(response);
    expect(response.status).toBe(200);
    const data = (await response.json()) as GeneratePoemHandlerResponseType;
    secondPoemId = data.verseData.poemId;
  });

  it('h. 6 users fetch data — poemIds must reflect new poem', async () => {
    for (const user of allUsers) {
      const response = await openApp(user.userId);
      logResult('h', `${user.name} fetches data`, response.status);
      await logErrorBody(response);
      expect(response.status).toBe(200);
      const data = (await response.json()) as FetchDataHandlerResponseType;
      if (data.verseData) {
        user.poemIdAfterSecondGen = data.verseData.poemId;
      }
    }

    // The two generate calls must have produced distinct poems
    const poemsAreDistinct = firstPoemId !== secondPoemId;
    logAssertion(
      `generate responses: firstPoemId (${firstPoemId}) ≠ secondPoemId (${secondPoemId})`,
      poemsAreDistinct,
    );
    expect(firstPoemId).not.toBe(secondPoemId);

    // Every user present during the first poem generation must have received a verse in step h
    const usersFromFirstGen = allUsers.filter((u) => u.poemIdAfterFirstGen);
    for (const user of usersFromFirstGen) {
      expect(
        user.poemIdAfterSecondGen,
        `${user.name} should have received a verse after the second poem generation`,
      ).toBeDefined();
    }

    // Every such user must now see the new poem, not the old one
    for (const user of usersFromFirstGen) {
      const updated = user.poemIdAfterFirstGen !== user.poemIdAfterSecondGen;
      logAssertion(
        `${user.name}: poemId updated after regeneration (${user.poemIdAfterFirstGen} → ${user.poemIdAfterSecondGen})`,
        updated,
      );
      expect(user.poemIdAfterFirstGen).not.toBe(user.poemIdAfterSecondGen);
    }
  });

  it('i. admin resets all data', async () => {
    const response = await resetData(admin.userId!);
    logResult('i', `${admin.name} resets all data`, response.status);
    await logErrorBody(response);
    expect(response.status).toBe(200);
  });
}, 120_000); // 2 minutes timeout to accommodate LLM response time and multiple sequential steps
