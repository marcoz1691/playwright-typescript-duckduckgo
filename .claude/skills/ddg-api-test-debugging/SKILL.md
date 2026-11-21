---
name: ddg-api-test-debugging
description: Update or debug the DuckDuckGo Instant Answer API test (Test Case 3). Use when tests/api/instant-answer.spec.ts fails, when the API response shape changes, when Icon URLs are missing or wrong, or when asked to add a new API test for api.duckduckgo.com.
---

# DuckDuckGo Instant Answer API test - update & debug

## Files involved
| File | Responsibility |
|------|----------------|
| `tests/api/instant-answer.spec.ts` | Test Case 3: assertions + printing Icon URLs |
| `src/api/DuckDuckGoApiClient.ts` | HTTP call and JSON parsing (Playwright `request` fixture) |
| `src/api/types/instantAnswer.ts` | TypeScript model of the response (only the fields we use) |
| `src/utils/iconExtractor.ts` | Pure function: flattens `RelatedTopics` and filters empty icons |
| `src/data/testData.ts` | `INSTANT_ANSWER.query` and `iconHost` |
| `playwright.config.ts` | `api` project, `baseURL` (`API_BASE_URL` env var) |

## Debug workflow
1. Reproduce in isolation:
   ```bash
   npx playwright test --project=api --reporter=list
   ```
2. Look at the raw response outside the framework to separate API problems from test problems:
   ```bash
   curl -s -i "https://api.duckduckgo.com/?q=marvel&format=json" | head -20
   curl -s "https://api.duckduckgo.com/?q=marvel&format=json" | python3 -m json.tool | grep -n -A3 '"Icon"'
   ```
3. Open the HTML report (`npm run report`); the test attaches `icon-urls.json` with what was extracted.
4. Classify the failure with the checklist below, then fix the **smallest** layer that is wrong
   (types -> extractor -> client -> spec). Keep the spec free of parsing logic.

## Known pitfalls checklist
- **Status 202, not 200**: the API returns `202 Accepted` with a full body. The spec accepts any 2xx; do not change it to `toBe(200)`.
- **Content-Type `application/x-javascript`**: the client parses `response.text()` with `JSON.parse`. If it throws "did not return JSON", print the first 200 chars: it is usually an HTML error/rate-limit page.
- **Empty vs null**: "no icon" is usually `"URL": ""`, sometimes `null` or a missing `Icon`. `extractIconUrls` treats all three as missing.
- **Nested groups**: `RelatedTopics` mixes topics and groups `{ Name, Topics: [...] }`. `flattenTopics` recurses; if DDG adds another nesting key, update `isGroup` + `TopicGroup`.
- **Relative URLs**: icons come as `/i/xxxx.jpg`; absolute = `https://duckduckgo.com` + path (`new URL(relative, host)`).
- **Zero icons found**: the spec fails on purpose (guards against silent contract changes). Check whether the query returns a `Type: "D"` disambiguation; other queries may legitimately have no icons.
- **Rate limiting / network**: intermittent non-JSON or 4xx/5xx. Re-run once; if persistent, add retry/backoff in the client (not in the spec).

## Updating when the contract changes
1. Capture a fresh sample (`curl ... > /tmp/sample.json`) and diff the `Icon`/`RelatedTopics` structure.
2. Update `src/api/types/instantAnswer.ts` first and run `npm run typecheck`; TS errors point at every place to adapt.
3. Adjust `src/utils/iconExtractor.ts` (keep it pure, no Playwright imports).
4. Re-run `npm run test:api` and confirm the printed list matches the curl output.

## Adding a new API test (template)
```ts
import { test, expect } from '../../src/fixtures';
import { extractIconUrls } from '../../src/utils/iconExtractor';

test('instant answer for "<query>"', async ({ ddgApi }) => {
  const { status, body } = await ddgApi.getInstantAnswer('<query>');
  expect(status).toBeGreaterThanOrEqual(200);
  expect(status).toBeLessThan(300);
  expect(body.Heading).not.toBe('');
  console.log(extractIconUrls(body.RelatedTopics, 'https://duckduckgo.com'));
});
```
Put new query values in `src/data/testData.ts`, not inline, if they are reused.
