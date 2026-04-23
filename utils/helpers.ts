import { Page } from '@playwright/test';

export class Helpers {
  static async takeScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({
      path: `./test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  static async waitForNetworkIdle(page: Page, timeout = 5_000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static randomString(length: number): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static uniqueName(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
