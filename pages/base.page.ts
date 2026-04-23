import { Page, Locator } from '@playwright/test';
import { getEnvironmentConfig } from '../config/environment.config';
import { Logger } from '../utils/logger';

/**
 * Shared superclass for all page objects.
 * Wraps Playwright's low-level API with logged, fault-tolerant helpers.
 */
export class BasePage {
  readonly page: Page;
  readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = getEnvironmentConfig().webBaseUrl;
  }

  async goto(path = '/'): Promise<void> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    Logger.step(`Navigate to ${url}`);
    await this.page.goto(url);
  }

  async waitForElement(selector: string, timeout = 10_000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  protected async click(selector: string): Promise<void> {
    try {
      await this.waitForElement(selector);
      await this.page.click(selector);
    } catch (error) {
      Logger.error(`Failed to click "${selector}"`, error as Error);
      throw error;
    }
  }

  protected async fill(selector: string, value: string): Promise<void> {
    try {
      await this.waitForElement(selector);
      await this.page.fill(selector, value);
    } catch (error) {
      Logger.error(`Failed to fill "${selector}"`, error as Error);
      throw error;
    }
  }

  protected async getText(selector: string): Promise<string> {
    try {
      await this.waitForElement(selector);
      return await this.page.innerText(selector);
    } catch (error) {
      Logger.error(`Failed to read text from "${selector}"`, error as Error);
      throw error;
    }
  }

  protected async isVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 5_000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll a container (or the viewport) until `locator` is visible or maxScrolls is reached.
   * Handy for lazy-loaded lists.
   */
  async scrollUntilVisible(
    locator: Locator,
    scrollContainerSelector?: string,
    maxScrolls = 10,
  ): Promise<void> {
    for (let i = 0; i < maxScrolls; i++) {
      if (await locator.isVisible().catch(() => false)) return;

      if (scrollContainerSelector) {
        await this.page.locator(scrollContainerSelector).evaluate((el) => el.scrollBy(0, 400));
      } else {
        await this.page.mouse.wheel(0, 400);
      }

      await this.page.waitForTimeout(300);
    }

    await locator.waitFor({ state: 'visible', timeout: 5_000 });
  }
}
