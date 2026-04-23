import { test, expect } from '../../fixtures/base.fixture';
import { DataFactory } from '../../utils/data.factory';

test.describe('Checkout', () => {
  test('complete an order end-to-end', async ({ loggedInPage, cartPage, checkoutPage }) => {
    const user = DataFactory.user();
    const address = DataFactory.address();

    await loggedInPage.addItemToCart('Sauce Labs Backpack');
    await loggedInPage.addItemToCart('Sauce Labs Bike Light');
    await loggedInPage.openCart();

    expect(await cartPage.getItemCount()).toBe(2);
    expect(await cartPage.hasItem('Sauce Labs Backpack')).toBe(true);

    await cartPage.checkout();
    await checkoutPage.fillShippingInfo({
      firstName: user.firstName,
      lastName: user.lastName,
      postalCode: address.zip,
    });
    await checkoutPage.completeOrder();

    expect(await checkoutPage.getCompletionMessage()).toMatch(/thank you/i);
  });
});
