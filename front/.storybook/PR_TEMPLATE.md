# Design system: <one line on what this branch changes>

<!-- The `propose` skill fills this from the files named in each section. Keep every number traceable to a file. No em dashes. -->

## Review

<!-- The link to this PR's own Review page (https://pr-<n>.epic.hq.govocal.com/storybook/workbench/#/review), then the changes in order: subject and short sha. -->

## Design commits

<!-- From design-changes.json: kinds heal, lift and token, grouped by component, `subject` (sha). One heal or lift per commit. -->

| Component | Change | Commit |
|---|---|---|
| | | |

Not counted as design changes: <n> story commits, <n> tooling commits.

## Numbers

<!-- From .storybook/static/design-scan.summary.json and design-changes.json. -->

- Off-spec values: <before the design commits> before, <now> now (<delta>). Scanner rule changes: <delta, or none>.
- Components on tokens: <onTokens> of <components>.
- Visual run (`npm run ds:visual -- --compare`): <stories> stories, <diffs> diffs, <errors> errors. Expected diffs: <list or none>.

## Platform code

- This branch changes no platform code: the workbench reads the repo. `git diff --stat $(git merge-base HEAD origin/master) -- app ':!*.stories.tsx' ':!*/a11y.json' ':!app/design-system/tokens' ':!app/utils/storybook' ':!app/api/id_methods/__mocks__'` prints nothing.
- Heals and lifts go in their own small PRs off master, each one linked here: <list or none>.

## Accessibility

<!-- From a11y.json files and a11y-results.json. Wording: "checked by axe", "keyboard tested", "reviewed by agent on <date>". Never "compliant". -->

## Preview-grade

<!-- What reviewers should not read as final: see .storybook/AGENTS.md, "Preview-grade". -->

## Decisions for developers

<!-- Choices this branch leaves open (the app loading `tokens.css`, the back-office token set, Box spacing typed to the scale, ds:lint in ESLint). -->

## Checks run locally

- [ ] `npm run ds:check`
- [ ] `npm run typecheck`
- [ ] `npx jest <changed paths>`
- [ ] `npm run build-storybook`
- [ ] `npm run ds:visual -- --compare <baseline>`

This work is AI-assisted.
