import { expect, type Locator, type Page } from '@playwright/test';

/**
 * The "All regions" popover on the results page. It is a react-aria menu
 * (role="menu", aria-label="Suggestions") whose entries are role="menuitemradio".
 */
export class RegionsModal {
  readonly root: Locator;
  readonly regions: Locator;

  constructor(private readonly page: Page) {
    this.root = page.getByRole('menu', { name: 'Suggestions' });
    this.regions = this.root.getByRole('menuitemradio');
  }

  async waitForOpen(): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.regions.first()).toBeVisible();
  }

  async getRegionNames(): Promise<string[]> {
    return (await this.regions.allInnerTexts()).map((name) => name.trim());
  }

  async getRegionCount(): Promise<number> {
    return this.regions.count();
  }

  async selectRegion(name: string): Promise<void> {
    await this.root.getByRole('menuitemradio', { name, exact: true }).click();
  }

  async close(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.root).toBeHidden();
  }
}
