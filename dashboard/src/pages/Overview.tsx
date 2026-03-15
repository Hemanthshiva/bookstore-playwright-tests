import { useMemo } from 'react';
import { RunsTable } from '../components/RunsTable';
import { RunsCharts } from '../components/RunsCharts';
import { FlakyFailingView } from '../components/FlakyFailingView';
import { classifyTests, getFlakyTests } from '../flaky';
import type { RunEntry } from '../types';
import { runReportHref } from '../api';

interface Props {
  runs: RunEntry[];
}

export function Overview({ runs }: Props) {
  const history = useMemo(() => classifyTests(runs), [runs]);
  const latestRun = runs[0];
  const latestPassRate = useMemo(() => {
    if (!latestRun) return 0;
    const passed = latestRun.stats?.passed ?? 0;
    const failed = latestRun.stats?.failed ?? 0;
    const total = passed + failed;
    return total > 0 ? (passed / total) * 100 : 0;
  }, [latestRun]);

  const latestReportHref = latestRun ? runReportHref(latestRun) : null;

  const flakySet = useMemo(() => new Set(getFlakyTests(history).map((t) => t.testId)), [history]);
  const flakyCountByRun = useMemo(() => {
    const m = new Map<string, number>();
    for (const run of runs) {
      const count = (run.tests ?? []).filter((t) => flakySet.has(t.id)).length;
      m.set(run.runId, count);
    }
    return m;
  }, [runs, flakySet]);

  const statsSummary = useMemo(() => {
    const totalRuns = runs.length;
    const passedRuns = runs.filter((r) => (r.stats?.failed ?? 0) === 0).length;
    const failedRuns = totalRuns - passedRuns;
    const avgPassRate =
      totalRuns === 0
        ? 0
        : runs.reduce((acc, r) => {
            const total = r.stats?.total ?? 0;
            if (total === 0) return acc;
            return acc + (r.stats?.passed ?? 0) / total;
          }, 0) / totalRuns;

    const flakyTestsCount = getFlakyTests(history).length;

    return { totalRuns, passedRuns, failedRuns, avgPassRate, flakyTestsCount };
  }, [runs, history]);

  return (
    <div className="overview">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="label">Total Runs</span>
          <span className="value">{statsSummary.totalRuns}</span>
        </div>
        <div className="stat-card">
          <span className="label">Passed Runs</span>
          <span className="value text-passed">{statsSummary.passedRuns}</span>
        </div>
        <div className="stat-card">
          <span className="label">Failed Runs</span>
          <span className="value text-failed">{statsSummary.failedRuns}</span>
        </div>
        <div className="stat-card">
          <span className="label">Pass Rate</span>
          <span className="value">{(statsSummary.avgPassRate * 100).toFixed(1)}%</span>
        </div>
        <div className="stat-card">
          <span className="label">Flaky Tests</span>
          <span className="value text-flaky">{statsSummary.flakyTestsCount}</span>
        </div>
      </div>

      {latestRun && (
        <div className="latest-run-banner">
          <div className="latest-label">Latest</div>
          <div className="latest-info">
            <span className="latest-run-id">Run {latestRun.runNumber ?? latestRun.runId}</span>
            <span className="stat-pill passed">{latestRun.stats?.passed ?? 0} Passed</span>
            <span className="stat-pill failed">{latestRun.stats?.failed ?? 0} Failed</span>
            <span className="stat-pill skipped">{latestRun.stats?.skipped ?? 0} Skipped</span>
            <span className="pass-percentage">{latestPassRate.toFixed(1)}% Success</span>
          </div>
          {latestReportHref && (
            <a href={latestReportHref} className="latest-report-link" target="_blank" rel="noopener noreferrer">
              View Full Report →
            </a>
          )}
        </div>
      )}

      <h2>Last {runs.length} test runs</h2>
      <RunsCharts runs={runs} />
      <RunsTable runs={runs} flakyCountByRun={flakyCountByRun} />
      <FlakyFailingView history={history} />
    </div>
  );
}
