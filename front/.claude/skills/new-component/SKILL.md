---
name: new-component
description: Use when asked to create a new component in the library from a description or a Figma frame. Scaffolds it on tokens only, with stories, autodocs and an accessibility checklist stub. One component, in its own small branch and PR off master.
---

# new-component

Create one component in `app/component-library/components/<Name>/`. Read `front/.storybook/AGENTS.md` first if you have not this session. Run every command from `front/`.

A new component is platform code. It never goes on `design-system/workbench`: that branch reads the repo and never changes the platform. Set up the two checkouts as in the `heal` skill: the tools checkout of `design-system/workbench` for the commands, and a new worktree for the component (`git worktree add ../new-<name> -b design-system/new-<name> origin/master`), whose Storybook runs on port 6007.

## Input

```
new-component: <Name> · <description or Figma frame URL> [· office bo|fo|shared]
```

With a Figma frame, read it through the Figma MCP in your terminal. The workbench never reads Figma; the code is the source of truth once it exists.

## Stop conditions

- **Tokens only.** The component reads tokens, so master must have them (stop 1 of the `heal` skill); until then, stop and report that it waits for that decision. A value in the design has no token: stop and list it; a new token is a change to `tokens.source.json`, done before the component.
- **It exists.** A library component of that role exists (`app/component-library/index.tsx`, the gallery): stop and report; extend or heal the existing one instead.
- **One component per PR.** A part that is a component of its own is created first, in its own branch and PR.
- **No page edits.** Using the new component on a page is a heal or a lift, its own PR.

## Steps

- [ ] 1. Set up the two checkouts. Check the library and `design-scan.json` for an existing component of the same role.
- [ ] 2. `index.tsx`: props typed, values in styled templates `var(--gv-…)` (files in `app/component-library/` may not import `t` from `design-system/`: dependency-cruiser `no-import-to-component-library`, see step 6 of the `heal` skill), Tier 2 tokens for colours, `--gv-space-N` steps for spacing inside it, no margin on its root (space between components belongs to `Box`). Export it from `app/component-library/index.tsx`.
- [ ] 3. `<Name>.stories.tsx`: `title: 'Components/<Category>/<Name>'`, `tags: ['autodocs', '<office>']`, `parameters: { gv: { figma: '<frame URL>' } }` when it came from Figma (else `gv: {}`), `Default` first and every state (follow the `story` skill).
- [ ] 4. `a11y.json` stub at `app/component-library/components/<Name>/a11y.json`, next to the stories:
  ```json
  { "component": "<Name>", "reviewedAt": null, "reviewer": "agent", "criteria": [] }
  ```
  The `a11y-review` skill fills it.
- [ ] 5. A test, `<Name>.test.tsx`, for its props and roles (`@testing-library/react`, like the other library tests).
- [ ] 6. Checks, in the component worktree:
  ```
  npx eslint <changed files>
  npx jest app/component-library/components/<Name>
  npm run typecheck
  ```
  and from the tools checkout, with the component's Storybook on 6007:
  ```
  npm run ds:a11y -- --url http://localhost:6007 --stories '<story id prefix>--*' --out <scratch>/a11y.json
  ```
  A critical axe violation is a stop: fix it in the component.
- [ ] 7. Commit only the new folder and `app/component-library/index.tsx` (`git add <paths>`). Do not push and do not open the PR: report, and a person opens it.

## Commit message

```
design-system(lift): <Name>, new library component [AI-assisted]

Source: <description, or the Figma frame URL>.
Tokens: <list>. Stories: <states>.

Co-Authored-By: <the line your session gives>
```

## Report

```
New: <Name> in app/component-library/components/<Name>/ (<commit sha> on design-system/new-<name>, off master <sha>)
Source: <description or frame>
Tokens: <list>; missing tokens: <list or none>
Stories: <states>; a11y.json stub written
Checks: eslint ok, jest <n> passed, typecheck ok, axe <criticals> criticals
```
