---
name: heal
description: Use when given a heal task (the three lines `heal:`, `why:`, `check:` copied from the workbench Tokens or Usage panel) or asked to replace an off-spec value, a legacy theme read or local markup with a design token or a library component. One value or one swap in one component per commit, style only.
---

# heal

Replace one off-spec value with a token read (or local markup with the library component), prove nothing else changed, commit it alone. One value is one raw → token pair in one file: every occurrence of that pair in the file goes into the same commit, a second pair is a second heal. Read `front/.storybook/AGENTS.md` first if you have not this session. Run every command from `front/`.

## Input: the heal task

```
heal: <Component> · <file>:<line> · <raw value> → <token> · mode <today|redesign|both>
why: <finding category>, scan confidence <high|medium|low>
check: story <story id>, routes <list>
```

- `mode` says where the result must hold: `today` (front office), `redesign` (the redesigned pages), `both` (shared components). The spec's `front-office` and `back-office` mean `today` and `redesign`.
- The token slot may read `A or B` (a legacy key that maps to two tokens) or `(choose a token)`. Pick the one whose `today` value equals what the code renders now (step 3). If none does, stop.
- A task typed by a person may lack lines. Ask for the file, line and value if you cannot find them; never guess the component.

## Stop conditions

Stop, change nothing (or revert what you changed), and report why with the evidence. Do not look for a way around a stop.

