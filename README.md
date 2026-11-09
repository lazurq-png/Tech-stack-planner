# Tech Stack Planner

Pick the technologies for a game or website one question at a time, then set the stack up by hand from a guide that follows your choices. Each option also shows how well it works with AI coding tools, based on current tests where they exist.

The page is static: everything runs in the browser, and the build produces one self-contained `dist/index.html`.

## Commands

```bash
pnpm install
pnpm dev          # local server with live reload
pnpm build        # dist/index.html, one file
pnpm test         # unit and coverage tests
pnpm typecheck    # TypeScript
pnpm check:links  # every docs link in the sources and data
```

## Layout

| Path | What it holds |
| --- | --- |
| `index.html` | Page markup, including the static Spring Boot walkthrough |
| `src/tree.ts` | The question tree: steps, options, and when each applies |
| `src/stack-kit.ts`, `src/guides/*.ts` | Guide builders, one file per framework or family |
| `src/stack.ts` | Loads the guides in dependency order |
| `src/docs.ts` | Official docs that back untested options, and how the page words them |
| `src/coverage.ts` | What backs every offered option: a run, a sibling framework's run, or 2026+ docs |
| `src/app.ts` | The page itself: rendering, answers, status lines |
| `data/docs.json` | Docs sources with dates |
| `data/stack-status.json`, `data/status.json` | Which options ran in real projects |
| `data/java-data.json` | Text for the Java options |

Most modules still start with `// @ts-nocheck`: they came from the earlier single-file page and get types one at a time. `docs.ts` and `coverage.ts` are fully typed.

## What gets tested

Two things only:

1. **The TypeScript code**: the docs helpers, and every guide building cleanly for each framework, database and data library.
2. **Combinations nothing backs**: `test/combos.test.ts` fails when an option or combination the planner offers has neither a run here nor official docs from 2026 or later saying it's supported. Those, and only those, need a real test.

When official docs from 2026 or later say a combination is supported, add it to `data/docs.json` with its link and date instead of testing it. Docs older than 2026 make the page warn wherever that option is picked.
