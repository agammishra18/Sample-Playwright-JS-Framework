import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { getEnvironmentConfig } from './config/environment.config';

const env = getEnvironmentConfig();

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results', detail: true, suiteTitle: true }],
  ],

  use: {
    baseURL: env.webBaseUrl,
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.apiBaseUrl },
    },
  ],
});
