# Playwright Hybrid Sample Framework

A reference **Playwright + TypeScript** test-automation framework that bundles three complementary styles of testing behind one shared stack:

- **UI** — Page Object Model on top of Playwright's browser driver
- **API** — Playwright's native `request` context, wrapped in a small `ApiClient`
- **Data-Driven** — parameterized specs fed from JSON fixtures

It ships with Allure + Playwright HTML reporting, a multi-browser GitHub Actions matrix, faker-based test-data generation, and an environment-aware config layer — so the whole thing is runnable out of the box.

The framework deliberately points at public demo sites — [saucedemo.com](https://www.saucedemo.com/) for UI, [reqres.in](https://reqres.in/) and [jsonplaceholder](https://jsonplaceholder.typicode.com/) for API — so it runs with no private credentials. Swap the URLs in [config/environment.config.ts](config/environment.config.ts) to point at your own SUT.

---

## Table of contents

- [At a glance](#at-a-glance)
- [Architecture](#architecture)
- [Folder layout](#folder-layout)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [npm scripts](#npm-scripts)
- [Environment variables](#environment-variables)
- [Configuration model](#configuration-model)
- [Writing tests](#writing-tests)
  - [UI (POM) example](#ui-pom-example)
  - [API example](#api-example)
  - [Data-driven example](#data-driven-example)
  - [Fixtures](#fixtures)
- [Utilities](#utilities)
- [Reporting](#reporting)
- [Running in CI](#running-in-ci)
- [Browsers and projects](#browsers-and-projects)
- [Debugging](#debugging)
- [Extending the framework](#extending-the-framework)
- [Troubleshooting](#troubleshooting)
- [Conventions](#conventions)

---

## At a glance

| Aspect               | Choice                                                      |
|----------------------|-------------------------------------------------------------|
| Language             | TypeScript (strict), Node 20                                |
| Test runner          | `@playwright/test` ^1.57                                    |
| Browsers             | Chromium, Firefox, WebKit (+ separate `api` project)        |
| Reporters            | `list`, `html`, `allure-playwright`                         |
| Data                 | JSON fixtures + `@faker-js/faker`                           |
| Parallelism          | `fullyParallel: true` (2 workers in CI)                     |
| Retries              | 0 locally, 2 in CI                                          |
| Artifacts on failure | Screenshot, video, trace                                    |
| CI                   | GitHub Actions with a 4-way project matrix                  |
| Path aliases         | `@pages/*`, `@utils/*`, `@config/*`, `@fixtures/*`          |

---

## Architecture

The codebase is layered so each file has one concern. Higher layers only depend on lower layers — tests never talk to Playwright's raw API directly.

```
tests/            <-- spec files (UI / API / DDT)
  │
  ▼
fixtures/         <-- Playwright test fixtures (inject POMs + ApiClient)
  │
  ├─► pages/      <-- Page Object Model, all extend BasePage
  │        │
  │        ▼
  │      BasePage <-- logged/fault-tolerant click/fill/getText/waitForElement
  │
  └─► utils/      <-- ApiClient, Logger, DataFactory, Helpers
           │
           ▼
        config/   <-- environment resolution + platform switches
```

| Layer                | Responsibility                                                                 |
|----------------------|--------------------------------------------------------------------------------|
| [config/](config/)         | Environment resolution (`qa` / `stage` / `prod`) + platform (`web` / `android` / `ios`). |
| [pages/](pages/)           | Page Object Model. `BasePage` wraps click/fill/wait with logging + safer timeouts. |
| [utils/](utils/)           | `Logger`, generic `Helpers`, `DataFactory` (Faker), `ApiClient`.                |
| [fixtures/](fixtures/)     | Extended Playwright `test` with POM + logged-in + API fixtures; JSON test data. |
| [tests/ui/](tests/ui/)     | Specs exercising the POM layer against the web app.                             |
| [tests/api/](tests/api/)   | Specs using Playwright's `request` context via `ApiClient`.                     |
| [tests/data-driven/](tests/data-driven/) | Parameterized specs iterating over rows of JSON test data.           |

---

## Folder layout

```
sample-framework/
├── .github/workflows/ci.yml          # GitHub Actions pipeline (matrix per browser + api)
├── config/
│   ├── environment.config.ts         # env-aware URL + credential loader
│   └── settings.ts                   # platform helper (web / android / ios)
├── fixtures/
│   ├── base.fixture.ts               # extended Playwright test (POMs + apiClient + loggedInPage)
│   └── test-data/
│       ├── login-data.json           # data-driven inputs
│       └── users.json                # API payload samples
├── pages/
│   ├── base.page.ts                  # shared page-object superclass
│   ├── login.page.ts
│   ├── inventory.page.ts
│   ├── cart.page.ts
│   └── checkout.page.ts
├── tests/
│   ├── ui/
│   │   ├── login.spec.ts
│   │   ├── inventory.spec.ts
│   │   └── checkout.spec.ts
│   ├── api/
│   │   └── users-api.spec.ts
│   └── data-driven/
│       └── login-ddt.spec.ts
├── utils/
│   ├── logger.ts                     # [INFO]/[STEP]/[ERROR]/[DEBUG] structured console output
│   ├── helpers.ts                    # screenshot, network-idle, random/unique values
│   ├── data.factory.ts               # Faker-backed User / Address / Product builders
│   └── api.helper.ts                 # ApiClient: typed wrapper around APIRequestContext
├── .env.example
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

---

## Prerequisites

- **Node.js 20+** (CI uses `actions/setup-node@v4` with Node 20)
- **npm 10+**
- **OS dependencies for Playwright browsers** — installed automatically by `npx playwright install --with-deps`
- *(Optional)* **Allure CLI** — only needed for `npm run report:allure`. Install with `brew install allure` on macOS or see the [Allure docs](https://allurereport.org/docs/install/).

---

## Quick start

```bash
# 1. Install dependencies and browsers
npm install
npx playwright install --with-deps

# 2. Configure (optional — defaults work against saucedemo / reqres)
cp .env.example .env
#   edit .env if you need non-default credentials or a different TEST_ENV

# 3. Run
npm test                 # full suite across all projects
npm run test:ui          # UI specs only
npm run test:api         # API specs only
npm run test:ddt         # data-driven specs only
npm run test:headed      # run UI in headed mode
npm run test:debug       # open Playwright Inspector

# 4. Open reports
npm run report:html      # Playwright HTML report
npm run report:allure    # Allure (requires allure CLI)
```

Run a single file or single test:

```bash
npx playwright test tests/ui/login.spec.ts
npx playwright test -g "valid credentials"
npx playwright test --project=firefox
```

---

## npm scripts

Defined in [package.json](package.json).

| Script                 | What it does                                                            |
|------------------------|-------------------------------------------------------------------------|
| `npm test`             | `playwright test` — run everything across every project                 |
| `npm run test:ui`      | Only specs under [tests/ui/](tests/ui/)                                 |
| `npm run test:api`     | Only specs under [tests/api/](tests/api/)                               |
| `npm run test:ddt`     | Only specs under [tests/data-driven/](tests/data-driven/)               |
| `npm run test:headed`  | Run with a visible browser window                                       |
| `npm run test:debug`   | Launch the Playwright Inspector for step-through debugging              |
| `npm run report:html`  | `playwright show-report` — opens `playwright-report/index.html`         |
| `npm run report:allure`| Generate + open Allure from `allure-results/` (needs the `allure` CLI)  |
| `npm run format:check` | `tsc --noEmit` — fast type-check with no output                         |

---

## Environment variables

Copy [.env.example](.env.example) to `.env` and edit. The file is loaded via `dotenv/config` at the top of [playwright.config.ts](playwright.config.ts), so every spec sees the same values.

| Variable      | Default          | Used for                                                              |
|---------------|------------------|-----------------------------------------------------------------------|
| `TEST_ENV`    | `qa`             | Selects a block in `environments` (`qa` \| `stage` \| `prod`).        |
| `UI_USERNAME` | `standard_user`  | Username passed to `LoginPage.login()`.                               |
| `UI_PASSWORD` | `secret_sauce`   | Password passed to `LoginPage.login()`.                               |
| `API_TOKEN`   | `reqres-free-v1` | Sent as `x-api-key` on every request made through `ApiClient`.        |
| `DEBUG`       | *(unset)*        | When truthy, `Logger.debug` lines print to the console.               |
| `PLATFORM`    | `web`            | Read by [config/settings.ts](config/settings.ts) (`web`/`android`/`ios`). |
| `CI`          | *(set by CI)*    | Flips retries to 2 and workers to 2; forbids `test.only`.             |

---

## Configuration model

[config/environment.config.ts](config/environment.config.ts) is the single source of truth for URLs and credentials.

```ts
// Adding a new environment
const environments = {
  qa:    { name: 'qa',    webBaseUrl: 'https://www.saucedemo.com', apiBaseUrl: 'https://reqres.in/api', timeout: 30_000, retries: 1 },
  stage: { name: 'stage', webBaseUrl: 'https://www.saucedemo.com', apiBaseUrl: 'https://reqres.in/api', timeout: 30_000, retries: 2 },
  prod:  { name: 'prod',  webBaseUrl: 'https://www.saucedemo.com', apiBaseUrl: 'https://reqres.in/api', timeout: 30_000, retries: 2 },
  // ▼ add your own
  dev:   { name: 'dev',   webBaseUrl: 'https://dev.example.com',   apiBaseUrl: 'https://api.dev.example.com', timeout: 30_000, retries: 0 },
};
```

Then run with `TEST_ENV=dev npm test`.

`getEnvironmentConfig()` returns a fully-resolved `EnvironmentConfig` object:

```ts
{
  name:          'qa',
  webBaseUrl:    'https://www.saucedemo.com',
  apiBaseUrl:    'https://reqres.in/api',
  uiCredentials: { username: 'standard_user', password: 'secret_sauce' },
  apiToken:      'reqres-free-v1',
  timeout:       30_000,
  retries:       1,
}
```

Call it from anywhere — `BasePage`, `ApiClient`, and `base.fixture.ts` all use it.

---

## Writing tests

### UI (POM) example

From [tests/ui/login.spec.ts](tests/ui/login.spec.ts):

```ts
import { test, expect } from '../../fixtures/base.fixture';
import { getEnvironmentConfig } from '../../config/environment.config';

test.describe('Login', () => {
  test('valid credentials land on the inventory page', async ({ loginPage, inventoryPage }) => {
    const { username, password } = getEnvironmentConfig().uiCredentials;

    await loginPage.open();
    await loginPage.login(username, password);

    expect(await inventoryPage.isLoaded()).toBe(true);
  });
});
```

Every page object extends [BasePage](pages/base.page.ts), which exposes:

| Helper                                     | Why it's useful                                                 |
|--------------------------------------------|-----------------------------------------------------------------|
| `goto(path)`                               | Resolves `path` against `webBaseUrl` and logs a `[STEP]` line.  |
| `click(sel)` / `fill(sel, v)`              | Waits for the element first, logs an `[ERROR]` with context on failure. |
| `getText(sel)` / `isVisible(sel)`          | Wait-and-read helpers with graceful fallbacks.                  |
| `waitForElement(sel, timeout)`             | Thin `waitForSelector` wrapper with a sensible default.         |
| `scrollUntilVisible(locator, container?)`  | Handy for lazy-loaded lists.                                    |

Keep selectors **private** to the page object and expose **action-level methods** (`login()`, `addToCart()`, `checkout()`) rather than raw locators.

### API example

From [tests/api/users-api.spec.ts](tests/api/users-api.spec.ts):

```ts
import { test, expect } from '../../fixtures/base.fixture';
import userPayloads from '../../fixtures/test-data/users.json';

test('POST /users creates a user', async ({ apiClient }) => {
  const res = await apiClient.post('/users', userPayloads.createUser);

  expect(res.status()).toBe(201);
  expect(await res.json()).toMatchObject({
    name: userPayloads.createUser.name,
    job:  userPayloads.createUser.job,
    id:        expect.any(String),
    createdAt: expect.any(String),
  });
});
```

`apiClient` is created by [ApiClient.create()](utils/api.helper.ts), which:

- reads `apiBaseUrl` + `apiToken` from env config,
- injects `Content-Type: application/json` and `x-api-key: $API_TOKEN`,
- exposes `get` / `post` / `put` / `delete` with `[STEP]` + `[DEBUG]` logging,
- is disposed automatically when the test ends (fixture tear-down).

### Data-driven example

From [tests/data-driven/login-ddt.spec.ts](tests/data-driven/login-ddt.spec.ts):

```ts
import loginData from '../../fixtures/test-data/login-data.json';

for (const row of loginData as LoginRow[]) {
  test(`${row.case}`, async ({ loginPage, inventoryPage }) => {
    await loginPage.open();
    await loginPage.login(row.username, row.password);

    if (row.expectSuccess) {
      expect(await inventoryPage.isLoaded()).toBe(true);
    } else {
      expect(await loginPage.hasError()).toBe(true);
      if (row.expectedError) {
        expect(await loginPage.getErrorMessage()).toBe(row.expectedError);
      }
    }
  });
}
```

Each row in [fixtures/test-data/login-data.json](fixtures/test-data/login-data.json) becomes an independent test in the report, with its `case` string as the test name — so failures point directly at the failing row.

### Fixtures

[fixtures/base.fixture.ts](fixtures/base.fixture.ts) extends Playwright's `test` with:

| Fixture         | Type              | Notes                                                     |
|-----------------|-------------------|-----------------------------------------------------------|
| `loginPage`     | `LoginPage`       | Fresh POM wired to the current `page`.                    |
| `inventoryPage` | `InventoryPage`   | Ditto.                                                    |
| `cartPage`      | `CartPage`        | Ditto.                                                    |
| `checkoutPage`  | `CheckoutPage`    | Ditto.                                                    |
| `loggedInPage`  | `InventoryPage`   | Starts the test already authenticated using env creds.    |
| `apiClient`     | `ApiClient`       | Ready-to-use, disposed in tear-down.                      |

Every spec imports `test` and `expect` from the fixture module, not from `@playwright/test` directly:

```ts
import { test, expect } from '../../fixtures/base.fixture';
```

---

## Utilities

- **[Logger](utils/logger.ts)** — emits tagged `[INFO] / [STEP] / [ERROR] / [DEBUG]` lines with ISO timestamps. Debug lines are gated on `DEBUG=1`.
- **[DataFactory](utils/data.factory.ts)** — Faker-backed builders for `User`, `Address`, `Product`. Every method accepts a `Partial<T>` override so tests can lock specific fields (`DataFactory.user({ email: 'known@example.com' })`).
- **[Helpers](utils/helpers.ts)** — one-line utilities: `takeScreenshot`, `waitForNetworkIdle`, `randomString`, `randomInt`, `formatDate`, `uniqueName`.
- **[ApiClient](utils/api.helper.ts)** — see [API example](#api-example).

---

## Reporting

Three reporters run in parallel (configured in [playwright.config.ts](playwright.config.ts)):

| Reporter            | Output location           | How to view                               |
|---------------------|---------------------------|-------------------------------------------|
| `list`              | stdout                    | Watch while tests run.                    |
| `html`              | `playwright-report/`      | `npm run report:html`                     |
| `allure-playwright` | `allure-results/`         | `npm run report:allure` (needs `allure`)  |

On failure, Playwright also retains:

- `screenshot: 'only-on-failure'` — under `test-results/`
- `video: 'retain-on-failure'` — under `test-results/`
- `trace: 'retain-on-failure'` — open with `npx playwright show-trace test-results/**/trace.zip`

---

## Running in CI

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs on:

- every push to `main`,
- every pull request to `main`,
- a nightly schedule (`0 2 * * *` UTC),
- manual dispatch (with a `test_env` input: `qa` / `stage` / `prod`).

The job uses a **matrix** of four projects — `chromium`, `firefox`, `webkit`, `api` — and uploads, for each project:

- `playwright-report-<project>` (14-day retention)
- `allure-results-<project>` (14-day retention)
- `test-results-<project>` (7-day retention, only on failure — traces and videos)

Credentials come from GitHub secrets (`UI_USERNAME`, `UI_PASSWORD`, `API_TOKEN`) with the public-demo defaults as fallbacks. Override them in your repo's **Settings → Secrets and variables → Actions**.

---

## Browsers and projects

`playwright.config.ts` declares four projects:

| Project    | `testDir`         | `baseURL`       | Notes                                     |
|------------|-------------------|-----------------|-------------------------------------------|
| `chromium` | `./tests`         | `webBaseUrl`    | Default UI browser.                       |
| `firefox`  | `./tests`         | `webBaseUrl`    | Cross-browser coverage.                   |
| `webkit`   | `./tests`         | `webBaseUrl`    | Safari-engine coverage.                   |
| `api`      | `./tests/api`     | `apiBaseUrl`    | Only loads API specs; points at the API host. |

Run one project:

```bash
npx playwright test --project=webkit
npx playwright test --project=api
```

---

## Debugging

| Need                                | Command                                                      |
|-------------------------------------|--------------------------------------------------------------|
| Step through with the Inspector     | `npm run test:debug`                                         |
| See the browser                     | `npm run test:headed`                                        |
| Focus one test                      | `npx playwright test -g "valid credentials"`                 |
| Open the last HTML report           | `npm run report:html`                                        |
| Open a trace from a failed run      | `npx playwright show-trace test-results/**/trace.zip`        |
| Enable debug-level logs from utils  | `DEBUG=1 npm test`                                           |
| Record a new test from the UI       | `npx playwright codegen https://www.saucedemo.com`           |

---

## Extending the framework

### Add a page object

1. Create `pages/<name>.page.ts` extending `BasePage`.
2. Keep selectors `private readonly` at the top of the class.
3. Expose action-level methods (`addItem(sku)`, `removeItem(sku)`) — not raw clicks.
4. Register a fixture in [fixtures/base.fixture.ts](fixtures/base.fixture.ts) if the POM is used across multiple specs.

### Add an environment

Edit the `environments` object in [config/environment.config.ts](config/environment.config.ts) and widen the `EnvKey` union. Run with `TEST_ENV=<name>`.

### Add a data-driven suite

1. Drop a JSON array under [fixtures/test-data/](fixtures/test-data/).
2. Import it at the top of a spec and iterate with `for (const row of data) { test(row.case, ...) }`.
3. Name each row's `case` clearly — it becomes the test title in reports.

### Add an API suite

Either reuse `apiClient` from the fixture, or instantiate `request.newContext()` directly in the spec for one-off headers.

### Add a mobile project

[config/settings.ts](config/settings.ts) exposes `getPlatform()` and `isMobile()`. Add an `android` / `ios` project to `playwright.config.ts#projects` with appropriate device descriptors and gate mobile-only pages with `test.skip(!isMobile(), 'mobile only')`.

---

## Troubleshooting

| Symptom                                                   | Likely cause / fix                                                                 |
|-----------------------------------------------------------|------------------------------------------------------------------------------------|
| `Executable doesn't exist at …/ms-playwright/…`           | Browsers weren't installed — run `npx playwright install --with-deps`.             |
| `Invalid TEST_ENV "X"`                                    | `TEST_ENV` must be `qa`, `stage`, or `prod` — or add it to `environments`.         |
| `x-api-key` missing on API calls                          | `API_TOKEN` isn't in `.env` or CI secrets; the default `reqres-free-v1` works for reqres. |
| `report:allure` command fails                             | The Allure CLI isn't installed. Install via `brew install allure` or skip and use the HTML report. |
| Tests flaky only in CI                                    | Check `retries` and `workers` in `playwright.config.ts`. CI already runs with `retries: 2`, `workers: 2`. |
| Login works locally, fails in CI                          | Env var mismatch — verify `UI_USERNAME` / `UI_PASSWORD` secrets in the repo.       |
| `test.only` present → build fails                         | Expected: `forbidOnly: !!process.env.CI` — remove the `.only`.                     |

---

## Conventions

- **Selectors**: prefer `data-test` / `data-testid` attributes; avoid CSS nth-child chains.
- **Assertions**: assert through the POM's return values, not raw locators from the spec.
- **Waits**: use `waitForElement` / web-first assertions — never `waitForTimeout` in production specs.
- **Logs**: use `Logger.step()` at the top of user-visible actions; `Logger.debug()` for verbose detail.
- **Data**: use `DataFactory` for generated data; JSON fixtures only for deterministic cases that must be stable across runs.
- **Credentials**: never commit a real `.env`. `.env.example` is the contract.

---

This framework is a **template**. Replace the demo URLs with your SUT, put your credentials into `.env` / CI secrets, and you have a working hybrid Playwright framework on day one.
