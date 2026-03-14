import { useState, useEffect } from 'react';
import { fetchRunsIndex } from '../api';
import type { RunIndex } from '../types';
import { Overview } from './Overview';
import { RunDetail } from './RunDetail';
import { Routes, Route } from 'react-router-dom';

export function Home() {
  const [runs, setRuns] = useState<RunIndex>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchRunsIndex()
      .then((data) => {
        if (!cancelled) setRuns(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <p>Loading runs index…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Failed to load data: {error}</p>
        <p>Make sure the report pipeline has run and <code>runs-index.json</code> is available.</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Overview runs={runs} />} />
      <Route path="/runs/:runId" element={<RunDetail runs={runs} />} />
    </Routes>
  );
}
