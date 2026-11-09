// Official docs that back options which weren't run, and how the page words them.
// An option or combination counts as supported when its official docs from 2026 or later say so.
// Docs older than that get a warning wherever the option is picked.
import docsData from '../data/docs.json';

/** How a source is dated: the page's own date, the release the docs cover, or undated live docs read on that day. */
export type DocsHow = 'updated' | 'release' | 'checked';

export interface DocSource {
  /** Short description of the source, shown as the link text. */
  src: string;
  /** Link to the official docs. */
  u: string;
  how: DocsHow;
  /** Version the docs cover, for `how: 'release'`. */
  ver?: string;
  /** ISO date: YYYY-MM-DD, or YYYY-MM. */
  d: string;
}

/** The answers that decide which source applies. */
export interface DocsAnswers {
  framework?: string;
  data?: string;
  language?: string;
  database?: string;
  migrations?: string;
}

/** The first year whose docs count as current. */
export const DOCS_MIN_YEAR = 2026;

export const DOCS: Record<string, DocSource> = docsData.sources as Record<string, DocSource>;
export const DOCS_CHECKED: string = docsData.checked;

/** Go frameworks share the guide's code apart from routing, so a run on one counts as evidence for the others. */
export const SIBLINGS: Record<string, string[]> = { nethttp: ['gin', 'echo'], gin: ['echo', 'nethttp'], echo: ['gin', 'nethttp'] };
export const FW_NAME: Record<string, string> = { nethttp: 'the standard library', gin: 'Gin', echo: 'Echo' };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function esc(text: unknown): string {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** "2026-10-06" becomes "6 October 2026", and "2026-10" becomes "October 2026". */
export function docDate(d: string): string {
  const [year, month, day] = d.split('-');
  return (day ? Number(day) + ' ' : '') + MONTHS[Number(month) - 1] + ' ' + year;
}

/** The keys to look up, most specific first: framework, data library, language family, language, then the option alone. */
export function docsKeys(a: DocsAnswers, node: string, opt: string): string[] {
  const pythonFamily = a.language === 'python' && a.framework !== 'django' ? 'python' : undefined;
  const scopes = [...new Set([a.framework, a.data, pythonFamily, a.language].filter((k): k is string => !!k))];
  return [...scopes.map((k) => k + '|' + node + ':' + opt), node + ':' + opt];
}

export function docsFor(a: DocsAnswers, node: string, opt: string, table: Record<string, DocSource> = DOCS): DocSource | null {
  for (const key of docsKeys(a, node, opt)) if (table[key]) return table[key];
  return null;
}

/** Docs for a migration tool used with SQL Server, which needs its own backing. */
export function comboDocs(a: DocsAnswers, table: Record<string, DocSource> = DOCS): DocSource | null {
  if (a.database !== 'sqlserver' || !a.migrations) return null;
  return table['migrations:' + a.migrations + '+sqlserver'] ?? null;
}

export function docsYear(doc: DocSource): number {
  return Number(doc.d.slice(0, 4));
}

export function docsOld(doc: DocSource | null | undefined): boolean {
  return !!doc && docsYear(doc) < DOCS_MIN_YEAR;
}

/** The status sentence for an option that wasn't run. */
export function docsLine(doc: DocSource | null): string {
  if (!doc) return 'Written from its official docs.';
  const when = doc.how === 'updated' ? 'page updated ' + docDate(doc.d)
    : doc.how === 'release' ? esc(doc.ver ?? '') + ', ' + docDate(doc.d)
    : 'live docs, read ' + docDate(doc.d);
  const link = '<a href="' + doc.u + '">' + esc(doc.src) + '</a> (' + when + ').';
  if (docsOld(doc)) return '<span class="no">Its newest official docs are from ' + docsYear(doc) + ', before ' + DOCS_MIN_YEAR + '.</span> Check that it still works before relying on it: ' + link;
  return 'Supported according to its official docs: ' + link;
}
