# Bookstore Application and Playwright Tests

An Angular bookstore application with a React/Vite test-report dashboard and a Playwright+Cucumber end-to-end test suite.

## Prerequisites

- Node.js 26.x
- npm 12.x or compatible npm 11+
- Git
- Chromium, Firefox, and WebKit browsers installed through Playwright

The main application uses Angular 22. The Playwright package uses TypeScript 5.9 because it is required by `ts-node` 10.9.

## Repository Layout

```text
src/                         Angular bookstore application
dashboard/                   React/Vite historical report dashboard
playwright-tests/            Playwright and Cucumber test project
playwright-tests/src/pages/  Page objects for SauceDemo scenarios
playwright-tests/src/tests/  Cucumber features and mock Playwright tests
playwright-tests/report-generator/
                             Report and run-history utilities
.github/workflows/           GitHub Actions build, test, and Pages deployment
```

## Install

From the repository root:

```bash
npm ci
cd dashboard
npm ci
cd ../playwright-tests
npm ci
npx playwright install chromium firefox webkit
```

Use `npm install` instead of `npm ci` when intentionally changing dependencies.

## Run the Application

From the repository root:

```bash
npm start
```

Open `http://127.0.0.1:4200/books`.

Build the Angular application:

```bash
npm run build
npm run build -- --configuration=production
```

The output is written to `dist/bookstore`. The Playwright mock tests use this built application and start a static server automatically.

## Run the Dashboard

```bash
cd dashboard
npm run dev
```

Other dashboard commands:

```bash
npm run build
npm run lint
npm run preview
```

## Run Tests

The Playwright commands should be run from `playwright-tests`.

### TypeScript compilation

```bash
cd playwright-tests
npm run compile
```

### Mock Playwright tests

These tests mock the bookstore API and use the Angular build served on port 4200.

```bash
npm run mock
npm run mock:headed
npm run mock:debug
npm run mock:ui
```

### Cucumber feature tests

The feature tests run against SauceDemo.

```bash
npm run feature:chrome
npm run feature:firefox
npm run feature:webkit
```

The default feature command uses the Chromium profile:

```bash
npm run feature
```

Run sharded features with:

```bash
npm run feature:shard
```

### Run the complete suite

```bash
npm run test:all
```

This runs the mock tests followed by the default Cucumber feature suite.

## Reports

After tests have generated their JSON and Playwright report files:

```bash
npm run generate:cucumber-report
npm run generate:playwright-report
npm run generate:reports
```

Generated reports are written to:

- `reports/cucumber-html-report/index.html`
- `reports/playwright/index.html`

The report generator uses the ESM API of `multiple-cucumber-html-reporter` and the report-copy script is implemented in Node.js, so report generation works on Windows and Linux.

For run-history data used by the dashboard:

```bash
node report-generator/collect-stats.js \
  --input reports/cucumber/cucumber-report.json \
  --output reports/run-stats.json

node report-generator/update-runs-index.js \
  --stats reports/run-stats.json \
  --index ../dashboard/public/runs-index.json
```

Generated reports, test results, caches, and build output are ignored by Git. Do not commit `node_modules`, `dist`, `.angular/cache`, `playwright-report`, `test-results`, or local report output.

## CI/CD

The workflow at `.github/workflows/bookstore-ci.yml` runs on pushes and pull requests targeting `main`.

It:

1. Installs root dependencies with `npm ci`.
2. Builds the Angular application and runs Karma unit tests.
3. Installs Playwright dependencies and runs the mock plus Cucumber tests.
4. Generates Cucumber and Playwright report artifacts.
5. Builds the dashboard and publishes versioned reports and run history to GitHub Pages.

The workflow uses Node.js 26.x and preserves package lockfiles. For local parity, use `npm ci` in the root, `dashboard`, and `playwright-tests` directories.

## Useful Configuration

- Angular build and serve settings: `angular.json`
- Playwright projects, browser settings, and web server: `playwright-tests/playwright.config.ts`
- Cucumber profiles and report formats: `playwright-tests/config/cucumber.js`
- Cucumber hooks and browser lifecycle: `playwright-tests/src/support/hooks.ts`
- Dashboard data source: `dashboard/public/runs-index.json`

## License

This project is licensed under the ISC license declared in `playwright-tests/package.json`.
