# Design system workbench scripts

Run from `front/` with Node 24 (`export PATH=/srv/bots/Storybook/role/tools/node24/bin:$PATH` on the build machine). Scripts run through `tsx`.

- `npm run ds:tokens`: generate the token CSS (`-- --check` verifies it is up to date). Stub for now, exits 0.
- `npm run ds:check`: `ds:tokens -- --check` followed by `ds:lint`.
- `npm run ds:scan`: scan the app for component and token usage. Stub for now, exits 0.
- `npm run ds:lint`: lint source against the design system rules. Not implemented yet, exits 1.
- `npm run ds:changes`: record which components changed against `master`. Stub for now, exits 0.
- `npm run ds:a11y`: run the accessibility checks on stories. Not implemented yet, exits 1.
- `npm run ds:visual`: run visual comparison of stories. Not implemented yet, exits 1.
- `npm run ds:audit`: run the full audit. Not implemented yet, exits 1.
- `npm run ds:workbench`: build the workbench data for Storybook. Stub for now, exits 0.
- `npm run prebuild-storybook`: runs `ds:tokens`, `ds:scan`, `ds:changes` and `ds:workbench` in order; npm runs it before `build-storybook`. Every step must exit 0 even with missing inputs, a shallow clone or no `master` ref.
