import { expect, type Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  /**
   * DuckDuckGo redirects suspected bots to a static 418 page. Failing fast here gives a clear
   * reason instead of a confusing "locator not found" timeout further down the test.
   */
  async assertNotBlockedByBotProtection(): Promise<void> {
    expect(this.page.url(), 'DuckDuckGo served its bot-protection page (418)').not.toContain(
      'static-pages/home-error/418',
    );
  }
}
