---
name: story
description: Use when a component needs missing states in its Storybook stories (hover, focus, disabled, error, loading, empty, long content, RTL, open), when a heal or lift touches a state that has no story, or when asked to add stories for a component. Stories only, never the component's code.
---

# story

Add the missing states of one existing component to its `*.stories.tsx`. Read `front/.storybook/AGENTS.md` first if you have not this session. Run every command from `front/`.

## Input

A component name (`Button`), its folder, or a heal task whose `check:` line names a story. Optional: the states wanted. Without a list, add every state the component's props and styles support and that has no story yet.

## Stop conditions

- **Stories only.** A state needs a change to the component (a missing prop, a bug, a layout fault). Do not fix it here: write it down as a heal or fix candidate in the report.
- **One component per commit.**
- **A state that looks like Default.** Every state must render differently from the `Default` story. If it does not (the component has no hover style, say), drop the story and say so; never fake a state with wrapper styles.
- **A play function that throws.** `ds:visual` reports it as an error; fix the story or drop it.

## Rules

- File beside the component: `app/component-library/components/<Name>/<Name>.stories.tsx`, or beside a UI or admin component (`app/components/UI/<Name>/`, `app/components/admin/<Name>/`). Stories are not product code; the component's source stays untouched.
- `title: 'Components/<Category>/<Name>'`, categories `Actions`, `Data display`, `Feedback`, `Forms`, `Layout`, `Overlays`, `Typography`. Pages and patterns use `Pages/…` and `Patterns/…`.
- `tags`: the office, `['shared']`, `['bo']` (back office) or `['fo']` (front office). Check with the scan: admin routes only is `bo`, public only is `fo`, both is `shared`.
- `parameters: { gv: {} }` on the meta. `new-component` puts the Figma frame there (`gv: { figma: '<url>' }`).
- `Default` comes first. Export names in PascalCase, one state each: `Hover`, `Focus`, `Active`, `Disabled`, `Error`, `Loading`, `Empty`, `LongContent`, `Open`, `RTL`.
- **Hover and Focus** use `storybook-addon-pseudo-states` on the element that carries the style: `parameters: { pseudo: { hover: ['button'] } }`, `{ focusVisible: ['button'] }`; for an input that styles `:focus`, set both `focus` and `focusVisible` on the control. When the ring hangs on a class the addon cannot set (a focus-visible class), use a `play` step with `userEvent.tab()` instead.
- **RTL** uses the `ar` language global, which sets the theme's `isRtl` as the app does: `globals: { lang: 'ar' }`. Never wrap a story in `dir="rtl"`: with both, flex direction flips twice.
- Data: the stories run with MSW (`.storybook/mockServer.ts`); a story that needs other data sets `parameters.mockEndpoints` the way `IdeaCard` does.
- Values in story-only wrappers come from tokens too (`t.space[4]`), so `ds:lint` stays quiet.

## Steps

- [ ] 1. `git status --short` (stage only your files later). Read the component and its existing stories; list the states its props and styles support.
- [ ] 2. `npm run storybook` in another terminal (port 6006), then `npm run ds:visual -- --baseline <scratch>/before`.
- [ ] 3. Write the stories.
- [ ] 4. Check each new state against `Default` by eye in Storybook, at 1280 and 390 wide.
- [ ] 5. Checks:
  ```
  npm run ds:check
  npx jest <component folder>
  npm run typecheck
  npm run ds:visual -- --compare <scratch>/before --summary <scratch>/visual.json
  ```
  The compare must show only the new stories (`no baseline screenshot`) and no error. Existing stories must not change.
  `ds:check` passes unless the committed `a11y-results.json` has a new critical axe violation (one not in `scripts/design-system/a11y-known.json`); if your change fixes a known one, remove its entry there.
- [ ] 6. Commit:
  ```
  git add <the stories file>
  git commit
  ```

## Commit message

```
design-system(stories): <Name> <State>, <State> and <State> stories [AI-assisted]

Co-Authored-By: <the line your session gives>
```

## Report

```
Stories: <Name>, added <states>, dropped <states and why, or none> (<commit sha>)
Checks: ds:check ok, jest <n> passed, typecheck ok, visual <stories> stories, 0 diffs in existing stories
Found while writing (heal or fix candidates): <list or none>
```
