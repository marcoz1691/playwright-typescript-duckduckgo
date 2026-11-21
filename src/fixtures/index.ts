import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ResultsPage } from '../pages/ResultsPage';
import { DuckDuckGoApiClient } from '../api/DuckDuckGoApiClient';
import { SEARCH } from '../data/testData';

type Fixtures = {
  homePage: HomePage;
  /** Results page already loaded for SEARCH.term. */
  resultsPage: ResultsPage;
  ddgApi: DuckDuckGoApiClient;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await use(homePage);
  },

  resultsPage: async ({ homePage }, use) => {
    await use(await homePage.search(SEARCH.term));
  },

  ddgApi: async ({ request }, use) => {
    await use(new DuckDuckGoApiClient(request));
  },
});

export { expect } from '@playwright/test';
