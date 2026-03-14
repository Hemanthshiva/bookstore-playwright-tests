export interface RunStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

export interface TestResult {
  id: string;
  feature: string;
  scenario: string;
  status: 'passed' | 'failed' | 'skipped' | 'unknown';
}

export interface RunEntry {
  runId: string;
  runNumber?: number | null;
  runAttempt?: number | null;
  timestamp: string;
  gitSha?: string | null;
  gitRef?: string | null;
  reportUrl?: string | null;
  stats: RunStats;
  tests: TestResult[];
}

export type RunIndex = RunEntry[];

export type TestClassification = 'stable' | 'flaky' | 'failing';

export interface TestHistory {
  testId: string;
  passCount: number;
  failCount: number;
  totalRuns: number;
  passRate: number;
  classification: TestClassification;
}
