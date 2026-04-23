import { test, expect } from '../../fixtures/base.fixture';
import { getEnvironmentConfig } from '../../config/environment.config';

test.describe('Login', () => {
  test('valid credentials land on the inventory page', async ({ loginPage, inventoryPage }) => {
    const { username, password } = getEnvironmentConfig().uiCredentials;

    await loginPage.open();
    await loginPage.login(username, password);

    expect(await inventoryPage.isLoaded()).toBe(true);
  });

  test('invalid credentials surface an error', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('standard_user', 'wrong_password');

    expect(await loginPage.hasError()).toBe(true);
    expect(await loginPage.getErrorMessage()).toContain('do not match');
  });
});
