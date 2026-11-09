// The guide code must build a guide for every framework, database and data library the planner offers,
// without throwing and without leaking "undefined" or "[object Object]" into the steps.
import { describe, expect, it } from 'vitest';
import { StackKit } from '../src/stack';
import { frameworks } from '../src/coverage';
import { Tree } from '../src/tree';
import JAVA_DATA from '../data/java-data.json';

type Answers = Record<string, unknown>;
const nodes: { id: string; when?: (a: Answers) => boolean; options: (a: Answers) => { id: string }[] }[] = Tree.nodes(JAVA_DATA);
const first = (id: string, a: Answers): string[] => {
  const n = nodes.find((x) => x.id === id)!;
  return n.when && !n.when(a) ? [] : n.options(a).map((o) => o.id);
};

/** Text of every step, with the places JavaScript code may legitimately say "undefined" removed. */
function guideText(sections: { title: string; items: Record<string, unknown>[] }[]): string {
  return JSON.stringify(sections).replace(/(: |\? |= |=== |!== |\(|, )undefined|undefined(,|\)|;| \|\|)/g, '');
}

describe('guides', () => {
  const routes: Answers[] = [];
  for (const { framework, language } of frameworks()) {
    if (!StackKit.frameworks[framework]) continue;
    const base: Answers = { product: 'website', siteStack: 'custom', language, framework, needs: ['accounts', 'admin', 'store', 'live'] };
    for (const database of first('database', base)) {
      const datas = first('data', { ...base, database });
      for (const data of datas.length ? datas : [undefined]) {
        const a: Answers = { ...base, database, data };
        // Fill every later step with its first option, as the page's suggestions would.
        for (const id of ['frontend', 'frontendLanguage', 'api', 'migrations', 'login', 'admin', 'transport', 'payment', 'build', 'hosting']) {
          const opts = first(id, a);
          if (opts.length) a[id] = opts[0];
        }
        routes.push(a);
      }
    }
  }

  it('covers every backend guide', () => {
    expect(new Set(routes.map((a) => a.framework)).size).toBe(Object.keys(StackKit.frameworks).length);
  });

  it.each(routes.map((a) => [`${a.framework} + ${a.database}${a.data ? ' + ' + a.data : ''}`, a] as const))('builds %s', (_name, a) => {
    const sections = StackKit.plan(a);
    expect(Array.isArray(sections) && sections.length).toBeTruthy();
    const text = guideText(sections);
    expect(text).not.toMatch(/\bundefined\b/);
    expect(text).not.toContain('[object Object]');
    expect(text).not.toMatch(/\bNaN\b/);
  });
});
