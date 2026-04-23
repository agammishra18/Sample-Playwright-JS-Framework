import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { ApiClient } from '../utils/api.helper';
import { getEnvironmentConfig } from '../config/environment.config';

/**
 * Extended Playwright test with:
 *   - page-object fixtures (ready-to-use POMs)
 *   - `loggedInPage` — an InventoryPage fixture that starts already authenticated
 *   - `apiClient`   — a ready-to-use ApiClient
 *
 * Usage:
 *   import { test, expect } from '../../fixtures/base.fixture';
 */
type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  loggedInPage: InventoryPage;
  apiClient: ApiClient;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  loggedInPage: async ({ page }, use) => {
    const creds = getEnvironmentConfig().uiCredentials;
    const login = new LoginPage(page);
    await login.open();
    await login.login(creds.username, creds.password);
    await use(new InventoryPage(page));
  },

  apiClient: async ({}, use) => {
    const client = await ApiClient.create();
    await use(client);
    await client.dispose();
  },
});

export { expect };