1. **Mode safety (SPEC 7.5).** `ds:mode-check` exits 3. Outside the redesign scope the token's `today` value must equal the value the code renders now. This holds for a shared component whatever the task's mode says, `both` included: a change to today's look is a token commit, not a heal. Inside the redesign scope (files that render only under `ModeScope`, not the whole `backofficeRedesign/` folder) a different `redesign` value is allowed only when the task says `mode redesign`.
2. **Style only.** The heal would change data, handlers, routing, copy, props an API exposes, or component structure beyond swapping local markup for the library component.
3. **One component per commit.** The heal needs edits inside a second component (call sites that only gain a layout spacing prop do not count, see the spacing rule).
4. **No token fits.** No token has the value, or a colour in a component would need a Tier 1 primitive and no Tier 2 colour has the same `today` value, or the only token with the value means something else (`--gv-chart-grid` for a card background). `ds:mode-check` compares values only; tier and meaning are yours to check. A new token is a change to `tokens.source.json` in its own `design-system(token)` commit, not part of a heal.
5. **Tenant slots.** A `--gv-tenant-*` or `--gv-color-tenant-*` token replaces only a read of the tenant theme key it lists in `legacy` (`theme.colors.tenantPrimary`), never a hard-coded colour.
6. **Spacing that is not a scale step**, or a two-sided spacing heal with more than 10 call sites (report the count; the person decides).
7. **Checks fail** after the edit (`ds:check`, typecheck, tests, or a visual diff outside the healed component's stories) and the cause is the heal.
8. **The finding is gone or moved** (the file or line no longer holds the raw value).

## Steps

- [ ] 1. `git status --short`. Note other people's uncommitted files; you will stage only yours. Note the base: `git rev-parse --short HEAD` is `<sha>` for the screenshot folder.
- [ ] 2. `npm run ds:scan`. Print the component's score before:
  ```
  node -e 'const s=require("./.storybook/static/design-scan.json");const c=s.components.find(c=>c.component===process.argv[1]);console.log(c?`${c.component} score ${c.score} ${c.status} offSpec ${["px","hex","rgba","named-color","layout-spacing"].reduce((n,k)=>n+c.counts[k],0)}`:"not in scan")' <Component>
  ```
  A container (a page or a part of one, not a library, `UI/` or `admin/` component) is not in `components` and prints `not in scan`. Report its file counts instead, with the same weights (token reads / (token reads + 0.5 legacy + off-spec)):
  ```
  node -e 'const s=require("./.storybook/static/design-scan.json");const f=s.findings.filter(x=>x.file===process.argv[1]);const n=k=>f.filter(x=>k(x.category)).length;const off=n(c=>["px","hex","rgba","named-color","layout-spacing"].includes(c)),leg=n(c=>c.startsWith("legacy")),tr=n(c=>c==="token-var");console.log(`score ${(tr/(tr+0.5*leg+off||1)).toFixed(3)} offSpec ${off} legacy ${leg} tokenReads ${tr}`)' <file>
  ```
  Open `<file>:<line>` and confirm the raw value is there (stop 8).
- [ ] 3. Resolve the value the code renders now. A literal is itself. A legacy read (`theme.borderRadius`, `colors.x`, `bo.x`, `stylingConsts.x`) is the value in its source (`app/component-library/utils/styleUtils.ts`, where `colors`, `bo`, `stylingConsts` and `getTheme` live); a number used as px is `<n>px`; a bridged theme key returns `var(--gv-…, <fallback>)` and renders the fallback today. A legacy key in a token's `legacy` list is not proof the values match: `bo.borderRadius` is `8px`, `--gv-radius-control` is `3px` today.
- [ ] 4. Mode check:
  ```
  npm run -s ds:mode-check -- --file <file> --token <token> --now <value> --mode <mode>
  ```
  Give `--now` as hex or rgb() for colours and with its unit for lengths. Exit 3 is stop 1; exit 2 is a typo in the command. The check reads the routes from the scan, so run `ds:scan` first, and decides the redesign scope from the import graph: `Event`, `NewPhase`, `UnsavedChangesGuard` and anything that portals (modals, dropdowns, tooltips) are outside even inside `backofficeRedesign/`. Run it once per file the heal edits.
- [ ] 5. The healed state needs a story. If it has none, add it (see the `story` skill) in its own `design-system(stories)` commit first, so the baseline holds it. Start Storybook in another terminal with `npx storybook dev -p 6006 --ci --no-open` (`npm run storybook` first runs `ds:prepare`, which rewrites committed outputs). Save the baselines, mode today for every story and mode redesign for the healed stories:
  ```
  npm run ds:visual -- --baseline <scratch>/before
  npm run ds:visual -- --baseline <scratch>/before --stories '<story prefix>--*' --mode redesign
  ```
  A file that only one stories file renders (`grep -rl` its import name across `*.stories.tsx` and the files that import it) may use `--stories '<story prefix>--*'` for the today baseline too; say so in the commit. Copy `<scratch>/before/desktop__<story id>.png` and `desktop__<story id>__redesign.png` to `.storybook/static/heals/<sha>/before-today.png` and `before-redesign.png`. A component that renders `ModeScope` itself shows its redesign values in both modes.
- [ ] 6. Edit. Use `t` from `design-system/tokens/tokens` (`t.radius.control`, `t.space[4]`) in TS and styled templates, or `var(--gv-…)` in CSS strings. Files in `app/component-library/` may not import from `design-system/` (dependency-cruiser `no-import-to-component-library`): write `var(--gv-…)` there. `rgba(colors.x, 0.5)` becomes `color-mix(in srgb, var(--gv-…) 50%, transparent)`. For spacing, follow the two-sided rule below. Add or update the story for the state the heal touches (see the `story` skill).
- [ ] 7. Scope, then checks. Scope first:
  ```
  git diff --name-only --relative | sed -nE 's#^app/component-library/components/([^/]*)/.*#\1#p; s#^app/components/(UI|admin)/([^/]*)/.*#\1/\2#p' | sort -u
  git diff -U0
  ```
  The first prints the components with uncommitted edits (library, `UI/<Name>`, `admin/<Name>`); leave out the files other people had in step 1. More than one of yours is stop 3, unless the others only gained a spacing prop at a call site. In the second, every changed line is a style value, a token import, a story, or a call-site spacing prop; anything else (a handler, a condition, copy, a prop of the component's API) is stop 2. Then, in this order:
  ```
  npm run ds:check
  npx jest <component folder>
  npm run typecheck
  npm run ds:visual -- --compare <scratch>/before --summary <scratch>/visual.json
  npm run ds:visual -- --compare <scratch>/before --stories '<story prefix>--*' --mode redesign
  ```
  On a small machine stop Storybook while `typecheck` runs; the two together run out of memory. The compare counts every changed pixel, so a corner radius off by a few px shows. A mode safe heal shows no diff at all; a story added or changed in step 6 shows as `no baseline screenshot` or a diff in that story only. Anything else is stop 7. Do not let `ds:visual` overwrite the committed `.storybook/static/visual-summary.json` during a heal (that is what `--summary` is for).
- [ ] 8. `npm run ds:scan` again and print the score after (command of step 2). `design-scan.summary.json` changed: it goes into the heal commit.
- [ ] 9. Screenshot the healed story after, in both modes, with `ds:visual` (it waits for `play` steps; a fixed timeout catches spinners):
  ```
  npm run ds:visual -- --baseline <scratch>/after --stories <story id>
  npm run ds:visual -- --baseline <scratch>/after --stories <story id> --mode redesign
  ```
  Copy `desktop__<story id>.png` and `desktop__<story id>__redesign.png` to `.storybook/static/heals/<sha>/after-today.png` and `after-redesign.png`, next to the before shots of step 5.
- [ ] 10. Commit only your files:
  ```
  git add <component files> <call-site files> <stories> .storybook/static/design-scan.summary.json .storybook/static/heals/<sha>/
  git commit
  ```

## Two-sided spacing rule

A component owns only its inside spacing. The space between components belongs to the layout primitive (`Box`), in scale steps `--gv-space-N`.

- **Inside spacing** (padding inside the component, gaps between its own parts): heal in place to a space token.
- **Outside spacing** (a margin on the component's root, or padding that only spaces it from its neighbours): it leaves the component. In the same commit:
  1. Find the call sites: `node -e 'require("./.storybook/static/design-scan.json").usages.filter(u=>u.component===process.argv[1]).forEach(u=>console.log(u.file+":"+u.line))' <Component>`. More than 10: stop 6.
  2. The value must be a scale step: a `--gv-space-N` whose `today` equals it (`0`, `4`, `8`, `12`, `16`, `20`, `24`, `28`, `32`, `40`, `48`, `64`, `80`, `96` px; `36`, `44` or `56` are not steps). Else stop 6.
     ```
     node -e 'const v=process.argv[1];const s=require("./app/design-system/tokens/tokens.meta.json").filter(t=>/^--gv-space-\d+$/.test(t.name)&&t.values.today===v);console.log(s.length?s[0].name:"not a scale step")' <value>
     ```
  3. Remove the margin from the component.
  4. At each call site give the same space to the layout primitive: the component's own Box margin props if it takes them (`mb={t.space[4]}`), else the gap or padding of the `Box` that already holds it, else a `<Box mb={t.space[4]}>` wrapper. If a wrapper changes layout (a flex or grid child), stop 2.
  5. Run `ds:mode-check` for each call-site file with the space token.
- **Call-site findings** (`layout-spacing`, a literal on a `Box` prop): one-sided, replace the literal with the scale step.

## Commit message

```
design-system(heal): <Component> <raw value> → <token> [AI-assisted]

<file>:<line>, <finding category>. Mode <mode>: today <today value> (unchanged),
redesign <redesign value>.
Score <before> → <after>. Visual compare: <stories>, today <diffs> diffs,
redesign <diffs> diffs.
Screenshots: .storybook/static/heals/<sha>/

Co-Authored-By: <the line your session gives>
```

## Report

```
Healed: <Component> <raw> → <token> (<commit sha>)
Mode: <office>, <inside|outside> the redesign scope, today <value> = <value now>
Score: <before> → <after> (offSpec <before> → <after>)
Checks: ds:check ok, jest <n> passed, typecheck ok, visual <stories> stories <diffs> diffs
Screenshots: .storybook/static/heals/<sha>/{before,after}-{today,redesign}.png
Call sites changed: <list or none>
```

A stop report names the stop condition, the evidence (the `ds:mode-check` output, the failing check) and what would make the heal possible.
