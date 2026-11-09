import { describe, expect, it } from 'vitest';
import { comboDocs, docDate, DOCS, DOCS_MIN_YEAR, docsFor, docsKeys, docsLine, docsOld, esc, type DocSource } from '../src/docs';

const recent: DocSource = { src: 'Recent docs', u: 'https://example.org/new', how: 'updated', d: '2026-10-06' };
const old: DocSource = { src: 'Old docs', u: 'https://example.org/old', how: 'release', ver: 'Tool 1.0', d: '2024-03-01' };

describe('docDate', () => {
  it('writes a full date', () => expect(docDate('2026-10-06')).toBe('6 October 2026'));
  it('writes a month without a day', () => expect(docDate('2026-01')).toBe('January 2026'));
});

describe('esc', () => {
  it('escapes HTML', () => expect(esc('<a & b>')).toBe('&lt;a &amp; b&gt;'));
});

describe('docsKeys', () => {
  it('orders keys from most to least specific', () => {
    expect(docsKeys({ framework: 'fastapi', data: 'sqlalchemy', language: 'python' }, 'database', 'sqlserver')).toEqual([
      'fastapi|database:sqlserver', 'sqlalchemy|database:sqlserver', 'python|database:sqlserver', 'database:sqlserver',
    ]);
  });
  it('keeps Django out of the shared Python family', () => {
    expect(docsKeys({ framework: 'django', language: 'python' }, 'database', 'sqlserver')).toEqual(['django|database:sqlserver', 'python|database:sqlserver', 'database:sqlserver']);
  });
});

describe('docsFor', () => {
  const table = { 'gin|database:sqlserver': recent, 'gorm|database:sqlserver': old, 'login:auth0': recent };
  it('prefers the framework entry', () => expect(docsFor({ framework: 'gin', data: 'gorm', language: 'go' }, 'database', 'sqlserver', table)).toBe(recent));
  it('falls back to the data library', () => expect(docsFor({ framework: 'echo', data: 'gorm', language: 'go' }, 'database', 'sqlserver', table)).toBe(old));
  it('falls back to the option alone', () => expect(docsFor({ framework: 'gin' }, 'login', 'auth0', table)).toBe(recent));
  it('returns null when nothing matches', () => expect(docsFor({ framework: 'gin' }, 'login', 'entra', table)).toBeNull());
  it('finds the real Django SQL Server source', () => expect(docsFor({ framework: 'django', language: 'python' }, 'database', 'sqlserver')?.src).toMatch(/mssql-django/));
});

describe('comboDocs', () => {
  it('only applies to SQL Server', () => expect(comboDocs({ database: 'postgresql', migrations: 'goose' })).toBeNull());
  it('finds a migration tool with SQL Server', () => expect(comboDocs({ database: 'sqlserver', migrations: 'goose' })?.src).toMatch(/goose/));
});

describe('docsOld', () => {
  it('flags docs before the minimum year', () => expect(docsOld(old)).toBe(true));
  it('accepts current docs', () => expect(docsOld(recent)).toBe(false));
  it('treats a missing source as not old', () => expect(docsOld(null)).toBe(false));
});

describe('docsLine', () => {
  it('says supported for current docs', () => {
    expect(docsLine(recent)).toBe('Supported according to its official docs: <a href="https://example.org/new">Recent docs</a> (page updated 6 October 2026).');
  });
  it('warns for old docs and names the year', () => {
    const line = docsLine(old);
    expect(line).toContain('Its newest official docs are from 2024, before ' + DOCS_MIN_YEAR);
    expect(line).toContain('Tool 1.0, 1 March 2024');
  });
  it('words undated live docs', () => expect(docsLine({ ...recent, how: 'checked', d: '2026-11-09' })).toContain('live docs, read 9 November 2026'));
  it('falls back when there is no source', () => expect(docsLine(null)).toBe('Written from its official docs.'));
});

describe('docs data', () => {
  it('has a well-formed source for every entry', () => {
    for (const [key, doc] of Object.entries(DOCS)) {
      expect(key, key).toMatch(/^([a-z0-9-]+\|)?[a-zA-Z]+:[a-z0-9-]+(\+[a-z0-9-]+)?$/);
      expect(doc.u, key).toMatch(/^https:\/\//);
      expect(doc.d, key).toMatch(/^\d{4}-\d{2}(-\d{2})?$/);
      expect(['updated', 'release', 'checked'], key).toContain(doc.how);
      if (doc.how === 'release') expect(doc.ver, key).toBeTruthy();
    }
  });
});
