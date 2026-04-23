import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  private readonly cartItem = '[data-test="inventory-item"]';
  private readonly checkoutButton = '[data-test="checkout"]';
  private readonly continueShoppingButton = '[data-test="continue-shopping"]';

  constructor(page: Page) {
    super(page);
  }

  async getItemCount(): Promise<number> {
    return this.page.locator(this.cartItem).count();
  }

  async hasItem(itemName: string): Promise<boolean> {
    return this.page.locator(this.cartItem).filter({ hasText: itemName }).count().then((c) => c > 0);
  }

  async checkout(): Promise<void> {
    await this.click(this.checkoutButton);
  }

  async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton);
  }
}
