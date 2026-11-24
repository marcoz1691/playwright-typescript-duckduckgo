import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { RegionsModal } from '../components/RegionsModal';

export class ResultsPage extends BasePage {
  // data-testid is the most stable hook DDG exposes for results; class names are hashed per build.
  readonly results: Locator;
  readonly resultTitles: Locator;
  readonly regionFilterButton: Locator;

  constructor(page: Page) {
    super(page);
    this.results = page.getByTestId('result');
    this.resultTitles = this.results.getByTestId('result-title-a');
    this.regionFilterButton = page.getByRole('button', { name: 'All regions' });
  }

  async waitForResults(): Promise<void> {
    await this.page.waitForURL(/[?&]q=|home-error\/418/);
    this.assertNotBlockedByBotProtection();
    await expect(this.results.first()).toBeVisible();
  }

  // IMPROVEMENT: only the first page (~10 organic results) is covered; click "More results"
  // to validate deeper pages, and decide explicitly how ads / news / video modules should be treated.
  async getResultTitles(): Promise<string[]> {
    return (await this.resultTitles.allInnerTexts()).map((title) => title.trim());
  }

  async openRegionsModal(): Promise<RegionsModal> {
    await this.regionFilterButton.click();
    const modal = new RegionsModal(this.page);
    await modal.waitForOpen();
    return modal;
  }
}
