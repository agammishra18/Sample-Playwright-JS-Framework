import { test, expect } from '../../fixtures/base.fixture';

test.describe('Inventory', () => {
  test('shows the expected catalog size', async ({ loggedInPage }) => {
    expect(await loggedInPage.isLoaded()).toBe(true);
    expect(await loggedInPage.getItemCount()).toBeGreaterThan(0);
  });

  test('adding an item increments the cart badge', async ({ loggedInPage }) => {
    await loggedInPage.addItemToCart('Sauce Labs Backpack');

    expect(await loggedInPage.getCartCount()).toBe(1);
  });
});
