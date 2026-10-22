# Design system workbench scripts

Run from `front/` with Node 24 (the repo's engines requirement). Scripts run through `tsx`.

- `npm run ds:tokens`: generate `tokens.css`, `tokens.ts` and `tokens.meta.json` in `app/design-system/tokens/` from `tokens.source.json` (W3C DTCG; `$value` is today, `$extensions.gv.redesign` the redesign value). `:root` holds today's values, `[data-gv-mode="redesign"]` re-declares what changes there and every token that reads it. An unreadable source warns and keeps the committed outputs (exit 0). `-- --check` exits 1 when an output would change, a name breaks `/^--gv-[a-z0-9-]+$/` or the source is broken.
- `npm run ds:check`: `ds:tokens -- --check` followed by `ds:lint`.
- `npm run ds:scan`: scan `app/` for component usages (library components, plus one component per directory with an index file under `app/components/UI/` and `app/components/admin/`), off-spec values and legacy/token reads, map files to routes, score components and pages. Writes `.storybook/static/design-scan.json` (git-ignored) and `.storybook/static/design-scan.summary.json` (committed, for the trend). Accepted findings live in `scan.allow.json`. Exits 0 on findings, with no git and with no `tokens.meta.json`; only a crash exits 1.
- `npm run ds:lint`: off-spec values (px, hex, rgba, named colours, layout spacing) on lines added under `app/component-library/` and `app/design-system/` since the merge-base with `master` (or `origin/master`, or `-- --base <ref>`), printed as `file:line raw → nearest token`. Exits 1 if any.
- `npm run ds:changes`: record which components changed against `master`. Stub for now, exits 0.
- `npm run ds:a11y`: run the accessibility checks on stories. Not implemented yet, exits 1.
- `npm run ds:visual`: run visual comparison of stories. Not implemented yet, exits 1.
- `npm run ds:audit`: run the full audit. Not implemented yet, exits 1.
- `npm run ds:workbench`: build the workbench shell (`.storybook/workbench/`, React + Vite) into `.storybook/static/workbench/`, which Storybook copies into its output, so it is served at `<storybook>/workbench/`. It reads `design-scan.json`, `index.json` and the other data files at runtime from one level up and lists any that are missing on Start here. `npm run ds:workbench:typecheck` typechecks it (the app typecheck does not cover `.storybook/`).
- `npm run ds:smoke -- --dir <storybook output> [--screenshot <file.png>]`: serve a built Storybook locally, open `/workbench/#/start` in Chromium and check the nav, the pages and the console. Needs Playwright (see `playwright.ts`: `GV_PLAYWRIGHT_DIR`, `PLAYWRIGHT_BROWSERS_PATH`).
- `npm run ds:prepare`: runs `ds:tokens`, `ds:scan` and `ds:changes` in order, then `ds:workbench` even if one of those failed; `build-storybook` and `storybook` run it first (npm pre-scripts are off in this repo). Every step must exit 0 even with missing inputs, a shallow clone or no `master` ref.
