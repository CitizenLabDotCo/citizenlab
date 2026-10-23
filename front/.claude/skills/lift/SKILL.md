---
name: lift
description: Use when asked to lift (move) a local piece of the redesigned back office (`app/containers/Admin/projects/project/backofficeRedesign/`) into the component library, so other pages can use it. One component per commit, tokens only, stories for every state.
---

# lift

Move one local component of `backofficeRedesign` into `app/component-library/components/<Name>/`, on tokens, with stories, and point the original import at it. Read `front/.storybook/AGENTS.md` first if you have not this session. Run every command from `front/`.

## Input

```
lift: <Name> · <original file> [· <dir>]
```

or a name with its folder. To choose what to lift, rank the local pieces of `backofficeRedesign` by how many files use them (the `usages` and `findings` of `.storybook/static/design-scan.json`, `styled-block` and local components).

## Stop conditions

- **Mode safety.** The lifted component renders the same on the redesigned page as before: every value it reads becomes a token whose `redesign` value equals the value it has now (`node .claude/skills/heal/mode-check.cjs --file <original file> --token <token> --now <value> --mode redesign` for each). If the original also renders outside the redesign scope, the `today` value must match too (the check says which).
- **Style only.** The lift moves code and swaps values for tokens. It does not change behaviour, data, copy or props beyond what the move needs. Logic tied to the page (queries, routing, page state) stays where it is: lift the presentational part only, or stop.
- **One component per commit.** A piece that needs a second piece lifted first: lift that one first, in its own commit.
- **Name clash.** A library component of that name or role exists already: stop and report; the right move may be a heal to the existing one.
- **No token fits** a value: stop (a new token is its own `design-system(token)` commit).

## Steps

- [ ] 1. `git status --short`. `npm run ds:scan`. Note the page's findings count for the original file.
- [ ] 2. `npm run storybook` (port 6006); `npm run ds:visual -- --baseline <scratch>/before`. Screenshot the route where it shows, if you have the platform running.
- [ ] 3. Create `app/component-library/components/<Name>/index.tsx`: the component, values read from `t` (`design-system/tokens/tokens`), `{...gvTag('<Name>')}` on its root element (`design-system/tags`). Export it from `app/component-library/index.tsx`.
- [ ] 4. Stories: `<Name>.stories.tsx`, `title: 'Components/<Category>/<Name>'`, `tags: ['bo']`, every state (follow the `story` skill).
- [ ] 5. Replace the original: the old file imports the library component (or the old file goes and its importers switch). Nothing else on the page changes.
- [ ] 6. Checks:
  ```
  npm run ds:check
  npx jest app/component-library/components/<Name> <original folder>
  npm run typecheck
  npm run ds:visual -- --compare <scratch>/before --summary <scratch>/visual.json
  npm run ds:scan
  ```
  The compare shows only the new stories. The scan lists `<Name>` as a component with its usages.
- [ ] 7. Commit only your files, with `.storybook/static/design-scan.summary.json`.

## Commit message

```
design-system(lift): <Name> from backofficeRedesign/<dir> [AI-assisted]

Original: <original file path>.
Tokens: <list>. Stories: <states>. Score <before> → <after>.

Co-Authored-By: <the line your session gives>
```

## Report

```
Lifted: <Name> from <original path> to app/component-library/components/<Name>/ (<commit sha>)
Tokens: <list>; mode check ok for each
Stories: <states>
Score: <before> → <after>; checks ok
Left behind (page logic): <list or none>
```
