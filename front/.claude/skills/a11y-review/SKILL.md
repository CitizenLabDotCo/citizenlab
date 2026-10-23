---
name: a11y-review
description: Use when asked to review the accessibility of one library component, or to fill or refresh its a11y.json checklist. Runs axe, contrast and keyboard checks on its stories and judges screenshots against WCAG 2.2 criteria. Never edits component code; fixes become heal tasks of category a11y.
---

# a11y-review

Review one component and write `app/component-library/components/<Name>/a11y.json`, next to its stories (for example `app/component-library/components/Button/a11y.json`), plus a short report. Read `front/.storybook/AGENTS.md` first if you have not this session. Run every command from `front/`.

## Input

```
a11y-review: <Name>
```

## Stop conditions

- **Never edit component code.** Only `a11y.json` and, when a state is missing, stories through the `story` skill in a separate commit. A failure becomes a heal task with `why: a11y, <criterion>`.
- **One component per run and per commit.**
- **Wording.** Write "checked", "reviewed on <date>", "keyboard tested", "checked by axe". Never "compliant", "conformant" or "certified".
- **No Storybook.** `ds:a11y` needs a running Storybook (dev or a served build). If none will start, stop and say so; do not fill criteria from source alone.

## Criteria

The ones that matter for the component's type, from WCAG 2.2 and the 2.1 basics:
`1.4.3` contrast, `1.4.10` reflow, `1.4.11` non-text contrast, `1.4.12` text spacing, `2.1.1` keyboard, `2.4.7` focus visible, `2.4.11` focus not obscured, `2.5.7` dragging movements, `2.5.8` target size (24 by 24), `3.2.6` consistent help, `3.3.7` redundant entry, `3.3.8` accessible authentication, `4.1.2` name, role, value. Mark the ones that do not apply `n/a`.

## Steps

- [ ] 1. `npm run storybook` (port 6006). List the component's stories in `http://localhost:6006/index.json`.
- [ ] 2. axe: `npm run ds:a11y -- --url http://localhost:6006 --stories '<story id prefix>--*'` (the other stories keep their results), then read the component's stories in `.storybook/static/a11y-results.json`: violations by rule and impact, `focusable`, and `play` for stories with a play function.
- [ ] 3. Contrast: the text and background tokens the component uses (Tokens panel, or its findings in `design-scan.json`), in both modes, from `tokens.meta.json` values. 4.5:1 for text, 3:1 for large text and non-text parts.
- [ ] 4. Keyboard: drive each interactive story with Tab, Shift+Tab, Enter, Space, Escape and the arrows its pattern needs; record focus order and what happened. A keyboard story is a `Keyboard` story whose `play` function uses `userEvent.tab()` and `expect(...).toHaveFocus()`; adding one is a story change (separate commit, then `ds:visual --stories` on the file to show the other stories did not move, and `ds:a11y --stories '*--keyboard'`). The A11y panel shows "keyboard tested" only when a `Keyboard` story's play passed.
- [ ] 5. Screenshot each state at 1280 and 390 and in the `ar` language (RTL); judge reflow, focus visibility and target size.
- [ ] 6. Write `a11y.json`:
  ```json
  {
    "component": "<Name>",
    "reviewedAt": "<YYYY-MM-DD>",
    "reviewer": "agent",
    "criteria": [
      { "id": "2.4.7", "name": "Focus visible", "result": "pass", "confidence": "high",
        "evidence": "keyboard run: ring on the button in Focus and after Tab", "note": "" }
    ]
  }
  ```
  `result`: `pass`, `fail`, `n/a`, `needs-human`. `confidence`: `high` when a computed check or a keyboard run backs it, `medium` when judged from a screenshot, `low` when inferred. What a model cannot settle (meaningful alternative text, whether an error message helps, cognitive load) is `needs-human`.
- [ ] 7. `npm run ds:check` (it fails while any `Components/` story has a critical axe violation; say so rather than hide it), then commit only `a11y.json`.

## Commit message

```
design-system(a11y): <Name> checklist, <p> pass, <f> fail, <h> need a person [AI-assisted]

Co-Authored-By: <the line your session gives>
```

## Report

```
Reviewed by agent on <date>: <Name>, <p> pass, <f> fail, <h> need a person, <n> n/a
axe: <violations by impact, or none>; keyboard tested: <stories>
Heal tasks (a11y):
<one block per fail>
Needs a person: <criteria and why>
```
