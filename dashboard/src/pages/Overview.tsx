import { useMemo } from 'react';
import { RunsTable } from '../components/RunsTable';
import { RunsCharts } from '../components/RunsCharts';
import { FlakyFailingView } from '../components/FlakyFailingView';
import { classifyTests, getFlakyTests } from '../flaky';
import type { RunEntry } from '../types';

interface Props {
  runs: RunEntry[];
}

export function Overview({ runs }: Props) {
  const history = useMemo(() => classifyTests(runs), [runs]);
  const flakySet = useMemo(() => new Set(getFlakyTests(history).map((t) => t.testId)), [history]);
  const flakyCountByRun = useMemo(() => {
    const m = new Map<string, number>();
    for (const run of runs) {
      const count = (run.tests ?? []).filter((t) => flakySet.has(t.id)).length;
      m.set(run.runId, count);
    }
    return m;
  }, [runs, flakySet]);

  return (
    <div className="overview">
      <h2>Last {runs.length} test runs</h2>
      <RunsCharts runs={runs} />
      <RunsTable runs={runs} flakyCountByRun={flakyCountByRun} />
      <FlakyFailingView history={history} />
    </div>
  );
}
