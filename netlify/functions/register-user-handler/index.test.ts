import handler from './index.mts';

describe('register-user-handler', () => {
  it('should return user data when input is valid', async () => {
    const payload = { name: '  John Doe  ' };

    const response = await handler(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    );

    expect(response!.status).toBe(200);

    expect(await response!.json()).toEqual({
      userData: {
        name: 'John Doe',
        userId: expect.any(String),
      },
    });
  });

  it('should return a validation error when input is invalid', async () => {
    const payload = { name: '12' };

    const response = await handler(
      new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    );

    expect(response!.status).toBe(400);

    await expect(response!.json()).resolves.toMatchObject({
      error: expect.stringContaining('Name must be at least 3 characters long'),
    });
  });
});
