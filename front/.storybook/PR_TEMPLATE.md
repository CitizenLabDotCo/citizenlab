# Design system: <one line on what this branch changes>

<!-- The `propose` skill fills this from the files named in each section. Keep every number traceable to a file. No em dashes. -->

## Review

<!-- Paste the "Copy for PR" block from the workbench Review page (<storybook>/workbench/#/review). -->

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
- Visual run (`npm run ds:visual -- --compare`, mode today): <stories> stories, <diffs> diffs, <errors> errors. Expected diffs: <list or none>.

## Mode safety

- Outside the redesign scope (`ModeScope`, `data-gv-mode="redesign"`) every healed value renders as before: each heal's token has a `today` value equal to the value it replaced.
- Inside the scope: <what changes on the redesigned pages>.

## Accessibility

<!-- From a11y.json files and a11y-results.json. Wording: "checked by axe", "keyboard tested", "reviewed by agent on <date>". Never "compliant". -->

## Preview-grade

<!-- What reviewers should not read as final: see .storybook/AGENTS.md, "Preview-grade". -->

## Decisions for developers

<!-- Choices this branch leaves open (Box spacing typed to the scale, ds:lint in ESLint, widening the redesign scope). -->

## Checks run locally

- [ ] `npm run ds:check`
- [ ] `npm run typecheck`
- [ ] `npx jest <changed paths>`
- [ ] `npm run build-storybook`
- [ ] `npm run ds:visual -- --compare <baseline>`

This work is AI-assisted.
