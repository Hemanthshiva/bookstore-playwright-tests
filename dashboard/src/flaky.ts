import type { RunEntry, TestHistory } from './types';

const DEFAULT_FLAKY_MIN = 0.4;
const DEFAULT_FLAKY_MAX = 0.9;
const MIN_RUNS = 1;

export interface FlakyOptions {
  flakyMin?: number;
  flakyMax?: number;
  minRuns?: number;
}

/**
 * Aggregate test outcomes across runs and classify as stable / flaky / failing
 * using threshold-based pass rate.
 */
export function classifyTests(
  runs: RunEntry[],
  options: FlakyOptions = {}
): TestHistory[] {
  const flakyMin = options.flakyMin ?? DEFAULT_FLAKY_MIN;
  const flakyMax = options.flakyMax ?? DEFAULT_FLAKY_MAX;
  const minRuns = options.minRuns ?? MIN_RUNS;

  const byTest = new Map<string, { pass: number; fail: number }>();

  for (const run of runs) {
    for (const t of run.tests ?? []) {
      const key = t.id;
      const cur = byTest.get(key) ?? { pass: 0, fail: 0 };
      if (t.status === 'passed') cur.pass += 1;
      else if (t.status === 'failed') cur.fail += 1;
      byTest.set(key, cur);
    }
  }

  const result: TestHistory[] = [];

  for (const [testId, counts] of byTest) {
    const total = counts.pass + counts.fail;
    if (total < minRuns) continue;

    const passRate = total === 0 ? 0 : counts.pass / total;

    let classification: TestHistory['classification'] = 'stable';
    if (passRate <= flakyMin) classification = 'failing';
    else if (passRate < flakyMax) classification = 'flaky';

    result.push({
      testId,
      passCount: counts.pass,
      failCount: counts.fail,
      totalRuns: total,
      passRate,
      classification,
    });
  }

  return result.sort((a, b) => a.testId.localeCompare(b.testId));
}

export function getFlakyTests(history: TestHistory[]): TestHistory[] {
  return history.filter((t) => t.classification === 'flaky');
}

export function getFailingTests(history: TestHistory[]): TestHistory[] {
  return history.filter((t) => t.classification === 'failing');
}
