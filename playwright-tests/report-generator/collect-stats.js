const fs = require('fs');
const path = require('path');

/**
 * This script reads a Cucumber JSON report for a single run and produces
 * a compact stats JSON object with:
 * - global counts (total, passed, failed, skipped)
 * - per-scenario results keyed by a stable testId
 *
 * Usage (from repo root or CI):
 *   node playwright-tests/report-generator/collect-stats.js \
 *     --input test-reports/cucumber/cucumber-report.json \
 *     --output test-reports/cucumber/run-stats.json
 */

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (!key || !value) continue;
    if (key === '--input') result.input = value;
    if (key === '--output') result.output = value;
  }
  return result;
}

function loadJson(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Input JSON file not found: ${abs}`);
  }
  const raw = fs.readFileSync(abs, 'utf-8');
  return JSON.parse(raw);
}

function deriveTestId(feature, scenario) {
  const featureName = feature.name || 'Unknown Feature';
  const scenarioName = scenario.name || 'Unknown Scenario';
  // Use a simple, stable concatenation as the test identifier
  return `${featureName} → ${scenarioName}`;
}

function computeScenarioStatus(scenario) {
  // Cucumber JSON has steps with result.status
  const steps = scenario.steps || [];
  let hasFailed = false;
  let hasPassed = false;
  let hasSkipped = false;

  for (const step of steps) {
    const status = step.result && step.result.status;
    if (status === 'failed') hasFailed = true;
    if (status === 'passed') hasPassed = true;
    if (status === 'skipped' || status === 'pending') hasSkipped = true;
  }

  if (hasFailed) return 'failed';
  if (hasPassed && !hasFailed) return 'passed';
  if (hasSkipped && !hasFailed && !hasPassed) return 'skipped';
  return 'unknown';
}

function collectStats(cucumberJson) {
  let features = [];
  if (Array.isArray(cucumberJson)) {
    features = cucumberJson;
  } else if (cucumberJson && Array.isArray(cucumberJson.features)) {
    features = cucumberJson.features;
  }

  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  const tests = [];

  for (const feature of features) {
    const elements = feature.elements || [];
    for (const scenario of elements) {
      // Skip background elements if present
      if (scenario.type && scenario.type.toLowerCase() === 'background') {
        continue;
      }

      const status = computeScenarioStatus(scenario);
      const testId = deriveTestId(feature, scenario);

      total += 1;
      if (status === 'passed') passed += 1;
      else if (status === 'failed') failed += 1;
      else if (status === 'skipped') skipped += 1;

      tests.push({
        id: testId,
        feature: feature.name || '',
        scenario: scenario.name || '',
        status,
      });
    }
  }

  return {
    stats: {
      total,
      passed,
      failed,
      skipped,
    },
    tests,
  };
}

function main() {
  const { input, output } = parseArgs();
  if (!input || !output) {
    console.error('Usage: node collect-stats.js --input <cucumber-json> --output <run-stats-json>');
    process.exit(1);
  }

  try {
    const data = loadJson(input);
    const result = collectStats(data);

    const absOutput = path.resolve(output);
    const dir = path.dirname(absOutput);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(absOutput, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`Run stats written to ${absOutput}`);
  } catch (err) {
    console.error('Error generating run stats:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

