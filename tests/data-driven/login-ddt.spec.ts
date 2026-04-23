import { test, expect } from '../../fixtures/base.fixture';
import loginData from '../../fixtures/test-data/login-data.json';

interface LoginRow {
  case: string;
  username: string;
  password: string;
  expectSuccess: boolean;
  expectedError?: string;
}

test.describe('Data-Driven: Login', () => {
  for (const row of loginData as LoginRow[]) {
    test(`${row.case}`, async ({ loginPage, inventoryPage }) => {
      await loginPage.open();
      await loginPage.login(row.username, row.password);

      if (row.expectSuccess) {
        expect(await inventoryPage.isLoaded()).toBe(true);
      } else {
        expect(await loginPage.hasError()).toBe(true);
        if (row.expectedError) {
          expect(await loginPage.getErrorMessage()).toBe(row.expectedError);
        }
      }
    });
  }
});
