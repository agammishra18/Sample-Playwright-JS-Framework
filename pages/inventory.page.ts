import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { Logger } from '../utils/logger';

export class InventoryPage extends BasePage {
  private readonly inventoryContainer = '[data-test="inventory-container"]';
  private readonly inventoryItem = '[data-test="inventory-item"]';
  private readonly cartBadge = '[data-test="shopping-cart-badge"]';
  private readonly cartLink = '[data-test="shopping-cart-link"]';

  constructor(page: Page) {
    super(page);
  }

  async isLoaded(): Promise<boolean> {
    return this.isVisible(this.inventoryContainer);
  }

  async getItemCount(): Promise<number> {
    await this.waitForElement(this.inventoryItem);
    return this.page.locator(this.inventoryItem).count();
  }

  async addItemToCart(itemName: string): Promise<void> {
    Logger.step(`Add "${itemName}" to cart`);
    const locator = this.page
      .locator(this.inventoryItem)
      .filter({ hasText: itemName })
      .getByRole('button', { name: /add to cart/i });
    await locator.click();
  }

  async getCartCount(): Promise<number> {
    if (!(await this.isVisible(this.cartBadge))) return 0;
    const text = await this.getText(this.cartBadge);
    return Number.parseInt(text, 10);
  }

  async openCart(): Promise<void> {
    await this.click(this.cartLink);
  }
}
