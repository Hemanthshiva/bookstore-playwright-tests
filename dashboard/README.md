# Test report dashboard

React dashboard for the last 10 Playwright/Cucumber test runs: charts, run list with links to each report, and classification of **flaky** vs **regular failing** tests (threshold-based).

## Local development

```bash
npm install
npm run dev
```

With the sample `public/runs-index.json` you’ll see one run. For real data, run the CI pipeline and open the deployed Pages site.

## Build

```bash
npm run build
```

Output is in `dist/`. CI copies this into the gh-pages payload as `dashboard/`.

## Deployment

The main repo CI (`.github/workflows/bookstore-ci.yml`) builds this app and pushes it to the `gh-pages` branch with the report payload. Configure GitHub Pages to deploy from the **gh-pages** branch (not “GitHub Actions”). The dashboard is then at `https://<owner>.github.io/<repo>/dashboard/` and the runs index at `.../runs-index.json`.

## Validation

After merging, run the pipeline several times (e.g. 3–10) and confirm:

- The dashboard shows the last 10 runs.
- Each run has an “Open report” link to its Cucumber HTML report.
- Charts show pass/fail/skip and total/failed over runs.
- Flaky and failing test lists appear when there is enough history.
