---
name: new-component
description: Use when asked to create a new component in the library from a description or a Figma frame. Scaffolds it on tokens only, with stories, autodocs and an accessibility checklist stub. One component per commit.
---

# new-component

Create one component in `app/component-library/components/<Name>/`. Read `front/.storybook/AGENTS.md` first if you have not this session. Run every command from `front/`.

## Input

```
new-component: <Name> · <description or Figma frame URL> [· office bo|fo|shared]
```

With a Figma frame, read it through the Figma MCP in your terminal. The workbench never reads Figma; the code is the source of truth once it exists.

## Stop conditions

- **Tokens only.** A value in the design has no token: stop and list it. A new token is its own `design-system(token)` commit in `app/design-system/tokens/tokens.source.json` (then `npm run ds:tokens`), done before the component.
- **It exists.** A library component of that role exists (`app/component-library/index.tsx`, the gallery): stop and report; extend or heal the existing one instead.
- **One component per commit.** A part that is a component of its own is created first, in its own commit.
- **No page edits.** Using the new component on a page is a heal or a lift, not part of this commit.

## Steps

- [ ] 1. `git status --short`. Check the library and `design-scan.json` for an existing component of the same role.
- [ ] 2. `index.tsx`: props typed, values from `t` (`design-system/tokens/tokens`), Tier 2 tokens for colours, `--gv-space-N` steps for spacing inside it, no margin on its root (space between components belongs to `Box`), `{...gvTag('<Name>')}` on the root element (`component-library/utils/gvTag`). Export it from `app/component-library/index.tsx`.
- [ ] 3. `<Name>.stories.tsx`: `title: 'Components/<Category>/<Name>'`, `tags: ['autodocs', '<office>']`, `parameters: { gv: { figma: '<frame URL>' } }` when it came from Figma (else `gv: {}`), `Default` first and every state (follow the `story` skill).
- [ ] 4. `a11y.json` stub at `app/component-library/components/<Name>/a11y.json`, next to the stories:
  ```json
  { "component": "<Name>", "reviewedAt": null, "reviewer": "agent", "criteria": [] }
  ```
  The `a11y-review` skill fills it.
- [ ] 5. A test, `<Name>.test.tsx`, for its props and roles (`@testing-library/react`, like the other library tests).
- [ ] 6. Checks:
  ```
  npm run ds:check
  npx jest app/component-library/components/<Name>
  npm run typecheck
  npm run ds:scan
  ```
  The scan lists `<Name>` with score 1 and no off-spec findings.
  `ds:check` passes unless the committed `a11y-results.json` has a new critical axe violation (one not in `scripts/design-system/a11y-known.json`); if your change fixes a known one, remove its entry there.
- [ ] 7. Commit only the new folder, `app/component-library/index.tsx` and `.storybook/static/design-scan.summary.json`.

## Commit message

```
design-system(lift): <Name>, new library component [AI-assisted]

Source: <description, or the Figma frame URL>.
Tokens: <list>. Stories: <states>.

Co-Authored-By: <the line your session gives>
```

The `lift` kind makes the Review page count it as a design change.

## Report

```
New: <Name> in app/component-library/components/<Name>/ (<commit sha>)
Source: <description or frame>
Tokens: <list>; missing tokens: <list or none>
Stories: <states>; a11y.json stub written
Checks: ds:check ok, jest <n> passed, typecheck ok, score 1
```
