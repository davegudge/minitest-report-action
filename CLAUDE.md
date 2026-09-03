# CLAUDE.md

GitHub Action (TypeScript, ESM) that reports Minitest failures as a Job Summary
and/or PR comment.

## Commands

```bash
pnpm install
pnpm run all      # full gate: build → format-check → lint → package → test
pnpm test         # jest (ts-jest, ESM)
pnpm run package  # rollup bundle into dist/ — REQUIRED after src/ changes
```

`pnpm run build` type-checks with `tsc --noEmit`. The `package` command builds
the artifact used by `action.yml`.

## Gotchas

- `dist/` is committed and must be rebuilt after source changes.
- ESM imports use `.js` specifiers even though the sources are `.ts`.
- Parser tests resolve fixtures relative to `GITHUB_WORKSPACE`.
- Code comments are written in English.
- Node 24 and pnpm 10 are pinned in `.node-version` and `mise.toml`.

## Architecture

- `main.ts` finds readable JSON reports using the `json-path` glob.
- `parse.ts` reads Minitest JSON reports, aggregates statistics and failures,
  and converts failure locations into source links.
- `format.ts` creates the copy-friendly failure list and detailed Markdown.
- `report-summary.ts` writes the GitHub Job Summary.
- `report-comment.ts` replaces the failure PR comment and removes it on success.

Inputs are defined in `action.yml`. Slow-test profiling is intentionally not
reported because the default Minitest JSON output does not include all tests.
