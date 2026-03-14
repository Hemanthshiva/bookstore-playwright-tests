import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { runReportHref } from '../api';
import type { RunEntry } from '../types';

interface Props {
  runs: RunEntry[];
}

export function RunDetail({ runs }: Props) {
  const { runId } = useParams<{ runId: string }>();
  const run = runs.find((r) => r.runId === runId);
  const [stats, setStats] = useState<RunEntry | null>(null);

  useEffect(() => {
    if (!run) return;
    setStats(run);
  }, [run]);

  if (!run) {
    return (
      <div className="run-detail">
        <p>Run not found: {runId}</p>
        <Link to="/">Back to overview</Link>
      </div>
    );
  }

  const reportHref = runReportHref(run);
  const branch = run.gitRef ? run.gitRef.replace(/^refs\/heads\//, '') : '—';
  const date = run.timestamp ? new Date(run.timestamp).toLocaleString() : '—';

  return (
    <div className="run-detail">
      <Link to="/">← Back to overview</Link>
      <h2>Run {run.runId}</h2>
      <dl className="run-meta">
        <dt>Time</dt>
        <dd>{date}</dd>
        <dt>Branch</dt>
        <dd><code>{branch}</code></dd>
        <dt>Total</dt>
        <dd>{run.stats?.total ?? '—'}</dd>
        <dt>Passed</dt>
        <dd className="stat-passed">{run.stats?.passed ?? '—'}</dd>
        <dt>Failed</dt>
        <dd className="stat-failed">{run.stats?.failed ?? '—'}</dd>
        <dt>Skipped</dt>
        <dd>{run.stats?.skipped ?? '—'}</dd>
      </dl>
      {reportHref && (
        <p>
          <a href={reportHref} target="_blank" rel="noopener noreferrer">
            Open full Cucumber HTML report
          </a>
        </p>
      )}
      {stats && (stats.tests?.length ?? 0) > 0 && (
        <section>
          <h3>Tests in this run</h3>
          <ul className="test-list">
            {(stats.tests ?? []).map((t) => (
              <li key={t.id}>
                <code className="test-id">{t.id}</code>
                <span className={`status status-${t.status}`}>{t.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
