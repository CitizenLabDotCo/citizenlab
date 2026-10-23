---
name: propose
description: Use when asked to write or update the pull request text for the design-system branch. Assembles it from the Review page's "Copy for PR" block, the scanner summary and the branch's design commits, into .storybook/PR_TEMPLATE.md's shape. Drafts only; never opens, edits or comments on a pull request.
---

# propose

Draft the PR text for the branch. Read `front/.storybook/AGENTS.md` first if you have not this session. Run every command from `front/`.

## Input

```
propose [· base <ref>] [· review link <URL>]
```

## Stop conditions

- **Draft only.** Never run `gh pr`, never call the GitHub API to create or edit a pull request, issue, comment or label. Hand the text to the person.
- **Numbers from files, not memory.** Every number comes from `design-scan.summary.json`, `design-changes.json` or the Review page block. If a file is stale (`commit` in the summary or `head` in the changes file is not `HEAD`), refresh it first or say so.
- **Wording.** No em dashes. Accessibility: "checked", "reviewed on <date>", never "compliant". Say the work is AI-assisted.

## Steps

- [ ] 1. Refresh the inputs:
  ```
  npm run ds:scan
  npm run ds:changes
  ```
  `ds:changes` needs the merge-base with `master` (or `origin/master`); in a shallow clone it keeps the committed file and warns.
- [ ] 2. Get the Review block: open `<storybook>/workbench/#/review`, press "Copy for PR" and paste it in, or rebuild it from `design-changes.json` (design commits are kinds `heal`, `lift` and `token`; stories and tooling are listed apart, not counted as design changes).
- [ ] 3. Fill `.storybook/PR_TEMPLATE.md`, section by section: the Review block, the design commits grouped by component (subject and sha), the off-spec totals from the summary (before the design commits, now, and the scanner rule delta apart), the visual result from `visual-summary.json`, the accessibility state (`a11y.json` files, `a11y-results.json`), what is preview-grade, the decisions developers need to take.
- [ ] 4. Print the text. Write it to a file only if asked, outside the repo or in a scratch path.

## Report

The filled template, then one line: `Inputs: summary <commit>, changes <generatedAt>, <n> design commits`.
