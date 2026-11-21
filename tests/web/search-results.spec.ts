import { test, expect } from '../../src/fixtures';
import { SEARCH } from '../../src/data/testData';

test.describe('Test Case 1 - Search results', () => {
  test(`every result title contains "${SEARCH.term}"`, async ({ homePage }) => {
    const resultsPage = await homePage.search(SEARCH.term);

    const titles = await resultsPage.getResultTitles();
    expect(titles.length, 'search should return at least one result').toBeGreaterThan(0);

    // Soft assertions: one failing title doesn't hide the rest, the report lists all offenders.
    // IMPROVEMENT: the requirement says "the word android"; this is a case-insensitive substring
    // check (so "Android's" passes). A whole-word regex would be stricter if the business wants it.
    for (const [index, title] of titles.entries()) {
      expect.soft(title.toLowerCase(), `result #${index + 1}: "${title}"`).toContain(SEARCH.term.toLowerCase());
    }
  });
});
