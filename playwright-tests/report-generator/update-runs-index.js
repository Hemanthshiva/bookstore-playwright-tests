const fs = require('fs');
const path = require('path');

/**
 * This script maintains a rolling runs-index.json with metadata
 * for the latest N runs (default 10).
 *
 * It expects a per-run stats file and CI context provided via environment:
 *   - RUN_ID:        unique identifier for this run (e.g. GITHUB_RUN_NUMBER or RUN_ID)
 *   - RUN_NUMBER:    GitHub run number (optional but useful)
 *   - RUN_ATTEMPT:   GitHub run attempt (optional)
 *   - GIT_SHA:       commit SHA
 *   - GIT_BRANCH:    ref/branch name
 *   - REPORT_URL:    public URL to the HTML report for this run
 *   - MAX_RUNS:      optional, max history length (default 10)
 *
 * Usage:
 *   node playwright-tests/report-generator/update-runs-index.js \
 *     --stats test-reports/cucumber/run-stats.json \
 *     --index test-reports/runs-index.json
 */

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (!key || !value) continue;
    if (key === '--stats') result.statsPath = value;
    if (key === '--index') result.indexPath = value;
  }
  return result;
}

function readJsonIfExists(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) return null;
  const raw = fs.readFileSync(abs, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Warning: could not parse existing index at ${abs}:`, err);
    return null;
  }
}

function loadRunStats(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Run stats JSON file not found: ${abs}`);
  }
  const raw = fs.readFileSync(abs, 'utf-8');
  return JSON.parse(raw);
}

function buildRunMetadata(runStats) {
  const now = new Date().toISOString();

  const runId = process.env.RUN_ID || process.env.GITHUB_RUN_ID || process.env.GITHUB_RUN_NUMBER || now;
  const runNumber = process.env.RUN_NUMBER || process.env.GITHUB_RUN_NUMBER || null;
  const runAttempt = process.env.RUN_ATTEMPT || process.env.GITHUB_RUN_ATTEMPT || null;
  const gitSha = process.env.GIT_SHA || process.env.GITHUB_SHA || null;
  const gitRef = process.env.GIT_BRANCH || process.env.GITHUB_REF || null;
  const reportUrl = process.env.REPORT_URL || null;

  const stats = runStats.stats || {};
  const tests = Array.isArray(runStats.tests) ? runStats.tests : [];

  return {
    runId,
    runNumber,
    runAttempt,
    timestamp: now,
    gitSha,
    gitRef,
    reportUrl,
    stats,
    // Store only basic per-test info for this run.
    tests,
  };
}

function updateRunsIndex(existingIndex, newRun, maxRuns) {
  const list = Array.isArray(existingIndex) ? existingIndex : [];

  // Remove any existing entry with the same runId to avoid duplicates on retries
  const filtered = list.filter((entry) => entry.runId !== newRun.runId);

  filtered.push(newRun);

  // Sort newest first by timestamp if available, else by runNumber, else leave as-is
  filtered.sort((a, b) => {
    if (a.timestamp && b.timestamp && a.timestamp !== b.timestamp) {
      return a.timestamp < b.timestamp ? 1 : -1;
    }
    if (a.runNumber && b.runNumber && a.runNumber !== b.runNumber) {
      return Number(a.runNumber) < Number(b.runNumber) ? 1 : -1;
    }
    return 0;
  });

  return filtered.slice(0, maxRuns);
}

function main() {
  const { statsPath, indexPath } = parseArgs();
  if (!statsPath || !indexPath) {
    console.error('Usage: node update-runs-index.js --stats <run-stats-json> --index <runs-index-json>');
    process.exit(1);
  }

  const maxRuns = Number(process.env.MAX_RUNS || 10);

  try {
    const runStats = loadRunStats(statsPath);
    const newRunMeta = buildRunMetadata(runStats);

    const existingIndex = readJsonIfExists(indexPath);

    const updatedList = updateRunsIndex(existingIndex, newRunMeta, maxRuns);

    const absIndex = path.resolve(indexPath);
    const dir = path.dirname(absIndex);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(absIndex, JSON.stringify(updatedList, null, 2), 'utf-8');
    console.log(`Updated runs index written to ${absIndex} (length=${updatedList.length})`);
  } catch (err) {
    console.error('Error updating runs index:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

