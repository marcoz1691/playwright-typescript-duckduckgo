import { test, expect } from '../../src/fixtures';
import { INSTANT_ANSWER } from '../../src/data/testData';
import { extractIconUrls } from '../../src/utils/iconExtractor';

test.describe('Test Case 3 - Instant Answer API (JSON)', () => {
  test(`prints non-null Icon URLs for "${INSTANT_ANSWER.query}"`, async ({ ddgApi }) => {
    const { status, body } = await ddgApi.getInstantAnswer(INSTANT_ANSWER.query);

    // The API currently answers 202 Accepted (not 200) with a full body, so accept any 2xx.
    expect(status, 'expected a 2xx response').toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(300);
    expect(Array.isArray(body.RelatedTopics), 'RelatedTopics should be an array').toBe(true);

    const icons = extractIconUrls(body.RelatedTopics, INSTANT_ANSWER.iconHost);

    console.log(`Found ${icons.length} topics with a non-null Icon URL:`);
    for (const icon of icons) {
      console.log(`- ${icon.relativeUrl}  (${icon.absoluteUrl})  <- ${icon.topic}`);
    }
    await test.info().attach('icon-urls.json', {
      body: JSON.stringify(icons, null, 2),
      contentType: 'application/json',
    });

    // The task only asks to print them; this guard catches a silent contract change
    // (e.g. Icon moved/renamed) that would otherwise make the test pass while printing nothing.
    // IMPROVEMENT: confirm with the team whether "zero icons" should be a failure or just a warning.
    expect(icons.length, 'expected at least one topic with an Icon URL').toBeGreaterThan(0);
    for (const icon of icons) {
      expect(icon.relativeUrl).toMatch(/^\/i\/\S+$/);
    }
  });
});
