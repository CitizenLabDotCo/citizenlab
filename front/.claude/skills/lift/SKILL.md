---
name: lift
description: Use when asked to lift (move) a local piece of the redesigned back office (`app/containers/Admin/projects/project/backofficeRedesign/`) into the component library, so other pages can use it. One component, stories for every state, in its own small branch and PR off master.
---

# lift

Move one local component of `backofficeRedesign` into `app/component-library/components/<Name>/`, with stories, and point the original import at it. Read `front/.storybook/AGENTS.md` first if you have not this session. Run every command from `front/`.

A lift is platform code. It never goes on `design-system/workbench`: that branch reads the repo and never changes the platform. Each lift is its own branch off master and its own PR, opened by a person. Set up the two checkouts as in the `heal` skill: the tools checkout of `design-system/workbench` for the commands, and a new worktree for the lift:

```
git fetch origin master
git worktree add ../lift-<name> -b design-system/lift-<name> origin/master
```

Its Storybook runs on port 6007 (`npx storybook dev -p 6007 --ci --no-open`); point the tools at it with `--url http://localhost:6007`.

## Input

```
lift: <Name> · <original file> [· <dir>]
```

or a name with its folder. To choose what to lift, rank the local pieces of `backofficeRedesign` by how many files use them (the `usages` and `findings` of `.storybook/static/design-scan.json`, `styled-block` and local components).

## Stop conditions

- **The look changes.** The lifted component renders the same on the page as before: every value keeps the value it has now. A value moved onto a token needs master to have the tokens (see stop 1 of the `heal` skill); until then the lift keeps its values as they are, and the heal to tokens follows later.
- **Style only.** The lift moves code. It does not change behaviour, data, copy or props beyond what the move needs. Logic tied to the page (queries, routing, page state) stays where it is: lift the presentational part only, or stop.
- **One component per PR.** A piece that needs a second piece lifted first: lift that one first, in its own branch and PR.
- **Name clash.** A library component of that name or role exists already: stop and report; the right move may be a heal to the existing one.

## Steps

- [ ] 1. Set up the two checkouts. In the tools checkout, `npm run ds:scan`. Note the page's findings count for the original file.
- [ ] 2. Start the lift worktree's Storybook on port 6007; from the tools checkout, `npm run ds:visual -- --url http://localhost:6007 --baseline <scratch>/before`. Screenshot the route where it shows, if you have the platform running.
- [ ] 3. In the lift worktree, create `app/component-library/components/<Name>/index.tsx`: the component, with its values as they are now. Export it from `app/component-library/index.tsx`.
- [ ] 4. Stories: `<Name>.stories.tsx`, `title: 'Components/<Category>/<Name>'`, `tags: ['bo']`, every state (follow the `story` skill). An `a11y.json` checklist beside it (follow the `a11y-review` skill).
- [ ] 5. Replace the original: the old file imports the library component (or the old file goes and its importers switch). Nothing else on the page changes.
- [ ] 6. Checks, in the lift worktree:
  ```
  npx eslint <changed files>
  npx jest app/component-library/components/<Name> <original folder>
  npm run typecheck
  ```
  and from the tools checkout, with the lift Storybook still on 6007:
  ```
  npm run ds:visual -- --url http://localhost:6007 --compare <scratch>/before --summary <scratch>/visual.json
  npm run ds:a11y -- --url http://localhost:6007 --stories '<story id prefix>--*' --out <scratch>/a11y.json
  ```
  The compare shows only the new stories. A new critical axe violation is a stop: fix it in the lift.
- [ ] 7. Commit only your files in the lift worktree (`git add <paths>`). Do not push and do not open the PR: report, and a person opens it.

## Commit message

```
design-system(lift): <Name> from backofficeRedesign/<dir> [AI-assisted]

Original: <original file path>.
Stories: <states>. Visual compare: <stories> stories, <diffs> diffs.

Co-Authored-By: <the line your session gives>
```

## Report

```
Lifted: <Name> from <original path> to app/component-library/components/<Name>/ (<commit sha> on design-system/lift-<name>, off master <sha>)
Stories: <states>
Checks: eslint ok, jest <n> passed, typecheck ok, visual <stories> stories <diffs> diffs, axe <criticals> new criticals
Left behind (page logic): <list or none>
```
