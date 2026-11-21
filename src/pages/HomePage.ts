import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ResultsPage } from './ResultsPage';

export class HomePage extends BasePage {
  // DDG A/B tests the home page: the box is sometimes an <input> and sometimes a <textarea role=combobox>.
  // Both share this accessible label, so getByLabel survives both variants.
  readonly searchBox: Locator;

  constructor(page: Page) {
    super(page);
    this.searchBox = page.getByLabel('Search with DuckDuckGo');
  }

  async open(): Promise<this> {
    await this.page.goto('/');
    return this;
  }

  async search(term: string): Promise<ResultsPage> {
    await this.searchBox.fill(term);
    await this.searchBox.press('Enter');
    const resultsPage = new ResultsPage(this.page);
    await resultsPage.waitForResults();
    return resultsPage;
  }
}
