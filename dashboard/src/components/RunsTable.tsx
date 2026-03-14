import type { RunEntry } from '../types';
import { runReportHref } from '../api';

interface Props {
  runs: RunEntry[];
  flakyCountByRun?: Map<string, number>;
}

export function RunsTable({ runs, flakyCountByRun }: Props) {
  if (runs.length === 0) {
    return (
      <p className="runs-empty">No runs in history yet. Run the pipeline to see results here.</p>
    );
  }

  return (
    <div className="runs-table-wrap">
      <table className="runs-table">
        <thead>
          <tr>
            <th>Run</th>
            <th>Date / Time</th>
            <th>Branch</th>
            <th>Total</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Flaky (in history)</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => {
            const branch = run.gitRef ? run.gitRef.replace(/^refs\/heads\//, '') : '—';
            const date = run.timestamp ? new Date(run.timestamp).toLocaleString() : '—';
            const flaky = flakyCountByRun?.get(run.runId) ?? 0;
            const reportHref = runReportHref(run);

            return (
              <tr key={run.runId}>
                <td>
                  <code>{run.runId}</code>
                </td>
                <td>{date}</td>
                <td>
                  <code>{branch}</code>
                </td>
                <td>{run.stats?.total ?? '—'}</td>
                <td className="stat-passed">{run.stats?.passed ?? '—'}</td>
                <td className="stat-failed">{run.stats?.failed ?? '—'}</td>
                <td>{flaky}</td>
                <td>
                  {reportHref ? (
                    <a href={reportHref} target="_blank" rel="noopener noreferrer">
                      Open report
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
