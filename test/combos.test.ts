// Only the combinations that nothing backs need a real test: no run here, and no official docs from 2026 or later
// saying they work together. This test lists them, so a new option or an aging doc can't slip through unnoticed.
import { describe, expect, it } from 'vitest';
import { backendCoverage, describeOffered, frameworks, needsTesting } from '../src/coverage';

describe('combination coverage', () => {
  const list = backendCoverage();

  it('walks every backend guide', () => {
    const guides = new Set(list.map((o) => o.guide));
    for (const { framework } of frameworks()) expect(guides, framework).toContain(framework);
    expect(list.length).toBeGreaterThan(200);
  });

  it('leaves nothing without a run or 2026 docs', () => {
    const open = needsTesting(list).map(describeOffered);
    expect(open, 'These need a real test, or official docs from 2026 or later:\n' + open.join('\n')).toEqual([]);
  });
});
