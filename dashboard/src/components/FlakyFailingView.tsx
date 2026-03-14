import type { TestHistory } from '../types';
import { getFlakyTests, getFailingTests } from '../flaky';

interface Props {
  history: TestHistory[];
}

function TestList({ title, tests, className }: { title: string; tests: TestHistory[]; className?: string }) {
  if (tests.length === 0) {
    return (
      <section className={className}>
        <h3>{title}</h3>
        <p className="empty">None in the last 10 runs.</p>
      </section>
    );
  }

  return (
    <section className={className}>
      <h3>{title}</h3>
      <ul className="test-list">
        {tests.map((t) => (
          <li key={t.testId}>
            <code className="test-id">{t.testId}</code>
            <span className="test-meta">
              pass rate {Math.round(t.passRate * 100)}% ({t.passCount}/{t.totalRuns} passed)
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FlakyFailingView({ history }: Props) {
  const flaky = getFlakyTests(history);
  const failing = getFailingTests(history);

  return (
    <div className="flaky-failing">
      <TestList
        title="Regular failing tests"
        tests={failing}
        className="failing-tests"
      />
      <TestList
        title="Flaky tests (pass sometimes)"
        tests={flaky}
        className="flaky-tests"
      />
    </div>
  );
}
