# Design system workbench scripts

Run from `front/` with Node 24 (the repo's engines requirement). Scripts run through `tsx`.

- `npm run ds:tokens`: generate the token CSS (`-- --check` verifies it is up to date). Stub for now, exits 0.
- `npm run ds:check`: `ds:tokens -- --check` followed by `ds:lint`.
- `npm run ds:scan`: scan `app/` for library usages, off-spec values and legacy/token reads, map files to routes, score components and pages. Writes `.storybook/static/design-scan.json` (git-ignored) and `.storybook/static/design-scan.summary.json` (committed, for the trend). Accepted findings live in `scan.allow.json`. Exits 0 on findings, with no git and with no `tokens.meta.json`; only a crash exits 1.
- `npm run ds:lint`: off-spec values (px, hex, rgba, named colours, layout spacing) on lines added under `app/component-library/` and `app/design-system/` since the merge-base with `master` (or `origin/master`, or `-- --base <ref>`), printed as `file:line raw → nearest token`. Exits 1 if any.
- `npm run ds:changes`: record which components changed against `master`. Stub for now, exits 0.
- `npm run ds:a11y`: run the accessibility checks on stories. Not implemented yet, exits 1.
- `npm run ds:visual`: run visual comparison of stories. Not implemented yet, exits 1.
- `npm run ds:audit`: run the full audit. Not implemented yet, exits 1.
- `npm run ds:workbench`: build the workbench data for Storybook. Stub for now, exits 0.
- `npm run prebuild-storybook`: runs `ds:tokens`, `ds:scan`, `ds:changes` and `ds:workbench` in order; npm runs it before `build-storybook`. Every step must exit 0 even with missing inputs, a shallow clone or no `master` ref.
