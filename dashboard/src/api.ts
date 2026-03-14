import type { RunIndex, RunEntry } from './types';

const getBase = () => {
  if (typeof window === 'undefined') return '';
  const base = import.meta.env.BASE_URL ?? '/';
  if (base === '/') return '';
  return base.replace(/\/$/, '');
};

/** Base path for reports (site root). For GitHub project pages this may be /repo-name. */
function getReportsBase(): string {
  const env = import.meta.env.VITE_REPORTS_BASE;
  if (env !== undefined && env !== '') return env;
  if (typeof window !== 'undefined' && window.location.pathname.includes('/dashboard')) {
    return window.location.pathname.replace(/\/dashboard\/?.*$/, '');
  }
  return getBase() || '';
}

/** Runs index and run assets: /runs-index.json, /runs/<runId>/ */
export function runsIndexUrl(): string {
  const base = getReportsBase();
  return `${base}${base.endsWith('/') ? '' : '/'}runs-index.json`.replace(/\/+/g, '/');
}

export function runStatsUrl(runId: string): string {
  const base = getReportsBase();
  const sep = base.endsWith('/') ? '' : '/';
  return `${base}${sep}runs/${runId}/run-stats.json`.replace(/\/+/g, '/');
}

export async function fetchRunsIndex(): Promise<RunIndex> {
  const url = runsIndexUrl();
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load runs index: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchRunStats(runId: string) {
  const url = runStatsUrl(runId);
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

/** Build full URL to open a run's HTML report. */
export function runReportHref(run: RunEntry): string | null {
  const url = run.reportUrl;
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = getReportsBase();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const path = url.startsWith('/') ? url.slice(1) : url;
  const fullPath = base ? `${base.replace(/\/$/, '')}/${path}` : `/${path}`;
  return `${origin}${fullPath}`;
}
