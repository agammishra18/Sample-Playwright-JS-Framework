import { test, expect } from '../../fixtures/base.fixture';
import userPayloads from '../../fixtures/test-data/users.json';

test.describe('API: Users (reqres.in)', () => {
  test('GET /users returns a paginated list', async ({ apiClient }) => {
    const res = await apiClient.get('/users?page=2');

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toMatchObject({
      id: expect.any(Number),
      email: expect.any(String),
      first_name: expect.any(String),
    });
  });

  test('POST /users creates a user', async ({ apiClient }) => {
    const res = await apiClient.post('/users', userPayloads.createUser);

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      name: userPayloads.createUser.name,
      job: userPayloads.createUser.job,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  test('PUT /users/:id updates a user', async ({ apiClient }) => {
    const res = await apiClient.put('/users/2', userPayloads.updateUser);

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      name: userPayloads.updateUser.name,
      job: userPayloads.updateUser.job,
      updatedAt: expect.any(String),
    });
  });

  test('DELETE /users/:id returns 204', async ({ apiClient }) => {
    const res = await apiClient.delete('/users/2');
    expect(res.status()).toBe(204);
  });
});
