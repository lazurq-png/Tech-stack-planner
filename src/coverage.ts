// Works out, for every option and combination the planner offers, what backs it:
// a test run, a run on a framework that shares the code, or official docs from 2026 or later.
// Anything left over is what still needs a real test.
import { Tree } from './tree';
import { StackKit } from './stack';
import { comboDocs, docsFor, docsOld, SIBLINGS, type DocSource } from './docs';
import JAVA_DATA from '../data/java-data.json';
import STACK_STATUS from '../data/stack-status.json';
import STATUS from '../data/status.json';

export type Backing = 'ran' | 'sibling' | 'docs' | 'old-docs' | 'none';

export interface Offered {
  /** The guide: a backend framework, or a ready-made site stack. */
  guide: string;
  node: string;
  option: string;
  /** Set when the backing depends on another answer, such as the data library for a database. */
  with?: Record<string, string>;
  backing: Backing;
  doc?: DocSource | null;
}

interface TreeNode {
  id: string;
  multi?: boolean;
  when?: (a: Answers) => boolean;
  options: (a: Answers) => { id: string }[];
}
type Answers = Record<string, unknown>;

/** The steps whose options the page reports on, as in its "What was tested" list. */
export const REPORTED = ['frontend', 'frontendLanguage', 'api', 'database', 'data', 'migrations', 'login', 'admin', 'transport', 'payment', 'build'];
const DATABASES = ['postgresql', 'mysql', 'sqlserver', 'mongodb', 'sqlite', 'h2'];
const NEEDS = ['accounts', 'admin', 'store', 'live'];

const ran = STACK_STATUS.ran as Record<string, Record<string, string[]>>;
const javaStatus = STATUS as Record<string, { l: string; t: string }>;

const nodes: TreeNode[] = Tree.nodes(JAVA_DATA);
const byId = (id: string) => nodes.find((n) => n.id === id)!;

function optionsFor(id: string, a: Answers): string[] {
  const n = byId(id);
  if (!n || (n.when && !n.when(a))) return [];
  try { return (n.options(a) || []).map((o) => o.id); } catch { return []; }
}

/** Every backend framework with its language, read from the tree itself. */
export function frameworks(): { framework: string; language: string }[] {
  const out: { framework: string; language: string }[] = [];
  const base: Answers = { product: 'website', siteStack: 'custom', needs: NEEDS };
  for (const language of optionsFor('language', base)) {
    for (const framework of optionsFor('framework', { ...base, language })) out.push({ framework, language });
  }
  return out;
}

function backingFor(guide: string, language: string, node: string, option: string, data?: string): Pick<Offered, 'backing' | 'doc'> {
  if (guide === 'spring-boot') {
    const st = javaStatus[node + ':' + option];
    if (st && (st.l === 'run' || st.l === 'partial')) return { backing: 'ran' };
  } else {
    if ((ran[guide]?.[node] || []).includes(option)) return { backing: 'ran' };
    if ((SIBLINGS[guide] || []).some((f) => (ran[f]?.[node] || []).includes(option))) return { backing: 'sibling' };
  }
  const doc = docsFor({ framework: guide, language, data }, node, option);
  if (!doc) return { backing: 'none', doc: null };
  return { backing: docsOld(doc) ? 'old-docs' : 'docs', doc };
}

/** Every option each backend guide offers, with what backs it. */
export function backendCoverage(): Offered[] {
  const out: Offered[] = [];
  const seen = new Set<string>();
  const add = (o: Offered) => { const k = JSON.stringify([o.guide, o.node, o.option, o.with]); if (!seen.has(k)) { seen.add(k); out.push(o); } };
  for (const { framework, language } of frameworks()) {
    if (framework !== 'spring-boot' && !StackKit.frameworks[framework]) continue;
    const base: Answers = { product: 'website', siteStack: 'custom', needs: NEEDS, language, framework };
    for (const database of optionsFor('database', base).filter((d) => DATABASES.includes(d))) {
      const dataOptions = optionsFor('data', { ...base, database });
      for (const data of dataOptions.length ? dataOptions : [undefined]) {
        const a: Answers = { ...base, database, data };
        for (const node of REPORTED) {
          for (const option of optionsFor(node, a)) {
            // The database's backing depends on the data library; everything else doesn't.
            const dependsOnData = node === 'database' && option === 'sqlserver';
            const b = backingFor(framework, language, node, option, dependsOnData ? data : undefined);
            add({ guide: framework, node, option, with: dependsOnData && data ? { data } : undefined, ...b });
          }
        }
        // A migration tool with SQL Server needs its own backing.
        if (database === 'sqlserver') {
          for (const migrations of optionsFor('migrations', a)) {
            const doc = comboDocs({ database, migrations });
            const ranHere = framework !== 'spring-boot' && (ran[framework]?.database || []).includes('sqlserver') && (ran[framework]?.migrations || []).includes(migrations);
            add({ guide: framework, node: 'migrations', option: migrations, with: { database: 'sqlserver' }, backing: ranHere ? 'ran' : !doc ? 'none' : docsOld(doc) ? 'old-docs' : 'docs', doc });
          }
        }
      }
    }
  }
  return out;
}

/** What still needs a real test: no run, and no official docs from 2026 or later. */
export function needsTesting(list: Offered[] = backendCoverage()): Offered[] {
  return list.filter((o) => o.backing === 'none' || o.backing === 'old-docs');
}

export function describeOffered(o: Offered): string {
  const extra = o.with ? ' with ' + Object.entries(o.with).map(([k, v]) => k + '=' + v).join(', ') : '';
  return o.guide + ': ' + o.node + '=' + o.option + extra + ' (' + o.backing + (o.doc ? ', docs ' + o.doc.d : '') + ')';
}
