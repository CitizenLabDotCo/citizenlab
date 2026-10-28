# Design workbench: a reading guide

The workbench is a page served next to Storybook (`/storybook/workbench/`).
A designer opens a component's story, selects a part of it, and sees each
of its values with the line of code that writes it. They can swap a value
for a design token, or type a new one. The Review page lists those changes,
and Send gives the designer a text for their coding agent. The agent runs one
script that makes the exact line edits and opens a draft review here on
GitHub. A developer reviews it like any other.

No platform code depends on the workbench. Storybook and the scripts read
the platform's code; only a change the designer sends edits it, through a
review.

## What the branch holds

`git diff --numstat origin/master...HEAD -- front` at 1ebd37e:

| Part                        | Lines added | Files |
| --------------------------- | ----------: | ----: |
| Workbench source            |      28,542 |   105 |
| Stories and a11y checklists |      15,546 |   221 |
| Design-system scripts       |      13,429 |    66 |
| Tests                       |      12,674 |    74 |
| Generated files             |      12,584 |     8 |
| Other                       |       5,969 |    42 |
| Total                       |      88,744 |   516 |

Stories, tests and generated files are about half. The code to review
closely is the four places below.

## Read these first

1. **`scripts/design-system/index/`**: `npm run ds:index`. It parses every
   `.ts` and `.tsx` file with Babel and writes, for each styled-components
   template, its text, its declarations and what each `${}` reads (a theme
   path, a constant, a prop, a map, a literal). Start at `index.ts`, then
   `templates.ts` and `reads.ts`.
2. **`.storybook/workbench/src/lib/trace/`**: the trace engine. For a
   selected element it finds the styled component that owns each winning
   CSS rule, aligns that component's runtime rules with one template of the
   index, and follows the value back to the line that writes it. When any
   join is not exact it answers "not traced" with the reason. Start at
   `index.ts` (traceElement), then `owner.ts`, `align.ts` and `trace.ts`.
3. **`.storybook/workbench/src/lib/trace/codemod.ts`**: how a token swap
   becomes a line edit. It replaces only the traced expression, and checks
   with Babel that the line's tokens are unchanged apart from that
   expression. Anything else is left for a person.
4. **`scripts/design-system/send.js`**: the script the designer's agent
   runs. It reads the files on GitHub, applies each edit only when it is a
   token swap on the line the workbench saw, and makes one commit per
   change. It pushes only a branch named `design-system/…`, and opens the
   review into `design-system/workbench` (or `master`): a draft until the
   designer names a reviewer.

## Generated files

Each is written by the script named next to it; do not edit them by hand.
`npm run ds:prepare`, which `build-storybook` runs, runs `ds:tokens`,
`ds:scan`, `ds:changes`, `ds:index` and `ds:workbench`. The others are run
when their checks are updated.

| File                                                                   | Script                | Committed |
| ---------------------------------------------------------------------- | --------------------- | --------- |
| `app/design-system/tokens/tokens.css`, `tokens.ts`, `tokens.meta.json` | `ds:tokens`           | yes       |
| `.storybook/static/design-scan.json`                                   | `ds:scan`             | no        |
| `.storybook/static/design-scan.summary.json`                           | `ds:scan`             | yes       |
| `.storybook/static/design-changes.json`                                | `ds:changes`          | yes       |
| `.storybook/static/routes.fixture.json`                                | `ds:routes-fixture`   | yes       |
| `.storybook/static/a11y-results.json`                                  | `ds:a11y`             | yes       |
| `.storybook/static/visual-summary.json`                                | `ds:visual`           | yes       |
| `.storybook/static/story-audit.json`                                   | `ds:audit-stories`    | yes       |
| `.storybook/static/design-index/`                                      | `ds:index`            | no        |
| `.storybook/static/workbench/`                                         | `ds:workbench` (Vite) | no        |

## Checking it yourself

- `npm run ds:index` prints what it indexed: files, templates, declarations
  and the share of `${}` expressions it can read.
- `npm run ds:trace-check -- --url <storybook base>` opens the workbench in
  Chromium and checks 14 values against the lines they come from.
- `npm run ds:demo-check -- --url <storybook base>` goes through the demo on
  ten components: select, read every value's source, change one value,
  Review, Send.
- Both take `--state <file>`, a Playwright storageState, to run against a
  Storybook behind a sign-in such as the epic's.
- In DevTools on the canvas, an element's value can be checked against the
  line the Design tab names.
