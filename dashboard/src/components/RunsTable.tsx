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
            <th>Stats</th>
            <th>Pass Rate</th>
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

            const total = run.stats?.total ?? 0;
            const passed = run.stats?.passed ?? 0;
            const failed = run.stats?.failed ?? 0;
            const passRate = total > 0 ? (passed / total) * 100 : 0;

            return (
              <tr key={run.runId}>
                <td>
                  <code>{run.runId}</code>
                </td>
                <td>{date}</td>
                <td>
                  <code>{branch}</code>
                </td>
                <td>
                  <span className="stat-pill passed">{passed}P</span>
                  <span className="stat-pill failed">{failed}F</span>
                </td>
                <td style={{ minWidth: '120px' }}>
                  <div className="pass-rate-bar-container">
                    <div className="pass-rate-bar" style={{ width: `${passRate}%` }} />
                    <span className="pass-rate-text">{passRate.toFixed(0)}%</span>
                  </div>
                </td>
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
