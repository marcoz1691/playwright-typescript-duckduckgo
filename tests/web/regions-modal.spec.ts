import { test, expect } from '../../src/fixtures';
import { REGIONS } from '../../src/data/testData';

test.describe('Test Case 2 - All regions modal', () => {
  // `resultsPage` fixture performs the search itself, so this test does not depend on Test Case 1.
  test(`region list has more than ${REGIONS.minExpectedCount} entries`, async ({ resultsPage }) => {
    const regionsModal = await resultsPage.openRegionsModal();

    const regionNames = await regionsModal.getRegionNames();
    const total = regionNames.length;
    test.info().annotations.push({ type: 'regions-count', description: String(total) });
    console.log(`Regions found: ${total}`);

    expect(total).toBeGreaterThan(REGIONS.minExpectedCount);
  });
});
