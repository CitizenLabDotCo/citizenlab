---
name: heal
description: Use when given a heal task (the three lines `heal:`, `why:`, `check:` copied from the workbench Usage tab or Changes drawer), a merge task (`merge:`, `why:`, `check:`, from the Usage tab's Look-alikes) or asked to replace an off-spec value, a legacy theme read or local markup with a design token or a library component. One value or one swap in one component, style only, in its own small branch and PR off master.
---

# heal

Replace one off-spec value with a token read (or local markup with the library component), prove nothing else changed, and commit it alone on its own branch off master. One value is one raw → token pair in one file: every occurrence of that pair in the file goes into the same commit, a second pair is a second heal. Read `front/.storybook/AGENTS.md` first if you have not this session. Run every command from `front/`.

A heal is platform code. It never goes on `design-system/workbench`: that branch reads the repo and never changes the platform. Each heal is its own branch off master and its own PR, opened by a person.

## Two checkouts

- **Tools**: a checkout of `design-system/workbench` (the scanner, `ds:visual`, `ds:a11y`, the token files). Use it read-only during a heal; it serves only the commands.
- **Heal**: a new worktree off master, where the edit lands:
  ```
  git fetch origin master
  git worktree add ../heal-<component>-<what> -b design-system/heal-<component>-<what> origin/master
  ```
  Run `npm ci` there once. Its Storybook is master's Storybook: start it with `npx storybook dev -p 6007 --ci --no-open` and point the tools at it with `--url http://localhost:6007`.

## Input: the heal task

```
heal: <Component> · <file>:<line> · <raw value> → <token>
why: <finding category>, scan confidence <high|medium|low>
check: story <story id>, routes <list>
```

- The token slot may read `A or B` (a legacy key that maps to two tokens) or `(choose a token)`. Pick the one whose value equals what the code renders now (step 4). If none does, stop.
- A task typed by a person may lack lines. Ask for the file, line and value if you cannot find them; never guess the component.

## Stop conditions

Stop, change nothing (or revert what you changed), and report why with the evidence. Do not look for a way around a stop.

1. **Master has no tokens.** A heal to a token needs `app/design-system/tokens/` on master, the app loading `tokens.css`, and the app writing each city's colours into the `--gv-tenant-*` slots (without that, every platform shows `tokens.css`'s default pink, `#ef0071`, wherever a tenant colour is read). Check with `git ls-tree -r --name-only origin/master -- app/design-system/tokens` and `git grep -l -e '--gv-tenant-primary' origin/master -- app ':!app/design-system/tokens' ':!*.stories.tsx'`. Until that lands (the FE lead decides, in its own PR), a heal to a token waits; report it as ready with the evidence. A swap to a library component does not need tokens and can go ahead.
2. **The look changes.** The token's value must equal the value the code renders now, everywhere the file renders. A change to the look is a token change or a design change, not a heal.
3. **Style only.** The heal would change data, handlers, routing, copy, props an API exposes, or component structure beyond swapping local markup for the library component.
4. **One component per PR.** The heal needs edits inside a second component (call sites that only gain a layout spacing prop do not count, see the spacing rule).
5. **No token fits.** No token has the value, or a colour in a component would need a Tier 1 primitive and no Tier 2 colour has the same value, or the only token with the value means something else (`--gv-chart-grid` for a card background). A new token is a change to `tokens.source.json`, not part of a heal.
6. **Tenant slots.** A `--gv-tenant-*` or `--gv-color-tenant-*` token replaces only a read of the tenant theme key it lists in `legacy` (`theme.colors.tenantPrimary`), never a hard-coded colour.
7. **Spacing that is not a scale step**, or a two-sided spacing heal with more than 10 call sites (report the count; the person decides).
8. **Checks fail** after the edit (lint, typecheck, tests, or a visual diff outside the healed component's stories) and the cause is the heal.
9. **The finding is gone or moved** (the file or line no longer holds the raw value on master).

## Steps

- [ ] 1. Set up the two checkouts above. In the heal worktree, `git status --short` is clean and `git rev-parse --short HEAD` is `<sha>`, the base, for the screenshot folder.
- [ ] 2. In the tools checkout, `npm run ds:scan`. Print the component's score before:
  ```
  node -e 'const s=require("./.storybook/static/design-scan.json");const c=s.components.find(c=>c.component===process.argv[1]);console.log(c?`${c.component} score ${c.score} ${c.status} offSpec ${["px","hex","rgba","named-color","layout-spacing"].reduce((n,k)=>n+c.counts[k],0)}`:"not in scan")' <Component>
  ```
  A container (a page or a part of one, not a library, `UI/` or `admin/` component) is not in `components` and prints `not in scan`. Report its file counts instead, with the same weights (token reads / (token reads + 0.5 legacy + off-spec)):
  ```
  node -e 'const s=require("./.storybook/static/design-scan.json");const f=s.findings.filter(x=>x.file===process.argv[1]);const n=k=>f.filter(x=>k(x.category)).length;const off=n(c=>["px","hex","rgba","named-color","layout-spacing"].includes(c)),leg=n(c=>c.startsWith("legacy")),tr=n(c=>c==="token-var");console.log(`score ${(tr/(tr+0.5*leg+off||1)).toFixed(3)} offSpec ${off} legacy ${leg} tokenReads ${tr}`)' <file>
  ```
  Open `<file>:<line>` in the heal worktree and confirm the raw value is there (stop 9).
- [ ] 3. Check stop 1 for a token heal.
- [ ] 4. Resolve the value the code renders now. A literal is itself. A legacy read (`theme.borderRadius`, `colors.x`, `bo.x`, `stylingConsts.x`) is the value in its source (`app/component-library/utils/styleUtils.ts`, where `colors`, `bo`, `stylingConsts` and `getTheme` live); a number used as px is `<n>px`. A legacy key in a token's `legacy` list is not proof the values match: `bo.borderRadius` is `8px`, `--gv-radius-control` is `3px`. Compare with the token's value:
  ```
  node -e 'const t=require("./app/design-system/tokens/tokens.meta.json").find(t=>t.name===process.argv[1]);console.log(t?t.value:"no such token")' <token>
  ```
  Different values is stop 2. Tier and meaning are yours to check (stop 5).
- [ ] 5. The healed state needs a story. If master has none, add it in the heal branch (see the `story` skill), in its own `design-system(stories)` commit first, so the baseline holds it. Start the heal worktree's Storybook on port 6007 and save the baseline from the tools checkout:
  ```
  npm run ds:visual -- --url http://localhost:6007 --baseline <scratch>/before
  ```
  A file that only one stories file renders (`grep -rl` its import name across `*.stories.tsx` and the files that import it) may use `--stories '<story prefix>--*'`; say so in the commit. Copy `<scratch>/before/desktop__<story id>.png` to `<scratch>/heal/before.png`.
- [ ] 6. Edit in the heal worktree. Use `var(--gv-…)` in CSS strings, or `t` from `design-system/tokens/tokens` (`t.radius.control`, `t.space[4]`) in TS and styled templates once master has it. Files in `app/component-library/` may not import from `design-system/` (dependency-cruiser `no-import-to-component-library`): write `var(--gv-…)` there. `rgba(colors.x, 0.5)` becomes `color-mix(in srgb, var(--gv-…) 50%, transparent)`. For spacing, follow the two-sided rule below.
- [ ] 7. Scope, then checks. Scope first, in the heal worktree:
  ```
  git diff --name-only --relative | sed -nE 's#^app/component-library/components/([^/]*)/.*#\1#p; s#^app/components/(UI|admin)/([^/]*)/.*#\1/\2#p' | sort -u
  git diff -U0
  ```
  The first prints the components with edits. More than one is stop 4, unless the others only gained a spacing prop at a call site. In the second, every changed line is a style value, a token import, a story, or a call-site spacing prop; anything else (a handler, a condition, copy, a prop of the component's API) is stop 3. Then, in the heal worktree:
  ```
  npx eslint <changed files>
  npx jest <component folder>
  npm run typecheck
  ```
  and from the tools checkout, with the heal Storybook still on 6007:
  ```
  npm run ds:visual -- --url http://localhost:6007 --compare <scratch>/before --summary <scratch>/visual.json
  npm run ds:a11y -- --url http://localhost:6007 --stories '<story prefix>--*' --out <scratch>/a11y.json
  ```
  On a small machine stop Storybook while `typecheck` runs; the two together run out of memory. The compare counts every changed pixel, so a corner radius off by a few px shows. A heal shows no diff at all; a story added in step 5 shows as `no baseline screenshot` in that story only. Anything else is stop 8. A new critical axe violation in `<scratch>/a11y.json` is stop 8 too.
- [ ] 8. Screenshot the healed story after:
  ```
  npm run ds:visual -- --url http://localhost:6007 --baseline <scratch>/after --stories <story id>
  ```
  Copy `desktop__<story id>.png` to `<scratch>/heal/after.png`. Off master the two shots go in the PR description, not in the heal branch; stacked on the workbench they go in the branch for the Review page (below).
- [ ] 9. Commit only your files in the heal worktree:
  ```
  git add <component files> <call-site files> <stories>
  git commit
  ```
  Do not push and do not open the PR unless the person asks for that by name: report, and a person opens it.

## Merge into: a look-alike

A `merge:` task (the Usage tab's Look-alikes section) swaps homemade markup for the library component that covers it:

```
merge: <local name> · <file>:<line> · <styled block> → <Component> (<library file>)
why: look-alike, homemade markup the library component covers
check: story <library story id>, routes <list>
```

It follows the steps above with these differences. One look-alike is one merge and one commit; the branch is `design-system/merge-<file name>-<component>`.

- **The look moves to the library's.** Stop 2 does not apply as written: the look-alike may differ from the library component, and the merge brings it in line. Pick the library variant closest to the look now (`buttonStyle`, `size`, `icon`); the diff in the compare is expected only in the stories and routes that render the file, and the before and after shots go in the PR so the reviewer sees the change. A difference the library cannot express (a colour no `buttonStyle` has, a layout the component does not allow) is a stop: report it, it is a design decision.
- **Same behaviour.** The handlers, `type`, `disabled`, `aria-*`, `data-testid` and the children move to the library component's props unchanged. A prop the library component does not take, or a handler it would call differently (`onClick` with another event), is stop 3. A `styled.a` or a styled `Link` is a merge into `ButtonWithLink` only when it looks like a button; a text link stays.
- **Remove the styled block** and any style rule only it used. Imports come from the library barrel (`component-library`) the way the file's other imports do.
- **No tokens needed.** Stop 1 does not apply.
- **Commit message:**
  ```
  design-system(merge): <local name> in <file name> → <Component> [AI-assisted]

  <file>:<line>, look-alike of <Component>. Variant <props>. Looks: <same | differs, see the shots>.
  Visual compare: <stories> stories, <diffs> diffs (<where>).

  Co-Authored-By: <the line your session gives>
  ```

## Two-sided spacing rule

A component owns only its inside spacing. The space between components belongs to the layout primitive (`Box`), in scale steps `--gv-space-N`.

- **Inside spacing** (padding inside the component, gaps between its own parts): heal in place to a space token.
- **Outside spacing** (a margin on the component's root, or padding that only spaces it from its neighbours): it leaves the component. In the same commit:
  1. Find the call sites: `node -e 'require("./.storybook/static/design-scan.json").usages.filter(u=>u.component===process.argv[1]).forEach(u=>console.log(u.file+":"+u.line))' <Component>`. More than 10: stop 7.
  2. The value must be a scale step: a `--gv-space-N` whose value equals it (`0`, `4`, `8`, `12`, `16`, `20`, `24`, `28`, `32`, `40`, `48`, `64`, `80`, `96` px; `36`, `44` or `56` are not steps). Else stop 7.
     ```
     node -e 'const v=process.argv[1];const s=require("./app/design-system/tokens/tokens.meta.json").filter(t=>/^--gv-space-\d+$/.test(t.name)&&t.value===v);console.log(s.length?s[0].name:"not a scale step")' <value>
     ```
  3. Remove the margin from the component.
  4. At each call site give the same space to the layout primitive: the component's own Box margin props if it takes them (`mb={t.space[4]}`), else the gap or padding of the `Box` that already holds it, else a `<Box mb={t.space[4]}>` wrapper. If a wrapper changes layout (a flex or grid child), stop 3.
- **Call-site findings** (`layout-spacing`, a literal on a `Box` prop): one-sided, replace the literal with the scale step.

## Stacked on the workbench

Until the workbench is on master, a design PR that should have its own Review page (the workbench in its epic) branches off `origin/design-system/workbench` and its PR merges into `design-system/workbench`. The steps above hold, with these differences:

- **Stop 1 does not apply**: the tokens are on the base. If the app does not load `tokens.css` yet (`grep -n "tokens.css" app/containers/App/index.tsx` prints nothing), the PR's first commit is the setup, alone, as `design-system(setup): the app loads the tokens and writes each city's colours [AI-assisted]`: `import 'design-system/tokens/tokens.css';` in `app/containers/App/index.tsx`, and `app/containers/App/TenantTokens.tsx`, rendered inside that file's `ThemeProvider`, writing the theme's `colors.tenantPrimary`, `colors.tenantSecondary`, `colors.tenantText` and `fontFamily` into `--gv-tenant-primary`, `--gv-tenant-secondary`, `--gv-tenant-text` and `--gv-font-family` on the document element, as `.storybook/contexts/TenantTokens.tsx` does. Without the import a token read renders nothing on the platform; without the writer every tenant colour is the default pink on every platform.
- **One worktree** is enough: the tools are on the base.
- **Pictures for the Review page.** After each change commit, copy `<scratch>/heal/before.png` and `after.png` to `.storybook/static/changes/<sha>/`, `<sha>` that commit's full sha. They cannot go in the commit itself; they go in the refresh commit below.
- **Refresh**, after the last change: `npm run ds:changes -- --base origin/design-system/workbench`, then commit `design-changes.json` and every `changes/<sha>/` folder together: `design-system(review): pictures and change list [AI-assisted]`.
- **The PR**, when the person asks for it: base `design-system/workbench`, label `epic` (its preview serves the Review page), and the description starts with a Review section: the link `https://pr-<n>.epic.hq.govocal.com/storybook/workbench/#/review`, then the changes in order (subject and short sha).
- **From the Review page's "Send for review" text**: use the branch it names, exactly (the page finds the PR by it), ask the person who should review, open the PR ready for review with that reviewer, and talk to the person in plain words ("review", never PR, branch or commit). A later text names the PR: add to its branch and ask the reviewer to look again.

## Commit message

```
design-system(heal): <Component> <raw value> → <token> [AI-assisted]

<file>:<line>, <finding category>. Value <value> (unchanged).
Score <before> → <after>. Visual compare: <stories> stories, <diffs> diffs.

Co-Authored-By: <the line your session gives>
```

The score after comes from a scan of the heal worktree: in the tools checkout, the scanner reads `app/`, so copy the edited files over in a scratch copy, or report the expected change (off-spec minus the healed occurrences).

## Report

```
Healed: <Component> <raw> → <token> (<commit sha> on design-system/heal-<component>-<what>, off master <sha>)
Value: <token value> = <value now>
Score: <before> → <after> (offSpec <before> → <after>)
Checks: eslint ok, jest <n> passed, typecheck ok, visual <stories> stories <diffs> diffs, axe <criticals> new criticals
Screenshots: <scratch>/heal/before.png, after.png
Call sites changed: <list or none>
```

A stop report names the stop condition, the evidence (the values compared, the failing check) and what would make the heal possible.
