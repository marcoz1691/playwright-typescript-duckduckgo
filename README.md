# DuckDuckGo QA Assessment - Playwright + TypeScript

Web (UI) and API automation for the three test cases in the assessment, built with
[Playwright Test](https://playwright.dev) and TypeScript using the Page Object Model.

| # | Test case | Spec |
|---|-----------|------|
| 1 | Search `android` on start.duckduckgo.com, every result title contains `android` | `tests/web/search-results.spec.ts` |
| 2 | From the results page open **All regions**, count the entries, assert `> 10` | `tests/web/regions-modal.spec.ts` |
| 3 | GET `https://api.duckduckgo.com/?q=marvel&format=json`, print every non-null Icon URL | `tests/api/instant-answer.spec.ts` |

## Setup

Requirements: Node.js 18+.

```bash
npm ci
npx playwright install chromium
```

## Running

```bash
npm test              # all tests (web + api)
npm run test:web      # Test Cases 1 and 2
npm run test:api      # Test Case 3
npm run test:headed   # web tests with a visible browser
npm run test:ui       # Playwright UI mode (watch, time-travel, pick locator)
npm run codegen       # record actions / discover locators on start.duckduckgo.com
npm run report        # open the last HTML report
npm run typecheck     # tsc --noEmit
```

On failure, a trace, screenshot and video are kept in `test-results/` (`npx playwright show-trace <trace.zip>`).

## Project structure

```
playwright.config.ts          projects: web (Chromium) and api (no browser)
src/
  pages/                      BasePage, HomePage, ResultsPage (Page Objects)
  components/RegionsModal.ts  component object for the "All regions" popover
  api/                        DuckDuckGoApiClient + response types
  utils/iconExtractor.ts      pure function: flatten RelatedTopics, keep non-empty icons
  fixtures/index.ts           custom fixtures: homePage, resultsPage, ddgApi
  data/testData.ts            test inputs (search term, thresholds, API query)
tests/
  web/                        UI specs
  api/                        API specs
.cursor/skills/ddg-api-test-debugging/SKILL.md   agent skill (also in .claude/skills)
```

## Design decisions

- **One framework for UI and API.** Playwright's `request` fixture covers the API case without extra
  libraries, so both suites share the runner, config, fixtures and HTML report.
- **Page Object Model + custom fixtures.** Specs only express intent (`homePage.search(...)`,
  `resultsPage.openRegionsModal()`); locators and waits live in the page objects. Fixtures build the
  objects, so specs never instantiate pages or repeat setup.
- **Locator strategy** (most to least preferred): accessible role/label (`getByRole`, `getByLabel`),
  then `data-testid`, then CSS. DuckDuckGo class names are hashed per build, so they are never used.
  - Search box: `getByLabel('Search with DuckDuckGo')` - DDG A/B tests an `<input>` and a
    `<textarea role="combobox">`; both share this label.
  - Results: `getByTestId('result')` / `getByTestId('result-title-a')`.
  - Regions: `getByRole('button', { name: 'All regions' })`, then `getByRole('menu', { name: 'Suggestions' })`
    and its `menuitemradio` items.
- **Web-first assertions, no fixed sleeps.** `expect(locator).toBeVisible()` auto-waits.
- **Independent tests.** Test Case 2 gets its own results page via the `resultsPage` fixture instead of
  relying on Test Case 1, so tests run in parallel and in any order.
- **Soft assertions in Test Case 1** so the report lists every title that fails, not just the first.
- **API specifics.** The endpoint returns `202` with `Content-Type: application/x-javascript`; the client
  parses the text explicitly and the spec accepts any 2xx. Icons live in `RelatedTopics`, which mixes
  topics and nested groups; "no icon" is usually `""` rather than `null`, so both are filtered.
- **Bot protection.** DuckDuckGo returns a 418 page to `chrome-headless-shell` and to user agents that
  contain `HeadlessChrome`. The `web` project uses full Chromium (`channel: 'chromium'`) with a regular
  desktop user agent; `BasePage.assertNotBlockedByBotProtection()` fails fast with a clear message if it
  happens anyway.

## What I would improve with more time

Also marked inline with `// IMPROVEMENT:` comments.

- CI pipeline (GitHub Actions) with sharding, HTML report artifacts and a nightly schedule.
- Cross-browser projects (Firefox, WebKit) once the bot-protection behaviour is validated for them.
- Schema validation of the API response (zod/ajv) instead of hand-written partial types.
- Retry with backoff in the API client for 429/5xx.
- Explicit rules for non-organic blocks (ads, news, videos) and pagination ("More results") in Test Case 1.
- Clarify "contains the word android": whole-word vs case-insensitive substring (current behaviour).
- Tags (`@smoke`, `@regression`) and `--grep` based suites; `.env` loading per environment.
- Accessibility (axe) and visual regression checks on the results page.
- Unit tests for `iconExtractor` with recorded fixtures, plus a mocked API (`page.route`/HAR) to remove
  dependency on live data.
