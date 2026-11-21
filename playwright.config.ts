import { defineConfig, devices } from '@playwright/test';

const WEB_BASE_URL = process.env.WEB_BASE_URL ?? 'https://start.duckduckgo.com';
const API_BASE_URL = process.env.API_BASE_URL ?? 'https://api.duckduckgo.com';

// DuckDuckGo serves a 418 bot page to the default "chrome-headless-shell" and to any
// user agent containing "HeadlessChrome". Full Chromium (new headless) + a regular desktop UA works.
// IMPROVEMENT: derive the UA from the installed browser version instead of hardcoding it.
const DESKTOP_CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'web',
      testDir: './tests/web',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium',
        baseURL: WEB_BASE_URL,
        userAgent: DESKTOP_CHROME_UA,
        locale: 'en-US',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
    // IMPROVEMENT: add firefox/webkit projects once the anti-bot behaviour is validated for them.
  ],
});
