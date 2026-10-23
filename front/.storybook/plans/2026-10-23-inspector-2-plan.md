# Inspector 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the component page's right panel into a Figma-style Design tab: glyph fields and token pills, attach / detach / swap through a token picker, element edits that paint the canvas and land in one Changes list the agent can take.

**Architecture:** The inspector keeps reading the frame through `lib/inspect.ts`; rows gain the CSS longhands they stand for, a glyph and an edit kind. A new `lib/elementEdits.ts` holds the edit model, its storage, its application as inline styles in the frame and its task text. `panels/Design.tsx` is rewritten around three small components (`InspSection`, `ValueField`, `TokenPicker`); `panels/Tokens.tsx` goes; Usage moves to a disclosure under the page header; canvas settings and the Changes badge move to the canvas bar; the panel has two tabs, Design and A11y.

**Tech Stack:** React 18 + TypeScript (the workbench shell, `front/.storybook/workbench/src`), Vite build (`npm run ds:workbench`), Jest + jsdom (`npx jest .storybook/workbench`), Playwright smoke (`npm run ds:smoke`), `shell.css` with `--wb-*` roles.

The spec: `front/.storybook/plans/2026-10-23-inspector-2-spec.md`. Read it first, then `front/.storybook/AGENTS.md` (guardrails, vocabulary, the Storybook preview API).

## Global Constraints

- Work on branch `design-system/workbench` only; run every command from `front/`. Never touch `.circleci/`, `.github/`, product code outside `.storybook/`, `scripts/design-system/` and `app/design-system/`.
- Commits: small, `design-system(workbench): <what> [AI-assisted]`, stage files by name, the repo's configured git identity, the Co-Authored-By line your session gives.
- Low text: no title tooltips on values, no legend, no explanatory sentences in the Design tab. Glyphs carry meaning; `aria-label` carries the words.
- Keep every `data-testid` the spec and this plan name; the smoke run reads them.
- Pure logic in `lib/*.ts` with a Jest test beside it; components thin. New icons are drawn by hand on the 24 grid in `components/Icon.tsx`, never copied from Figma's assets.
- Before each commit: `npm run ds:workbench:typecheck` and `npx jest .storybook/workbench` pass. Before the last commit: `npm run ds:workbench` builds and `npm run ds:smoke` passes against a local `npx storybook dev -p 6006 --ci --no-open` (see the smoke runner's header for its flags).
- The shell's colours come from `--wb-*` roles in `shell.css` (`--wb-subtle`, `--wb-border`, `--wb-muted`, `--wb-accent`, `--wb-warn`, `--wb-radius`); never a literal colour.

---

## File map

| File | Role |
|---|---|
| `components/Icon.tsx` (modify) | 24 new glyphs: layout, text, stroke, effects, link states, canvas settings. |
| `lib/inspect.ts` (modify), `lib/inspect.test.ts` | Rows carry `props`, `glyph`, `half`, `editable`, `snap`; Layout section with W/H; letter spacing. |
| `lib/overrides.ts` (modify), `lib/overrides.test.ts` | `snapValue(kind, value, meta, mode)`; `snap` delegates to it; tier 2 colour preferred. |
| `lib/elementEdits.ts` (create), `lib/elementEdits.test.ts` | `ElementEdit`, `editId`, `changesLook`, `applyElementEdits`, `taskOfEdit`, storage codec. |
| `lib/useElementEdits.ts` (create) | React state + localStorage for element edits. |
| `lib/tokenPicker.ts` (create), `lib/tokenPicker.test.ts` | `pickerGroups(...)`: the picker's filtered, grouped rows. |
| `components/InspSection.tsx` (create) | Collapsible section, open state in localStorage. |
| `components/ValueField.tsx` (create) | `Field` and `Pill`, the attach suggestion, the detach button. |
| `components/TokenPicker.tsx` (create) | The popover. |
| `components/TokenRow.tsx` (modify) | Export `Preview`. |
| `components/ChangesDrawer.tsx` (modify) | Element edits group, Copy for agent. |
| `components/Toolbar.tsx` (modify) | `CanvasSettings` (City, Viewport, Language with glyphs). |
| `panels/Design.tsx` (rewrite) | The tab. |
| `panels/Tokens.tsx` (delete) | Gone. |
| `pages/Component.tsx` (modify) | Tabs Design / A11y, canvas bar, Usage disclosure, Changes drawer, element edits wiring. |
| `components/Canvas.tsx` (modify) | Applies element edits after each render. |
| `lib/router.ts` (modify), `lib/router.test.ts` | `foundations/<category>/<token>`. |
| `pages/Foundations.tsx`, `App.tsx` (modify) | Deep link to a token row. |
| `shell.css` (modify) | Styles for the new parts. |
| `scripts/design-system/workbench-smoke.ts` (modify) | The acceptance checks. |
| `.storybook/AGENTS.md` (modify) | The panel section. |

---

### Task 1: Glyphs

**Files:**
- Modify: `front/.storybook/workbench/src/components/Icon.tsx`
- Test: `front/.storybook/workbench/src/components/Icon.test.tsx` (create)

**Interfaces:**
- Produces: `IconName` now includes `'width' | 'height' | 'padding' | 'padding-y' | 'padding-x' | 'padding-top' | 'padding-right' | 'padding-bottom' | 'padding-left' | 'gap' | 'gap-row' | 'gap-col' | 'radius' | 'fill' | 'stroke' | 'stroke-width' | 'text' | 'font-size' | 'font-weight' | 'line-height' | 'letter-spacing' | 'shadow' | 'detach' | 'attach' | 'swap' | 'layers' | 'city' | 'language' | 'caution'`. (`monitor` already exists for Viewport; `edit` for Changes.)

- [ ] **Step 1: Write the failing test**

```tsx
// components/Icon.test.tsx
import { render } from '@testing-library/react';

import Icon, { IconName } from './Icon';

const NEW: IconName[] = [
  'width', 'height', 'padding', 'padding-y', 'padding-x', 'padding-top',
  'padding-right', 'padding-bottom', 'padding-left', 'gap', 'gap-row',
  'gap-col', 'radius', 'fill', 'stroke', 'stroke-width', 'text', 'font-size',
  'font-weight', 'line-height', 'letter-spacing', 'shadow', 'detach',
  'attach', 'swap', 'layers', 'city', 'language', 'caution',
];

describe('Icon', () => {
  it.each(NEW)('draws %s', (name) => {
    const { container } = render(<Icon name={name} size={16} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.querySelector('path, rect, circle, line')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx jest .storybook/workbench/src/components/Icon.test.tsx`
Expected: FAIL, type errors on the unknown names (ts-jest) or empty svgs.

- [ ] **Step 3: Add the paths**

Open `Icon.tsx`, find the `PATHS` object and add these entries (same style as the existing ones: stroke follows the text colour, 24 grid):

```tsx
  width: <path d="M4 12h16M7 9l-3 3 3 3M17 9l3 3-3 3" />,
  height: <path d="M12 4v16M9 7l3-3 3 3M9 17l3 3 3-3" />,
  padding: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1" />
    </>
  ),
  'padding-y': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8.5h8M8 15.5h8" />
    </>
  ),
  'padding-x': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8.5 8v8M15.5 8v8" />
    </>
  ),
  'padding-top': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8.5h8" />
    </>
  ),
  'padding-right': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M15.5 8v8" />
    </>
  ),
  'padding-bottom': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 15.5h8" />
    </>
  ),
  'padding-left': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8.5 8v8" />
    </>
  ),
  gap: (
    <>
      <rect x="4" y="5" width="5" height="14" rx="1" />
      <rect x="15" y="5" width="5" height="14" rx="1" />
      <path d="M10.5 12h3" />
    </>
  ),
  'gap-row': (
    <>
      <rect x="5" y="4" width="14" height="5" rx="1" />
      <rect x="5" y="15" width="14" height="5" rx="1" />
      <path d="M12 10.5v3" />
    </>
  ),
  'gap-col': (
    <>
      <rect x="4" y="5" width="5" height="14" rx="1" />
      <rect x="15" y="5" width="5" height="14" rx="1" />
      <path d="M10.5 12h3" />
    </>
  ),
  radius: <path d="M5 19V11a6 6 0 0 1 6-6h8" />,
  fill: <path d="M12 3.5 6.5 9a7.8 7.8 0 1 0 11 0z" />,
  stroke: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </>
  ),
  'stroke-width': (
    <>
      <path d="M4 6.5h16" strokeWidth="1" />
      <path d="M4 12h16" strokeWidth="2" />
      <path d="M4 18h16" strokeWidth="3" />
    </>
  ),
  text: (
    <>
      <path d="M4 18 9.5 5l5.5 13M6 14h7" />
      <path d="M16 12.5a2.3 2.3 0 0 1 4 1.5v4m0-2.5h-2.2a1.6 1.6 0 0 0 0 3.2H20" />
    </>
  ),
  'font-size': (
    <>
      <path d="M3.5 18 8.5 6l5 12M5.3 14h6.4" />
      <path d="M15 18l2.5-7 2.5 7M16 15.8h3" />
    </>
  ),
  'font-weight': (
    <path
      d="M7 5h6.5a3.5 3.5 0 0 1 0 7H7zM7 12h7.5a3.5 3.5 0 0 1 0 7H7z"
      strokeWidth="2.2"
    />
  ),
  'line-height': (
    <path d="M4 5h16M4 19h16M12 8.5v7M9.5 11 12 8.5l2.5 2.5M9.5 13 12 15.5l2.5-2.5" />
  ),
  'letter-spacing': (
    <path d="M5 4v16M19 4v16M8 12h8M10 9.5 7.5 12l2.5 2.5M14 9.5l2.5 2.5-2.5 2.5" />
  ),
  shadow: (
    <>
      <rect x="4" y="4" width="13" height="13" rx="2" />
      <path d="M8 20h10a2 2 0 0 0 2-2V8" />
    </>
  ),
  detach: (
    <path d="M9.5 14.5 7 17a3 3 0 0 1-4.2-4.2l2.5-2.5M14.5 9.5 17 7a3 3 0 0 1 4.2 4.2l-2.5 2.5M5 5l14 14" />
  ),
  attach: (
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" />
  ),
  swap: <path d="M4 8h13m-4-4 4 4-4 4M20 16H7m4 4-4-4 4-4" />,
  layers: <path d="m12 4 8 4.5-8 4.5-8-4.5zM4 13l8 4.5 8-4.5" />,
  city: <path d="M4 20V9l5-3v14M9 20V11l6 3v6M15 20v-9l5-2v11M4 20h16" />,
  language: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16" />
    </>
  ),
  caution: (
    <path d="M12 4 2.5 20h19zM12 10v4.5M12 17.2v.3" />
  ),
```

If `PATHS` is typed as `Record<string, ReactNode>` the names will not narrow; the file already derives `IconName = keyof typeof PATHS`, keep that.

- [ ] **Step 4: Run the test**

Run: `npx jest .storybook/workbench/src/components/Icon.test.tsx`
Expected: PASS, 29 cases.

- [ ] **Step 5: Commit**

```bash
git add .storybook/workbench/src/components/Icon.tsx .storybook/workbench/src/components/Icon.test.tsx
git commit -m "design-system(workbench): glyphs for the inspector fields [AI-assisted]"
```

---

### Task 2: Rows know their property, glyph and edit kind

**Files:**
- Modify: `front/.storybook/workbench/src/lib/inspect.ts`
- Test: `front/.storybook/workbench/src/lib/inspect.test.ts`

**Interfaces:**
- Produces:

```ts
export type SnapKind = 'space' | 'radius' | 'color';
export type InspectRow = {
  id: string;
  label: string;          // words for aria-label and the Changes list ("Vertical", "Size")
  value: InspectValue;
  props: string[];        // CSS longhands this row sets
  glyph: IconName;        // type-only import from '../components/Icon'
  half: boolean;          // two per line
  editable: boolean;      // W, H, shadow are false
  snap?: SnapKind;        // what a typed value snaps to
};
export type SectionId = 'layout' | 'fill' | 'stroke' | 'radius' | 'text' | 'effects';
export const fitsProp: (prop: string) => ((t: TokenMeta) => boolean) | undefined;  // the CATEGORY map, exported
export const rowSpec: (id: string) => Pick<InspectRow, 'props' | 'glyph' | 'half' | 'editable' | 'snap'>;
```

- `fill`, `text` and the radius/padding/gap ids keep their current values. New ids: `w`, `h`, `ls`.

- [ ] **Step 1: Write the failing tests**

Append to `inspect.test.ts`:

```ts
import { fitsProp, rowSpec } from './inspect';

describe('rowSpec', () => {
  it('maps a padding pair to its two longhands', () => {
    expect(rowSpec('padding-v')).toEqual({
      props: ['padding-top', 'padding-bottom'],
      glyph: 'padding-y',
      half: true,
      editable: true,
      snap: 'space',
    });
    expect(rowSpec('padding-2').props).toEqual(['padding-bottom']);
    expect(rowSpec('padding').props).toHaveLength(4);
  });

  it('maps radius pairs diagonally', () => {
    expect(rowSpec('radius-v').props).toEqual([
      'border-top-left-radius',
      'border-bottom-right-radius',
    ]);
    expect(rowSpec('radius-h').props).toEqual([
      'border-top-right-radius',
      'border-bottom-left-radius',
    ]);
  });

  it('keeps size and shadow read-only', () => {
    expect(rowSpec('w')).toMatchObject({ editable: false, glyph: 'width', half: true });
    expect(rowSpec('shadow')).toMatchObject({ editable: false, glyph: 'shadow' });
  });

  it('gives text rows their glyph and no snap', () => {
    expect(rowSpec('size')).toMatchObject({ props: ['font-size'], glyph: 'font-size', half: true });
    expect(rowSpec('size').snap).toBeUndefined();
    expect(rowSpec('color')).toMatchObject({ props: ['color'], glyph: 'text', snap: 'color', half: false });
    expect(rowSpec('fill')).toMatchObject({ props: ['background-color'], glyph: 'fill', snap: 'color' });
  });
});

describe('fitsProp', () => {
  const t = (name: string, category: string, tier: 1 | 2 = 2) =>
    ({ name, category, tier, values: { today: '', redesign: '' }, legacy: [] }) as const;
  it('matches colours to colour longhands and space to padding', () => {
    expect(fitsProp('background-color')?.(t('--gv-white', 'color'))).toBe(true);
    expect(fitsProp('padding-left')?.(t('--gv-space-2', 'space'))).toBe(true);
    expect(fitsProp('padding-left')?.(t('--gv-white', 'color'))).toBe(false);
    expect(fitsProp('width')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run them**

Run: `npx jest .storybook/workbench/src/lib/inspect.test.ts`
Expected: FAIL, `rowSpec` and `fitsProp` are not exported.

- [ ] **Step 3: Implement**

In `inspect.ts`:

1. Add at the top: `import type { IconName } from '../components/Icon';` (type only: no runtime cycle).
2. Replace the `InspectRow` and `SectionId` types with the ones in Interfaces above.
3. Export the category map: rename nothing, add `export const fitsProp = (prop: string) => CATEGORY[prop];` after `CATEGORY` is complete (after the `CATEGORY['column-gap'] = …` line). Add to `CATEGORY`:

```ts
  'font-family': (t) => t.type === 'fontFamily',
  'letter-spacing': (t) => t.category === 'text' && /-ls$/.test(t.name),
```

4. Add the spec table before `sides`:

```ts
type Spec = Pick<InspectRow, 'props' | 'glyph' | 'half' | 'editable' | 'snap'>;

const P = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
const R = [
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
];
const SIDE_GLYPH: IconName[] = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];

const SPECS: Record<string, Spec> = {
  w: { props: ['width'], glyph: 'width', half: true, editable: false },
  h: { props: ['height'], glyph: 'height', half: true, editable: false },
  padding: { props: P, glyph: 'padding', half: false, editable: true, snap: 'space' },
  'padding-v': { props: [P[0], P[2]], glyph: 'padding-y', half: true, editable: true, snap: 'space' },
  'padding-h': { props: [P[3], P[1]], glyph: 'padding-x', half: true, editable: true, snap: 'space' },
  gap: { props: ['row-gap', 'column-gap'], glyph: 'gap', half: false, editable: true, snap: 'space' },
  'gap-row': { props: ['row-gap'], glyph: 'gap-row', half: true, editable: true, snap: 'space' },
  'gap-col': { props: ['column-gap'], glyph: 'gap-col', half: true, editable: true, snap: 'space' },
  fill: { props: ['background-color'], glyph: 'fill', half: false, editable: true, snap: 'color' },
  'stroke-color': { props: ['border-color'], glyph: 'stroke', half: true, editable: true, snap: 'color' },
  'stroke-width': { props: ['border-width'], glyph: 'stroke-width', half: true, editable: true },
  radius: { props: R, glyph: 'radius', half: false, editable: true, snap: 'radius' },
  'radius-v': { props: [R[0], R[2]], glyph: 'radius', half: true, editable: true, snap: 'radius' },
  'radius-h': { props: [R[1], R[3]], glyph: 'radius', half: true, editable: true, snap: 'radius' },
  family: { props: ['font-family'], glyph: 'text', half: false, editable: true },
  size: { props: ['font-size'], glyph: 'font-size', half: true, editable: true },
  weight: { props: ['font-weight'], glyph: 'font-weight', half: true, editable: true },
  lh: { props: ['line-height'], glyph: 'line-height', half: true, editable: true },
  ls: { props: ['letter-spacing'], glyph: 'letter-spacing', half: true, editable: true },
  color: { props: ['color'], glyph: 'text', half: false, editable: true, snap: 'color' },
  shadow: { props: ['box-shadow'], glyph: 'shadow', half: false, editable: false },
};
for (let i = 0; i < 4; i++) {
  SPECS[`padding-${i}`] = { props: [P[i]], glyph: SIDE_GLYPH[i], half: true, editable: true, snap: 'space' };
  SPECS[`radius-${i}`] = { props: [R[i]], glyph: 'radius', half: true, editable: true, snap: 'radius' };
}

export const rowSpec = (id: string): Spec =>
  SPECS[id] ?? { props: [], glyph: 'tokens', half: false, editable: false };

const row = (id: string, label: string, value: InspectValue): InspectRow => ({
  id,
  label,
  value,
  ...rowSpec(id),
});
```

5. Make `sides` return `row(...)` for each entry instead of object literals (`row(id, '', t)`, `row(`${id}-v`, pairs[0], t)`, …). The 4-side labels stay (`Top`, `Right`, …).
6. In `inspectElement`:
   - Build the Layout section first:

```ts
    const rect = el.getBoundingClientRect();
    const sizeRow = (id: 'w' | 'h', n: number): InspectRow =>
      row(id, id === 'w' ? 'Width' : 'Height', {
        raw: `${n}px`,
        shown: String(Math.round(n)),
      });
    const layout: InspectRow[] = [sizeRow('w', rect.width), sizeRow('h', rect.height)];
```

     then push the padding rows (computed as today) and the gap rows into `layout` instead of their own sections, and `sections.push({ id: 'layout', label: 'Layout', rows: layout })` before Fill. Keep the "all 0px" tests: padding and gap rows are added only when some side is not `0px`, as today; W and H always.
   - Text rows become `row('family', 'Font', family)`, `row('weight', 'Weight', v('font-weight'))`, `row('size', 'Size', v('font-size'))`, `row('lh', 'Line height', v('line-height'))`, then letter spacing only when not neutral:

```ts
    const ls = v('letter-spacing');
    const textRows = [family, weight, size, lh]  // as InspectRow values
    if (!NEUTRAL.has(ls.raw)) textRows.push(row('ls', 'Letter spacing', ls));
    textRows.push(row('color', 'Colour', v('color', colourText)));
```

     Order in the section: Font, Weight, Size, Line height, Letter spacing, Colour.
   - Stroke rows: `row('stroke-color', 'Colour', …)`, `row('stroke-width', 'Width', …)`.
   - Fill: `row('fill', 'Fill', fill)`. Effects: `row('shadow', 'Drop shadow', shadow)`.
   - The radius section keeps its own id `'radius'` (label `Radius`).
   - Remove the `size` field from `Inspection` (W and H are rows now) and its use in Design.

- [ ] **Step 4: Run the tests**

Run: `npx jest .storybook/workbench/src/lib/inspect.test.ts && npm run ds:workbench:typecheck`
Expected: inspect tests PASS. Typecheck fails in `panels/Design.tsx` (`inspection.size`, `label` on rows): fine until Task 9; to keep the tree compiling now, in `Design.tsx` replace `inspection.size.w`/`.h` with the W/H rows (`inspection.sections[0].rows.find(r => r.id === 'w')?.value.shown`) or leave a `// Task 9` comment and skip the typecheck for this commit only.

- [ ] **Step 5: Commit**

```bash
git add .storybook/workbench/src/lib/inspect.ts .storybook/workbench/src/lib/inspect.test.ts .storybook/workbench/src/panels/Design.tsx
git commit -m "design-system(workbench): inspector rows carry their longhands, glyph and edit kind [AI-assisted]"
```

---

### Task 3: `snapValue`

**Files:**
- Modify: `front/.storybook/workbench/src/lib/overrides.ts:140-183`
- Test: `front/.storybook/workbench/src/lib/overrides.test.ts`

**Interfaces:**
- Produces: `export const snapValue = (kind: 'space' | 'radius' | 'color' | undefined, value: string, meta: TokenMeta[], mode: Mode = 'today'): SnapResult`. `snap(name, …)` keeps its signature and calls `snapValue(kindOfToken, …)`.
- A colour that snaps prefers a tier 2 token with the same literal value over the tier 1 primitive (`to` names the tier 2 one).

- [ ] **Step 1: Write the failing tests**

Add to the `describe('snap', …)` block in `overrides.test.ts` (it already imports `tokensMeta` as `meta`; check the local name):

```ts
  it('snapValue snaps a length to the space scale without a token name', () => {
    const r = snapValue('space', '13px', meta);
    expect(r).toMatchObject({ value: '12px', snapped: true, custom: false, to: '--gv-space-3' });
  });

  it('snapValue leaves an unknown kind as typed', () => {
    expect(snapValue(undefined, '17px', meta)).toEqual({
      value: '17px', snapped: false, custom: false,
    });
  });

  it('snapValue prefers a semantic colour over the primitive it equals', () => {
    const white = meta.find((t) => t.tier === 2 && t.category === 'color' && t.values.today === '#ffffff');
    if (!white) return; // the set has no semantic white: nothing to prefer
    expect(snapValue('color', '#fefefe', meta).to).toBe(white.name);
  });
```

Add `snapValue` to the import list from `./overrides`. If the space step names differ (`--gv-space-3` must be `12px` today; check `tokens.meta.json`), use the real one.

- [ ] **Step 2: Run them**

Run: `npx jest .storybook/workbench/src/lib/overrides.test.ts -t snapValue`
Expected: FAIL, `snapValue` is not exported.

- [ ] **Step 3: Implement**

Replace `snap` with:

```ts
export type SnapKind = 'space' | 'radius' | 'color';

// Among palette tokens with the same literal value, a tier 2 name is the
// one components should read.
const preferSemantic = (name: TokenName, value: string, meta: TokenMeta[], mode: Mode): TokenName => {
  const semantic = meta.find(
    (t) => t.tier === 2 && t.category === 'color' && !t.deprecated && t.values[mode].toLowerCase() === value.toLowerCase()
  );
  return (semantic?.name as TokenName) ?? name;
};

export const snapValue = (
  kind: SnapKind | undefined,
  value: string,
  meta: TokenMeta[],
  mode: Mode = 'today'
): SnapResult => {
  const typed = value.trim();
  if (kind === 'space' || kind === 'radius') {
    const px = toPx(typed);
    const steps = meta
      .filter((t) => t.category === kind && t.tier === 1)
      .map((t) => ({ name: t.name as TokenName, value: t.values[mode], px: toPx(t.values[mode]) }))
      .filter((s): s is typeof s & { px: number } => s.px !== null);
    if (px === null || steps.length === 0) return { value: typed, snapped: false, custom: true };
    let best = steps[0];
    for (const s of steps) if (Math.abs(s.px - px) < Math.abs(best.px - px)) best = s;
    return { value: best.value, snapped: true, custom: false, to: best.name };
  }
  if (kind === 'color') {
    const hit = nearestColour(typed, palette(meta, mode));
    if (!hit) return { value: typed, snapped: false, custom: true };
    return {
      value: hit.swatch.value,
      snapped: true,
      custom: false,
      to: preferSemantic(hit.swatch.name, hit.swatch.value, meta, mode),
    };
  }
  return { value: typed, snapped: false, custom: false };
};

export const snap = (name: TokenName, value: string, meta: TokenMeta[], mode: Mode = 'today'): SnapResult => {
  const token = meta.find((t) => t.name === name);
  if (!token) return { value: value.trim(), snapped: false, custom: true };
  const kind = SCALED.includes(token.category) || token.category === 'color' ? (token.category as SnapKind) : undefined;
  return snapValue(kind, value, meta, mode);
};
```

- [ ] **Step 4: Run all overrides tests**

Run: `npx jest .storybook/workbench/src/lib/overrides.test.ts`
Expected: PASS (the old `snap` cases included). If an old case expected the tier 1 primitive for a colour that also has a semantic twin, update that expectation and say so in the commit.

- [ ] **Step 5: Commit**

```bash
git add .storybook/workbench/src/lib/overrides.ts .storybook/workbench/src/lib/overrides.test.ts
git commit -m "design-system(workbench): snapValue by kind, semantic colours first [AI-assisted]"
```

---

### Task 4: The element edit model

**Files:**
- Create: `front/.storybook/workbench/src/lib/elementEdits.ts`
- Create: `front/.storybook/workbench/src/lib/useElementEdits.ts`
- Test: `front/.storybook/workbench/src/lib/elementEdits.test.ts`

**Interfaces:**
- Produces:

```ts
export type EditKind = 'attach' | 'swap' | 'detach' | 'custom' | 'file';
export type ElementEdit = { /* exactly the spec's shape */ };
export const editId: (storyId: string, path: number[] | null, rowId: string) => string;
export const changesLook: (e: ElementEdit, resolve: (token: TokenName) => string) => boolean;
export const inlineValue: (e: ElementEdit) => string;            // `var(--gv-x)` or the literal
export const applyElementEdits: (doc: Document, edits: ElementEdit[], storyId: string, applied: Map<string, Map<string, string>>) => void;
export const taskOfEdit: (e: ElementEdit, ctx: TaskContext) => string;
export type TaskContext = { component: string; file?: string; storyId: string; routes: string[]; mode: HealMode; layer: string; findings: Finding[] };
export const parseStored: (raw: string | null, meta: TokenMeta[]) => ElementEdit[];
export const STORAGE_KEY = 'gv-element-edits';
export const useElementEdits: (meta: TokenMeta[]) => { edits: ElementEdit[]; add: (e: ElementEdit) => void; remove: (id: string) => void; clear: () => void };
```

- [ ] **Step 1: Write the failing tests**

```ts
// lib/elementEdits.test.ts
import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';

import type { Finding, TokenMeta } from './data';
import {
  applyElementEdits,
  changesLook,
  editId,
  ElementEdit,
  inlineValue,
  parseStored,
  taskOfEdit,
} from './elementEdits';

const meta = tokensMeta as TokenMeta[];

const base: ElementEdit = {
  id: editId('button--default', [0, 1], 'padding-v'),
  storyId: 'button--default',
  path: [0, 1],
  rowId: 'padding-v',
  label: 'Padding · Vertical',
  glyph: 'padding-y',
  props: ['padding-top', 'padding-bottom'],
  from: { raw: '9px', shown: '9' },
  to: { value: '12px', token: '--gv-space-3' },
  kind: 'attach',
  at: 1,
};

describe('element edits', () => {
  it('builds a stable id', () => {
    expect(editId('s', [0, 1], 'fill')).toBe('s|0.1|fill');
    expect(editId('s', null, '12:4')).toBe('s|file|12:4');
  });

  it('knows when the look changes', () => {
    const resolve = (t: string) => (t === '--gv-space-3' ? '12px' : '');
    expect(changesLook({ ...base, from: { raw: '12px', shown: '12' } }, resolve)).toBe(false);
    expect(changesLook(base, resolve)).toBe(true);
    expect(changesLook({ ...base, kind: 'custom', to: { value: '11px' } }, resolve)).toBe(true);
  });

  it('writes the inline value', () => {
    expect(inlineValue(base)).toBe('var(--gv-space-3)');
    expect(inlineValue({ ...base, to: { value: '11px' } })).toBe('11px');
  });

  it('applies to the element at the path and restores on removal', () => {
    document.body.innerHTML =
      '<div data-gv-story-box><div><i></i><button style="padding-top: 9px">x</button></div></div>';
    const el = document.querySelector('button') as HTMLElement;
    const applied = new Map<string, Map<string, string>>();
    applyElementEdits(document, [base], 'button--default', applied);
    expect(el.style.getPropertyValue('padding-top')).toBe('var(--gv-space-3)');
    expect(el.style.getPropertyValue('padding-bottom')).toBe('var(--gv-space-3)');
    applyElementEdits(document, [], 'button--default', applied);
    expect(el.style.getPropertyValue('padding-top')).toBe('9px');
    expect(el.style.getPropertyValue('padding-bottom')).toBe('');
  });

  it('ignores edits of another story and a path that is gone', () => {
    document.body.innerHTML = '<div data-gv-story-box><div></div></div>';
    const applied = new Map<string, Map<string, string>>();
    expect(() =>
      applyElementEdits(document, [base, { ...base, storyId: 'other' }], 'button--default', applied)
    ).not.toThrow();
  });

  it('formats an attach with a matching finding as a heal task', () => {
    const f: Finding = {
      file: 'app/component-library/components/Button/index.tsx',
      line: 76, col: 5, raw: '9px', category: 'px', confidence: 'high',
    };
    const text = taskOfEdit(base, {
      component: 'Button', file: f.file, storyId: 'button--default',
      routes: ['admin'], mode: 'both', layer: 'button "Save changes"', findings: [f],
    });
    expect(text).toBe(
      'heal: Button · app/component-library/components/Button/index.tsx:76 · 9px → --gv-space-3 · mode both\n' +
        'why: px, scan confidence high\n' +
        'check: story button--default, routes /admin'
    );
  });

  it('formats an attach without a finding and a custom change', () => {
    const ctx = { component: 'Button', file: 'f.tsx', storyId: 's', routes: [], mode: 'both' as const, layer: 'button "Save"', findings: [] };
    expect(taskOfEdit(base, ctx)).toBe(
      'heal: Button · f.tsx · 9px → --gv-space-3 · mode both\n' +
        'why: hard-coded padding · vertical seen in the workbench (button "Save"), scan confidence low\n' +
        'check: story s, routes none'
    );
    expect(taskOfEdit({ ...base, kind: 'custom', to: { value: '11px' } }, ctx)).toBe(
      'change: Button · f.tsx · padding-top, padding-bottom 9px → 11px · mode redesign\n' +
        'why: design change from the workbench (custom); changes today\'s look, so redesign scope or a token change\n' +
        'check: story s, routes none'
    );
    expect(taskOfEdit({ ...base, kind: 'swap', from: { raw: '12px', shown: '12', token: '--gv-space-3' }, to: { value: '16px', token: '--gv-space-4' } }, ctx))
      .toContain('--gv-space-3 → var(--gv-space-4) · mode redesign');
  });

  it('drops bad stored entries', () => {
    const ok = JSON.stringify([base]);
    expect(parseStored(ok, meta)).toHaveLength(1);
    expect(parseStored(JSON.stringify([{ ...base, to: { value: 'url(x)' } }]), meta)).toEqual([]);
    expect(parseStored(JSON.stringify([{ ...base, to: { value: '12px', token: '--gv-nope' } }]), meta)).toEqual([]);
    expect(parseStored('nonsense', meta)).toEqual([]);
    expect(parseStored(JSON.stringify([{ ...base, from: { raw: '9px', shown: '9', token: '--gv-space-2' } , to: { value: '#ff0000' } }]), meta)).toEqual([]);
  });
});
```

`routeLabel('admin')` gives `/admin` (see `healTask.ts`); adjust the expectation if it differs.

- [ ] **Step 2: Run them**

Run: `npx jest .storybook/workbench/src/lib/elementEdits.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `elementEdits.ts`**

```ts
// Session edits of one element's properties on the canvas: attach a
// token to a hard value, swap or detach a token, or a custom value. Painted
// as inline styles in the frame, kept in localStorage, handed to the agent
// as task text from the Changes drawer.
import type { TokenName } from '@ds/tokens/tokens';

import type { IconName } from '../components/Icon';

import type { Finding, TokenMeta } from './data';
import { formatHealTask, HealMode, MAX_TASK_ROUTES, routeLabel } from './healTask';
import { atPath, rowSpec } from './inspect';
import { parseColour } from './overrides';

export type EditKind = 'attach' | 'swap' | 'detach' | 'custom' | 'file';

export type ElementEdit = {
  id: string;
  storyId: string;
  path: number[] | null;
  rowId: string;
  label: string;
  glyph: IconName;
  props: string[];
  from: { raw: string; shown: string; token?: TokenName };
  to: { value: string; token?: TokenName };
  kind: EditKind;
  file?: string;
  line?: number;
  col?: number;
  at: number;
};

export const STORAGE_KEY = 'gv-element-edits';
export const MAX_VALUE = 64;

export const editId = (storyId: string, path: number[] | null, rowId: string) =>
  `${storyId}|${path ? path.join('.') : 'file'}|${rowId}`;

export const inlineValue = (e: ElementEdit) =>
  e.to.token ? `var(${e.to.token})` : e.to.value;

// True when what renders differs from what rendered before the edit.
export const changesLook = (e: ElementEdit, resolve: (token: TokenName) => string) => {
  const after = e.to.token ? resolve(e.to.token) || e.to.value : e.to.value;
  return after.trim().toLowerCase() !== e.from.raw.trim().toLowerCase();
};

// `applied`: per edit id, the element's inline values before the edit, so a
// removed edit gets them back. Edits of other stories are left alone; an
// element whose path is gone is skipped until the next render finds it.
export const applyElementEdits = (
  doc: Document,
  edits: ElementEdit[],
  storyId: string,
  applied: Map<string, Map<string, string>>
) => {
  const live = new Set(edits.map((e) => e.id));
  for (const [id, originals] of [...applied]) {
    if (live.has(id)) continue;
    const [, pathText, rowId] = id.split('|');
    const el = pathText === 'file' ? null : atPath(doc, pathText.split('.').map(Number));
    if (el instanceof (doc.defaultView?.HTMLElement ?? HTMLElement)) {
      for (const prop of rowSpec(rowId).props) {
        const before = originals.get(prop) ?? '';
        if (before) el.style.setProperty(prop, before);
        else el.style.removeProperty(prop);
      }
    }
    applied.delete(id);
  }
  for (const e of edits) {
    if (e.storyId !== storyId || !e.path) continue;
    const el = atPath(doc, e.path);
    if (!(el instanceof (doc.defaultView?.HTMLElement ?? HTMLElement))) continue;
    const originals = applied.get(e.id) ?? new Map<string, string>();
    const value = inlineValue(e);
    for (const prop of e.props) {
      if (!originals.has(prop)) originals.set(prop, el.style.getPropertyValue(prop));
      if (el.style.getPropertyValue(prop) !== value) el.style.setProperty(prop, value);
    }
    applied.set(e.id, originals);
  }
};

export type TaskContext = {
  component: string;
  file?: string;
  storyId: string;
  routes: string[];
  mode: HealMode;
  layer: string;
  findings: Finding[];
};

const flat = (s: string) => s.replace(/\s+/g, ' ').trim();

const routeList = (routes: string[]) => {
  if (routes.length === 0) return 'none';
  const named = routes.slice(0, MAX_TASK_ROUTES).map(routeLabel).join(', ');
  const rest = routes.length - MAX_TASK_ROUTES;
  return rest > 0 ? `${named} and ${rest} more` : named;
};

// The scan finding an edit stands for: the `file` edit's own line, or a
// finding of the file whose raw value is the edit's rendered value.
const findingOf = (e: ElementEdit, ctx: TaskContext) =>
  e.kind === 'file'
    ? ctx.findings.find((f) => f.file === e.file && f.line === e.line && f.col === e.col)
    : ctx.findings.find(
        (f) => f.file === ctx.file && [e.from.raw, e.from.shown, `${e.from.shown}px`].includes(flat(f.raw))
      );

export const taskOfEdit = (e: ElementEdit, ctx: TaskContext): string => {
  const file = e.file ?? ctx.file ?? '(file unknown)';
  const check = `check: story ${ctx.storyId}, routes ${routeList(ctx.routes)}`;
  if (e.kind === 'attach' || e.kind === 'file') {
    const f = findingOf(e, ctx);
    if (f && e.to.token) {
      return formatHealTask(f, ctx.component, ctx.storyId, ctx.routes, ctx.mode, { token: e.to.token });
    }
    return [
      `heal: ${ctx.component} · ${file} · ${e.from.raw} → ${e.to.token ?? '(choose a token)'} · mode ${ctx.mode}`,
      `why: hard-coded ${e.label.toLowerCase()} seen in the workbench (${ctx.layer}), scan confidence low`,
      check,
    ].join('\n');
  }
  const from = e.from.token ?? e.from.raw;
  const to = e.to.token ? `var(${e.to.token})` : e.to.value;
  return [
    `change: ${ctx.component} · ${file} · ${e.props.join(', ')} ${from} → ${to} · mode redesign`,
    `why: design change from the workbench (${e.kind}); changes today's look, so redesign scope or a token change`,
    check,
  ].join('\n');
};

// ---------------------------------------------------------------- storage

const KINDS = new Set<EditKind>(['attach', 'swap', 'detach', 'custom', 'file']);
const PX = /^-?\d+(\.\d+)?px$/;

const literalFits = (rowId: string, value: string) => {
  if (value.length > MAX_VALUE || /url\(|expression\(|[<>]/i.test(value)) return false;
  const kind = rowSpec(rowId).snap;
  if (kind === 'space' || kind === 'radius') return PX.test(value);
  if (kind === 'color') return parseColour(value) !== null;
  return true;
};

const isEdit = (v: unknown, known: Set<string>): v is ElementEdit => {
  if (typeof v !== 'object' || v === null) return false;
  const e = v as Record<string, unknown>;
  const to = e.to as Record<string, unknown> | undefined;
  const from = e.from as Record<string, unknown> | undefined;
  return (
    typeof e.id === 'string' &&
    typeof e.storyId === 'string' &&
    (e.path === null || (Array.isArray(e.path) && e.path.every((n) => Number.isInteger(n)))) &&
    typeof e.rowId === 'string' &&
    typeof e.label === 'string' &&
    typeof e.glyph === 'string' &&
    Array.isArray(e.props) && e.props.every((p) => typeof p === 'string') &&
    KINDS.has(e.kind as EditKind) &&
    !!from && typeof from.raw === 'string' && typeof from.shown === 'string' &&
    (from.token === undefined || known.has(from.token as string)) &&
    !!to && typeof to.value === 'string' &&
    (to.token === undefined || known.has(to.token as string)) &&
    literalFits(e.rowId as string, to.value as string) &&
    typeof e.at === 'number'
  );
};

export const parseStored = (raw: string | null, meta: TokenMeta[]): ElementEdit[] => {
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    const known = new Set(meta.map((t) => t.name));
    return list.filter((v): v is ElementEdit => isEdit(v, known));
  } catch {
    return [];
  }
};
```

`MAX_TASK_ROUTES` and `routeLabel` are exported from `healTask.ts`. `rowSpec` is from Task 2.

- [ ] **Step 4: Implement `useElementEdits.ts`**

```ts
import { useCallback, useEffect, useState } from 'react';

import type { TokenMeta } from './data';
import { ElementEdit, parseStored, STORAGE_KEY } from './elementEdits';

const read = (meta: TokenMeta[]) => {
  try {
    return parseStored(window.localStorage.getItem(STORAGE_KEY), meta);
  } catch {
    return [];
  }
};

// The session's element edits, newest last, kept per browser.
export const useElementEdits = (meta: TokenMeta[]) => {
  const [edits, setEdits] = useState<ElementEdit[]>(() => read(meta));
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
    } catch {
      // Not kept; the session still has them.
    }
  }, [edits]);
  const add = useCallback(
    (e: ElementEdit) => setEdits((all) => [...all.filter((x) => x.id !== e.id), e]),
    []
  );
  const remove = useCallback((id: string) => setEdits((all) => all.filter((x) => x.id !== id)), []);
  const clear = useCallback(() => setEdits([]), []);
  return { edits, add, remove, clear };
};
```

- [ ] **Step 5: Run the tests**

Run: `npx jest .storybook/workbench/src/lib/elementEdits.test.ts && npm run ds:workbench:typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add .storybook/workbench/src/lib/elementEdits.ts .storybook/workbench/src/lib/elementEdits.test.ts .storybook/workbench/src/lib/useElementEdits.ts
git commit -m "design-system(workbench): element edits: model, frame paint, task text, storage [AI-assisted]"
```

---

### Task 5: Picker rows

**Files:**
- Create: `front/.storybook/workbench/src/lib/tokenPicker.ts`
- Test: `front/.storybook/workbench/src/lib/tokenPicker.test.ts`

**Interfaces:**
- Produces:

```ts
export type PickerGroup = { id: 'match' | 'semantic' | 'scale'; label: string; tokens: TokenMeta[] };
export const pickerGroups = (
  meta: TokenMeta[],
  fits: (t: TokenMeta) => boolean,
  resolved: Record<string, string>,   // live values of the mode, var() chains followed
  raw: string,                         // the rendered value of the field
  query: string
) => PickerGroup[];                    // empty groups left out
```

- [ ] **Step 1: Write the failing tests**

```ts
// lib/tokenPicker.test.ts
import type { TokenMeta } from './data';
import { pickerGroups } from './tokenPicker';

const t = (name: string, tier: 1 | 2, today: string, extra: Partial<TokenMeta> = {}): TokenMeta =>
  ({ name, category: 'space', tier, values: { today, redesign: today }, legacy: [], ...extra });

const META = [
  t('--gv-space-2', 1, '8px'),
  t('--gv-space-3', 1, '12px'),
  t('--gv-gutter', 2, '12px'),
  t('--gv-old', 2, '12px', { deprecated: true }),
  t('--gv-white', 1, '#fff', { category: 'color' }),
];
const live = Object.fromEntries(META.map((m) => [m.name, m.values.today]));
const space = (x: TokenMeta) => x.category === 'space';

describe('pickerGroups', () => {
  it('pins matches, then semantic, then scale; hides deprecated and other categories', () => {
    const groups = pickerGroups(META, space, live, '12px', '');
    expect(groups.map((g) => [g.id, g.tokens.map((x) => x.name)])).toEqual([
      ['match', ['--gv-gutter', '--gv-space-3']],
      ['semantic', []].filter(() => false)[0] ?? ['scale', ['--gv-space-2']],
    ].filter(Boolean));
  });

  it('filters by the query on the short name', () => {
    const groups = pickerGroups(META, space, live, '', 'gut');
    expect(groups).toEqual([
      { id: 'semantic', label: 'Semantic', tokens: [META[2]] },
    ]);
  });

  it('leaves out empty groups', () => {
    expect(pickerGroups(META, space, live, '', 'zzz')).toEqual([]);
  });
});
```

Make the first test's expectation plain once you see the output: with `raw = '12px'` the groups are `match: [--gv-gutter, --gv-space-3]` (tier 2 first, then by name) and `scale: [--gv-space-2]`; no `semantic` group because its only member is already a match. Write it as:

```ts
    expect(groups.map((g) => [g.id, g.tokens.map((x) => x.name)])).toEqual([
      ['match', ['--gv-gutter', '--gv-space-3']],
      ['scale', ['--gv-space-2']],
    ]);
```

- [ ] **Step 2: Run them**

Run: `npx jest .storybook/workbench/src/lib/tokenPicker.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

```ts
// lib/tokenPicker.ts
// The rows of the token picker: the tokens that fit a field, filtered by
// the typed query, in three groups. A token appears once, in the first
// group it belongs to.
import type { TokenMeta } from './data';
import { shortName } from './inspect';

export type PickerGroup = {
  id: 'match' | 'semantic' | 'scale';
  label: string;
  tokens: TokenMeta[];
};

const LABEL = { match: 'Matches', semantic: 'Semantic', scale: 'Scale' } as const;

const byTierThenName = (a: TokenMeta, b: TokenMeta) =>
  a.tier - b.tier || a.name.localeCompare(b.name);

export const pickerGroups = (
  meta: TokenMeta[],
  fits: (t: TokenMeta) => boolean,
  resolved: Record<string, string>,
  raw: string,
  query: string
): PickerGroup[] => {
  const q = query.trim().toLowerCase();
  const want = raw.trim().toLowerCase();
  const all = meta
    .filter((t) => !t.deprecated && fits(t))
    .filter((t) => !q || shortName(t.name).toLowerCase().includes(q))
    .sort(byTierThenName);
  const value = (t: TokenMeta) => (resolved[t.name] ?? t.values.today).trim().toLowerCase();
  const match = want ? all.filter((t) => value(t) === want) : [];
  const rest = all.filter((t) => !match.includes(t));
  const groups: PickerGroup[] = [
    { id: 'match', label: LABEL.match, tokens: match },
    { id: 'semantic', label: LABEL.semantic, tokens: rest.filter((t) => t.tier === 2) },
    { id: 'scale', label: LABEL.scale, tokens: rest.filter((t) => t.tier === 1) },
  ];
  return groups.filter((g) => g.tokens.length > 0);
};
```

- [ ] **Step 4: Run the tests**

Run: `npx jest .storybook/workbench/src/lib/tokenPicker.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .storybook/workbench/src/lib/tokenPicker.ts .storybook/workbench/src/lib/tokenPicker.test.ts
git commit -m "design-system(workbench): picker rows: matches, semantic, scale [AI-assisted]"
```

---

### Task 6: `InspSection`, `ValueField`, `TokenPicker` components and their CSS

**Files:**
- Create: `front/.storybook/workbench/src/components/InspSection.tsx`
- Create: `front/.storybook/workbench/src/components/ValueField.tsx`
- Create: `front/.storybook/workbench/src/components/TokenPicker.tsx`
- Modify: `front/.storybook/workbench/src/components/TokenRow.tsx` (export `Preview`)
- Modify: `front/.storybook/workbench/src/shell.css` (append a block `/* Inspector 2 */`)
- Test: `front/.storybook/workbench/src/components/ValueField.test.tsx`

**Interfaces:**
- Produces:

```tsx
// InspSection
type Props = { id: string; title: string; count?: number; defaultOpen?: boolean; actions?: ReactNode; children: ReactNode };
// data-testid="wb-insp-section" data-section={id}; open state in localStorage 'wb-insp-open' as {[id]: boolean}

// ValueField
export type FieldProps = {
  row: InspectRow;
  liveToken?: string;             // resolved value of row.value.token in the mode, for the pill's muted value
  edit?: ElementEdit;             // the session's edit of this row, when any (for the custom caution mark)
  onCommit: (typed: string) => void;   // a typed value (editable text rows)
  onAttach: (token: TokenName) => void;
  onDetach: () => void;
  onOpenPicker: () => void;
};
export const ValueField: (p: FieldProps) => JSX.Element;
// root: data-testid="wb-insp-value" data-link={row.value.link ?? 'none'} data-token={row.value.token} data-row={row.id}
// attach suggestion: button data-testid="wb-insp-suggest" data-token aria-label="Attach <short name>"
// detach: button data-testid="wb-insp-detach" aria-label="Detach"
// text input: data-testid="wb-insp-input"

// TokenPicker
type Props = { row: InspectRow; meta: TokenMeta[]; resolved: Record<string, string>; category: string; onPick: (t: TokenName) => void; onClose: () => void };
// root: data-testid="wb-token-picker"; rows: button data-testid="wb-token-picker-row" data-token; footer link data-testid="wb-token-picker-edit"
```

- [ ] **Step 1: Export `Preview`**

In `TokenRow.tsx` change `const Preview = (` to `export const Preview = (`.

- [ ] **Step 2: Write the failing test**

```tsx
// components/ValueField.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';

import type { InspectRow } from '../lib/inspect';
import { rowSpec } from '../lib/inspect';

import { ValueField } from './ValueField';

const row = (over: Partial<InspectRow['value']>, id = 'padding-v'): InspectRow => ({
  id,
  label: 'Vertical',
  value: { raw: '9px', shown: '9', ...over },
  ...rowSpec(id),
});

const noop = () => undefined;

describe('ValueField', () => {
  it('draws a text value as an editable field and commits on Enter', () => {
    const onCommit = jest.fn();
    render(<ValueField row={row({})} onCommit={onCommit} onAttach={noop} onDetach={noop} onOpenPicker={noop} />);
    const input = screen.getByTestId('wb-insp-input') as HTMLInputElement;
    expect(input.value).toBe('9');
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith('12');
    expect(screen.getByTestId('wb-insp-value').getAttribute('data-link')).toBe('none');
  });

  it('offers to attach when the value equals a token', () => {
    const onAttach = jest.fn();
    render(<ValueField row={row({ token: '--gv-space-2', link: 'equal' })} onCommit={noop} onAttach={onAttach} onDetach={noop} onOpenPicker={noop} />);
    fireEvent.click(screen.getByTestId('wb-insp-suggest'));
    expect(onAttach).toHaveBeenCalledWith('--gv-space-2');
    expect(screen.getByLabelText('Attach space-2')).toBeTruthy();
  });

  it('draws a bound value as a pill that opens the picker and can detach', () => {
    const onOpenPicker = jest.fn();
    const onDetach = jest.fn();
    render(<ValueField row={row({ token: '--gv-space-2', link: 'linked', raw: '8px', shown: '8' })} liveToken="8px" onCommit={noop} onAttach={noop} onDetach={onDetach} onOpenPicker={onOpenPicker} />);
    expect(screen.getByTestId('wb-insp-value').getAttribute('data-link')).toBe('linked');
    expect(screen.getByText('space-2')).toBeTruthy();
    fireEvent.click(screen.getByText('space-2'));
    expect(onOpenPicker).toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('wb-insp-detach'));
    expect(onDetach).toHaveBeenCalled();
  });

  it('keeps W read-only', () => {
    render(<ValueField row={row({ raw: '145px', shown: '145' }, 'w')} onCommit={noop} onAttach={noop} onDetach={noop} onOpenPicker={noop} />);
    expect(screen.queryByTestId('wb-insp-input')).toBeNull();
    expect(screen.getByText('145')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run it**

Run: `npx jest .storybook/workbench/src/components/ValueField.test.tsx`
Expected: FAIL, module not found.

- [ ] **Step 4: Write `ValueField.tsx`**

```tsx
import { useEffect, useState } from 'react';

import type { TokenName } from '@ds/tokens/tokens';

import type { ElementEdit } from '../lib/elementEdits';
import { InspectRow, shortName } from '../lib/inspect';

import Icon from './Icon';

export type FieldProps = {
  row: InspectRow;
  liveToken?: string;
  edit?: ElementEdit;
  onCommit: (typed: string) => void;
  onAttach: (token: TokenName) => void;
  onDetach: () => void;
  onOpenPicker: () => void;
};

// One value of the selection, as Figma draws it: a pill when the value is
// bound to a token, a field otherwise. The glyph says which property; the
// words live in aria-labels only.
export const ValueField = ({ row, liveToken, edit, onCommit, onAttach, onDetach, onOpenPicker }: FieldProps) => {
  const v = row.value;
  const bound = v.link === 'linked' && !!v.token;
  const swatch = v.swatch ? (
    <span className="wb-vf-swatch" style={{ background: v.swatch }} aria-hidden="true" />
  ) : (
    <Icon name={row.glyph} size={14} />
  );
  const [draft, setDraft] = useState(v.shown);
  useEffect(() => setDraft(v.shown), [v.shown]);
  const name = row.label || row.id;

  if (bound) {
    const token = v.token as TokenName;
    return (
      <div
        className="wb-vf wb-vf-pill"
        data-testid="wb-insp-value"
        data-link="linked"
        data-token={token}
        data-row={row.id}
      >
        <button type="button" className="wb-vf-body" aria-label={`${name}: ${shortName(token)}. Change token`} onClick={onOpenPicker}>
          {swatch}
          <span className="wb-vf-name">{shortName(token)}</span>
          <span className="wb-vf-muted">{liveToken ? row.value.shown : ''}</span>
        </button>
        {row.editable && (
          <button type="button" className="wb-vf-side" data-testid="wb-insp-detach" aria-label="Detach" onClick={onDetach}>
            <Icon name="detach" size={14} />
          </button>
        )}
      </div>
    );
  }

  const commit = (text: string) => {
    const t = text.trim();
    if (!t || t === v.shown) {
      setDraft(v.shown);
      return;
    }
    onCommit(t);
  };

  return (
    <div
      className={edit?.kind === 'custom' ? 'wb-vf wb-vf-custom' : 'wb-vf'}
      data-testid="wb-insp-value"
      data-link={v.link === 'equal' ? 'equal' : 'none'}
      data-token={v.token}
      data-row={row.id}
    >
      <span className="wb-vf-body">
        {swatch}
        {row.editable ? (
          <input
            data-testid="wb-insp-input"
            aria-label={name}
            value={draft}
            spellCheck={false}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit(e.currentTarget.value);
              if (e.key === 'Escape') setDraft(v.shown);
            }}
          />
        ) : (
          <span className="wb-vf-text" aria-label={name}>{v.shown}</span>
        )}
      </span>
      {edit?.kind === 'custom' && (
        <span className="wb-vf-side wb-vf-caution" role="img" aria-label="Custom value, off the scale">
          <Icon name="caution" size={14} />
        </span>
      )}
      {v.link === 'equal' && v.token && row.editable && (
        <button
          type="button"
          className="wb-vf-side"
          data-testid="wb-insp-suggest"
          data-token={v.token}
          aria-label={`Attach ${shortName(v.token)}`}
          onClick={() => onAttach(v.token as TokenName)}
        >
          <Icon name="attach" size={14} />
        </button>
      )}
    </div>
  );
};
```

- [ ] **Step 5: Write `InspSection.tsx`**

```tsx
import { ReactNode, useState } from 'react';

import Icon from './Icon';

const KEY = 'wb-insp-open';

const readOpen = (id: string, fallback: boolean) => {
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    return typeof all[id] === 'boolean' ? all[id] : fallback;
  } catch {
    return fallback;
  }
};
const writeOpen = (id: string, open: boolean) => {
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    window.localStorage.setItem(KEY, JSON.stringify({ ...all, [id]: open }));
  } catch {
    // Not kept.
  }
};

// A block of the inspector that folds, and remembers it.
const InspSection = ({
  id,
  title,
  count,
  defaultOpen = true,
  actions,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(() => readOpen(id, defaultOpen));
  const toggle = () => {
    setOpen(!open);
    writeOpen(id, !open);
  };
  return (
    <section className="wb-insp-block" data-testid="wb-insp-section" data-section={id} data-open={open}>
      <header className="wb-insp-head">
        <button type="button" className="wb-insp-fold" aria-expanded={open} aria-controls={`wb-insp-${id}`} onClick={toggle}>
          <Icon name="chevron" size={14} />
          <h3>{title}</h3>
          {count !== undefined && <span className="wb-count">{count}</span>}
        </button>
        {actions}
      </header>
      <div id={`wb-insp-${id}`} className="wb-insp-grid" hidden={!open}>
        {children}
      </div>
    </section>
  );
};

export default InspSection;
```

- [ ] **Step 6: Write `TokenPicker.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';

import type { TokenName } from '@ds/tokens/tokens';

import type { TokenMeta } from '../lib/data';
import { fitsProp, InspectRow, shortName } from '../lib/inspect';
import { pickerGroups } from '../lib/tokenPicker';

import Icon from './Icon';
import { Preview } from './TokenRow';

type Props = {
  row: InspectRow;
  meta: TokenMeta[];
  // Every token's live value in the mode (var() chains followed).
  resolved: Record<string, string>;
  onPick: (token: TokenName) => void;
  onClose: () => void;
};

// Figma's variable popover: search, the tokens that fit the property, the
// ones that equal the rendered value first. Enter picks the first row, Esc
// or a click outside closes.
const TokenPicker = ({ row, meta, resolved, onPick, onClose }: Props) => {
  const [query, setQuery] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  useEffect(() => {
    const away = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', key);
    };
  }, [onClose]);
  const fits = fitsProp(row.props[0]) ?? (() => false);
  const groups = pickerGroups(meta, fits, resolved, row.value.raw, query);
  const first = groups[0]?.tokens[0];
  const category = meta.find((t) => t.name === (row.value.token ?? first?.name))?.category ?? 'color';
  const target = row.value.token ?? first?.name;
  return (
    <div className="wb-picker" data-testid="wb-token-picker" ref={root} role="dialog" aria-label={`Token for ${row.label || row.id}`}>
      <label className="wb-search wb-picker-search">
        <Icon name="search" size={14} />
        <input
          ref={input}
          type="search"
          placeholder="Search tokens"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && first) onPick(first.name as TokenName);
          }}
        />
      </label>
      <div className="wb-picker-list">
        {groups.length === 0 && <p className="wb-muted wb-picker-none">No token fits.</p>}
        {groups.map((g) => (
          <section key={g.id} className="wb-picker-group">
            <h4>{g.label}</h4>
            {g.tokens.map((t) => (
              <button
                key={t.name}
                type="button"
                className="wb-picker-row"
                data-testid="wb-token-picker-row"
                data-token={t.name}
                aria-pressed={t.name === row.value.token}
                onClick={() => onPick(t.name as TokenName)}
              >
                <span className="wb-picker-preview" aria-hidden="true">
                  <Preview token={t} value={resolved[t.name] ?? t.values.today} all={resolved} />
                </span>
                <span className="wb-picker-name">{shortName(t.name)}</span>
                <span className="wb-vf-muted">{resolved[t.name] ?? t.values.today}</span>
              </button>
            ))}
          </section>
        ))}
      </div>
      {target && (
        <a className="wb-picker-edit" data-testid="wb-token-picker-edit" href={`#/foundations/${category}/${encodeURIComponent(target)}`}>
          <Icon name="external" size={14} />
          Edit in Foundations
        </a>
      )}
    </div>
  );
};

export default TokenPicker;
```

`Preview`'s `all` prop expects the mode's full value map: `resolved` is that map (Task 9 passes `live[mode]` from `resolveTokens`).

- [ ] **Step 7: CSS**

Append to `shell.css`:

```css
/* Inspector 2: glyph fields, pills, sections, the picker. */
.wb-insp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gv-space-2);
  padding: 0 var(--gv-space-4) var(--gv-space-3);
}
.wb-insp-grid > .wb-insp-full { grid-column: 1 / -1; }
.wb-insp-fold {
  display: flex;
  align-items: center;
  gap: var(--gv-space-1);
  padding: 0;
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
}
.wb-insp-fold .wb-icon { transition: transform 120ms; color: var(--wb-muted); }
.wb-insp-fold[aria-expanded='false'] .wb-icon { transform: rotate(-90deg); }
.wb-insp-fold h3 { margin: 0; }

.wb-vf {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 32px;
  font-size: var(--gv-fs-xs);
  color: var(--wb-text);
  background: var(--wb-subtle);
  border: 1px solid transparent;
  border-radius: var(--wb-radius);
}
.wb-vf:focus-within { border-color: var(--wb-accent); background: var(--wb-bg); }
.wb-vf-body {
  display: flex;
  flex: 1;
  gap: var(--gv-space-2);
  align-items: center;
  min-width: 0;
  padding: 0 var(--gv-space-2);
  font: inherit;
  color: inherit;
  text-align: left;
  background: none;
  border: 0;
}
.wb-vf-body > .wb-icon { flex: none; color: var(--wb-muted); }
.wb-vf input {
  flex: 1;
  min-width: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  outline: none;
}
.wb-vf-text { flex: 1; }
.wb-vf-swatch {
  flex: none;
  width: 16px;
  height: 16px;
  border: 1px solid var(--wb-border-strong);
  border-radius: 3px;
}
.wb-vf-pill .wb-vf-body { cursor: pointer; }
.wb-vf-pill { background: var(--wb-accent-soft); border-color: transparent; }
.wb-vf-pill:hover { border-color: var(--wb-border-strong); }
.wb-vf-name { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wb-vf-muted {
  margin-left: auto;
  font-family: var(--gv-font-mono, ui-monospace, monospace);
  font-size: 11px;
  color: var(--wb-muted);
  white-space: nowrap;
}
.wb-vf-side {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 30px;
  padding: 0;
  color: var(--wb-muted);
  background: none;
  border: 0;
  border-radius: var(--wb-radius);
  cursor: pointer;
}
.wb-vf-side:hover, .wb-vf-side:focus-visible { color: var(--wb-accent); background: var(--wb-bg); }
.wb-vf-pill [data-testid='wb-insp-detach'] { opacity: 0; }
.wb-vf-pill:hover [data-testid='wb-insp-detach'],
.wb-vf-pill:focus-within [data-testid='wb-insp-detach'] { opacity: 1; }
.wb-vf-custom { border-color: var(--wb-warn); }
.wb-vf-caution { color: var(--wb-warn); cursor: default; }

.wb-insp-prop { position: relative; }
.wb-picker {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  left: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  max-height: 360px;
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  border-radius: var(--wb-radius-lg);
  box-shadow: var(--wb-shadow-raised);
}
.wb-picker-search { margin: var(--gv-space-2); }
.wb-picker-list { flex: 1; overflow: auto; padding: 0 var(--gv-space-2) var(--gv-space-2); }
.wb-picker-group h4 {
  margin: var(--gv-space-2) var(--gv-space-2) var(--gv-space-1);
  font-size: 11px;
  font-weight: 500;
  color: var(--wb-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.wb-picker-row {
  display: flex;
  gap: var(--gv-space-2);
  align-items: center;
  width: 100%;
  min-height: 32px;
  padding: 0 var(--gv-space-2);
  font: inherit;
  font-size: var(--gv-fs-xs);
  color: var(--wb-text);
  text-align: left;
  background: none;
  border: 0;
  border-radius: var(--wb-radius);
  cursor: pointer;
}
.wb-picker-row:hover, .wb-picker-row:focus-visible { background: var(--wb-subtle); }
.wb-picker-row[aria-pressed='true'] { background: var(--wb-accent-soft); }
.wb-picker-preview { display: inline-flex; flex: none; width: 28px; justify-content: center; }
.wb-picker-preview .wb-pv-swatch { width: 16px; height: 16px; border-radius: 3px; }
.wb-picker-preview .wb-pv-space > span { height: 4px; max-width: 28px; }
.wb-picker-preview .wb-pv-type { font-size: 14px; }
.wb-picker-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wb-picker-none { margin: var(--gv-space-2); }
.wb-picker-edit {
  display: flex;
  gap: var(--gv-space-1);
  align-items: center;
  padding: var(--gv-space-2) var(--gv-space-3);
  font-size: var(--gv-fs-xs);
  border-top: 1px solid var(--wb-border);
}

.wb-insp-layer {
  display: flex;
  align-items: center;
  gap: var(--gv-space-1);
  width: 100%;
  padding: var(--gv-space-1) var(--gv-space-2);
  font: inherit;
  font-size: var(--gv-fs-xs);
  font-weight: 600;
  color: var(--wb-heading);
  text-align: left;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--wb-radius);
  cursor: pointer;
}
.wb-insp-layer:hover { background: var(--wb-subtle); }
.wb-insp-ancestors {
  position: absolute;
  z-index: 30;
  min-width: 220px;
  padding: var(--gv-space-1);
  margin: 0;
  list-style: none;
  background: var(--wb-bg);
  border: 1px solid var(--wb-border);
  border-radius: var(--wb-radius-lg);
  box-shadow: var(--wb-shadow-raised);
}
.wb-insp-ancestors button {
  display: flex;
  gap: var(--gv-space-2);
  align-items: center;
  width: 100%;
  padding: var(--gv-space-1) var(--gv-space-2);
  font: inherit;
  font-size: var(--gv-fs-xs);
  text-align: left;
  background: none;
  border: 0;
  border-radius: var(--wb-radius);
  cursor: pointer;
}
.wb-insp-ancestors button:hover { background: var(--wb-subtle); }

.wb-also-row {
  display: flex;
  gap: var(--gv-space-2);
  align-items: center;
  grid-column: 1 / -1;
  min-height: 28px;
  font-size: var(--gv-fs-xs);
}
.wb-also-row > .wb-icon { color: var(--wb-muted); }
.wb-also-row code { font-size: 11px; }
.wb-also-row .wb-heal-button { margin-left: auto; }
```

Check that `--gv-font-mono` exists in `tokens.css`; if not, drop the custom property and keep the `ui-monospace, monospace` stack.

- [ ] **Step 8: Run the tests and the typecheck**

Run: `npx jest .storybook/workbench/src/components && npm run ds:workbench:typecheck`
Expected: PASS. (Design.tsx still compiles against the old API; if Task 2's change broke it, Task 9 fixes it: a typecheck failure only inside `panels/Design.tsx` is acceptable here.)

- [ ] **Step 9: Commit**

```bash
git add .storybook/workbench/src/components/InspSection.tsx .storybook/workbench/src/components/ValueField.tsx .storybook/workbench/src/components/ValueField.test.tsx .storybook/workbench/src/components/TokenPicker.tsx .storybook/workbench/src/components/TokenRow.tsx .storybook/workbench/src/shell.css
git commit -m "design-system(workbench): glyph fields, token pills, sections and the token picker [AI-assisted]"
```

---

### Task 7: Foundations deep link

**Files:**
- Modify: `front/.storybook/workbench/src/lib/router.ts`
- Modify: `front/.storybook/workbench/src/pages/Foundations.tsx` (props + one effect)
- Modify: `front/.storybook/workbench/src/App.tsx` (pass `token`)
- Test: `front/.storybook/workbench/src/lib/router.test.ts` (create if missing; else append)

**Interfaces:**
- Produces: `Route` variant `{ name: 'foundations'; category?: string; token?: string }`; Foundations prop `token?: string`.

- [ ] **Step 1: Write the failing test**

```ts
import { parseHash } from './router';

describe('parseHash foundations token', () => {
  it('reads a third segment as the token to show', () => {
    expect(parseHash('#/foundations/space/--gv-space-3')).toEqual({
      name: 'foundations', category: 'space', token: '--gv-space-3',
    });
    expect(parseHash('#/foundations/color')).toEqual({ name: 'foundations', category: 'color' });
  });
  it('still rejects a third segment elsewhere', () => {
    expect(parseHash('#/components/a/b').name).toBe('not-found');
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx jest .storybook/workbench/src/lib/router.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `router.ts` change the `rest` guard and the foundations case:

```ts
  const [, first, second, ...rest] = path.split('/');
  if (rest.length > 1 || (rest.length === 1 && first !== 'foundations')) {
    return { name: 'not-found', path };
  }
  const param = second ? decodeURIComponent(second) : undefined;
  switch (first) {
    // ...
    case 'foundations':
      return rest.length
        ? { name: 'foundations', category: param, token: decodeURIComponent(rest[0]) }
        : { name: 'foundations', category: param };
```

and the `Route` type: `| { name: 'foundations'; category?: string; token?: string }`.

In `App.tsx` pass `token={route.token}` to `<Foundations …>`. In `Foundations.tsx` add `token?: string` to `Props` and, in the category page component (the one that defines `pick` near line 512), after `pick` is defined:

```ts
  const shown = useRef<string>();
  useEffect(() => {
    if (!token || shown.current === token || !tokens.length) return;
    shown.current = token;
    const id = groups.find((g) => g.tokens.some((t) => t.name === token))?.id;
    if (id) pick(id, token);
    else {
      window.requestAnimationFrame(() => {
        const input = document.getElementById(`wb-edit-${token.slice(2)}`);
        input?.scrollIntoView({ block: 'center' });
        input?.focus({ preventScroll: true });
      });
    }
  }, [token, groups, tokens]);
```

(`pick` is a plain function in render scope; if the linter wants it in the deps, wrap `pick` in `useCallback` first.)

- [ ] **Step 4: Run tests and typecheck**

Run: `npx jest .storybook/workbench/src/lib/router.test.ts && npm run ds:workbench:typecheck`
Expected: PASS (Design.tsx caveat as before).

- [ ] **Step 5: Commit**

```bash
git add .storybook/workbench/src/lib/router.ts .storybook/workbench/src/lib/router.test.ts .storybook/workbench/src/pages/Foundations.tsx .storybook/workbench/src/App.tsx
git commit -m "design-system(workbench): foundations deep link to a token row [AI-assisted]"
```

---

### Task 8: Changes drawer takes element edits

**Files:**
- Modify: `front/.storybook/workbench/src/components/ChangesDrawer.tsx`
- Test: `front/.storybook/workbench/src/components/ChangesDrawer.test.tsx` (create)

**Interfaces:**
- Consumes: `ElementEdit`, `taskOfEdit`, `TaskContext`, `changesLook` (Task 4).
- Produces: new props

```ts
type Props = {
  meta: TokenMeta[]; mode: Mode; overrides: Overrides; onReset: (name?: TokenName) => void; onClose: () => void;
  elements?: ElementEdit[];                 // default []
  onResetElement?: (id: string) => void;
  onResetElements?: () => void;
  task?: TaskContext;                       // when set, "Copy for agent" is offered
  resolve?: (token: TokenName) => string;   // live value of a token, for the look mark
};
// rows: li data-testid="wb-change-row" data-edit={id} data-kind={kind}; button data-testid="wb-copy-agent"
```

- [ ] **Step 1: Write the failing test**

```tsx
import { fireEvent, render, screen } from '@testing-library/react';

import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';

import type { TokenMeta } from '../lib/data';
import type { ElementEdit } from '../lib/elementEdits';

import ChangesDrawer from './ChangesDrawer';

jest.mock('../lib/clipboard', () => ({ copyText: jest.fn(async () => true) }));
import { copyText } from '../lib/clipboard';

const meta = tokensMeta as TokenMeta[];
const edit: ElementEdit = {
  id: 's|0|fill', storyId: 's', path: [0], rowId: 'fill', label: 'Fill', glyph: 'fill',
  props: ['background-color'], from: { raw: 'rgb(96, 69, 150)', shown: '604596' },
  to: { value: '#604596', token: '--gv-tenant-primary' }, kind: 'attach', at: 1,
};

describe('ChangesDrawer with element edits', () => {
  it('lists the edit and copies its task', async () => {
    const onResetElement = jest.fn();
    render(
      <ChangesDrawer
        meta={meta} mode="today" overrides={{}} onReset={() => undefined} onClose={() => undefined}
        elements={[edit]} onResetElement={onResetElement} onResetElements={() => undefined}
        resolve={() => '#604596'}
        task={{ component: 'Button', file: 'b.tsx', storyId: 's', routes: [], mode: 'both', layer: 'button', findings: [] }}
      />
    );
    const row = screen.getByTestId('wb-change-row');
    expect(row.getAttribute('data-kind')).toBe('attach');
    expect(row.textContent).toContain('tenant-primary');
    fireEvent.click(screen.getByTestId('wb-copy-agent'));
    await Promise.resolve();
    expect((copyText as jest.Mock).mock.calls[0][0]).toContain('→ --gv-tenant-primary · mode both');
    fireEvent.click(row.querySelector('button')!);
    expect(onResetElement).toHaveBeenCalledWith('s|0|fill');
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx jest .storybook/workbench/src/components/ChangesDrawer.test.tsx`
Expected: FAIL (no element rows).

- [ ] **Step 3: Implement**

In `ChangesDrawer.tsx`:
- Add the props from Interfaces (optional, with defaults).
- Count: `const total = entries.length + elements.length;` in the header `Changes ({total})`; the empty message shows when `total === 0`.
- Before the token list, when `elements.length > 0`:

```tsx
          <h3 className="wb-drawer-group">Elements</h3>
          <ul className="wb-change-list">
            {elements.map((e) => {
              const look = resolve ? changesLook(e, resolve) : e.kind !== 'attach';
              const mark: IconName = e.kind === 'swap' ? 'swap' : look ? 'caution' : 'attach';
              return (
                <li key={e.id} data-testid="wb-change-row" data-edit={e.id} data-kind={e.kind}>
                  <span className="wb-change-glyph" aria-hidden="true">
                    {e.from.raw && /color|fill/.test(e.rowId) ? (
                      <span className="wb-vf-swatch" style={{ background: e.to.token ? resolve?.(e.to.token) : e.to.value }} />
                    ) : (
                      <Icon name={e.glyph} size={14} />
                    )}
                  </span>
                  <div>
                    <div className="wb-change-where">{e.label}</div>
                    <span className="wb-muted">{e.from.token ? shortName(e.from.token) : e.from.shown}</span>
                    {' → '}
                    <strong>{e.to.token ? shortName(e.to.token) : e.to.value}</strong>
                  </div>
                  <span className={look ? 'wb-change-mark wb-change-look' : 'wb-change-mark'} role="img" aria-label={look ? "Changes today's look" : e.kind === 'swap' ? 'Swaps the token' : 'Attaches the token'}>
                    <Icon name={mark} size={14} />
                  </span>
                  <button type="button" onClick={() => onResetElement?.(e.id)}>Reset</button>
                </li>
              );
            })}
          </ul>
```

  Imports: `Icon, { IconName }` from `./Icon`, `shortName` from `../lib/inspect`, `changesLook, ElementEdit, taskOfEdit, TaskContext` from `../lib/elementEdits`.
- When `entries.length > 0` and `elements.length > 0`, put `<h3 className="wb-drawer-group">Tokens</h3>` over the token list.
- Actions: first button, when `task && elements.length > 0`:

```tsx
            <button type="button" data-testid="wb-copy-agent" onClick={() => copy('tasks for the agent', elements.map((e) => taskOfEdit(e, task)).join('\n\n'))}>
              Copy for agent
            </button>
```

  "Reset all" calls both `onReset()` and `onResetElements?.()`.
- CSS (append to the Inspector 2 block): `.wb-drawer-group { margin: var(--gv-space-3) 0 var(--gv-space-1); font-size: 11px; font-weight: 500; color: var(--wb-muted); text-transform: uppercase; letter-spacing: .04em; } .wb-change-glyph { display: inline-flex; width: 20px; justify-content: center; color: var(--wb-muted); } .wb-change-where { font-size: 11px; color: var(--wb-muted); } .wb-change-mark { display: inline-flex; color: var(--wb-muted); } .wb-change-look { color: var(--wb-warn); }`. Check `.wb-change-list li` is a flex row with a gap; if it is a grid of three columns, extend it to `auto 1fr auto auto`.

- [ ] **Step 4: Run tests**

Run: `npx jest .storybook/workbench/src/components/ChangesDrawer.test.tsx && npm run ds:workbench:typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .storybook/workbench/src/components/ChangesDrawer.tsx .storybook/workbench/src/components/ChangesDrawer.test.tsx .storybook/workbench/src/shell.css
git commit -m "design-system(workbench): one Changes list: element edits with Copy for agent [AI-assisted]"
```

---

### Task 9: The Design tab

**Files:**
- Rewrite: `front/.storybook/workbench/src/panels/Design.tsx`
- Delete: `front/.storybook/workbench/src/panels/Tokens.tsx`
- Modify: `front/.storybook/workbench/src/lib/componentPanels.ts` (remove `panelTokens`, `healCount`, `PanelToken`, `Match` and their tests in `componentPanels.test.ts` if nothing else imports them: `grep -rn panelTokens .storybook scripts`)

**Interfaces:**
- Consumes: Tasks 2, 4, 5, 6.
- Produces:

```ts
type Props = {
  section: Section; storyId: string; states: StoryRef[]; variants: StoryRef[]; tabLabel: (s: StoryRef) => string;
  componentName: string;
  frames: (Window | null)[];
  selection: { selected: Element | null; version: number; pick: (el: Element | null) => void; label?: string };
  meta: TokenMeta[]; mode: Mode; overrides: Overrides;   // token overrides, for live values
  edits: ElementEdit[]; addEdit: (e: ElementEdit) => void; removeEdit: (id: string) => void;
  findings: Finding[];       // fileFindings(scan, group.file)
  file?: string;
};
```

- [ ] **Step 1: Write `Design.tsx`**

```tsx
import { useEffect, useMemo, useState } from 'react';

import type { Mode, TokenName } from '@ds/tokens/tokens';

import Icon from '../components/Icon';
import InspSection from '../components/InspSection';
import { HealButton } from '../components/HealCopy';
import TokenPicker from '../components/TokenPicker';
import { ValueField } from '../components/ValueField';
import { resolveTokens } from '../lib/contrast';
import type { Finding, TokenMeta } from '../lib/data';
import { editId, ElementEdit } from '../lib/elementEdits';
import { healToken, isHealable } from '../lib/healTask';
import {
  Inspection,
  InspectRow,
  inspectElement,
  labelOf,
  parentTarget,
  pathOf,
} from '../lib/inspect';
import type { Overrides } from '../lib/overrides';
import { snapValue } from '../lib/overrides';
import type { Section, StoryRef } from '../lib/stories';
import { DEFS } from '../lib/tokenValues';

import Controls from './Controls';

type Selection = {
  selected: Element | null;
  version: number;
  pick: (el: Element | null) => void;
  label?: string;
};

type Props = {
  section: Section;
  storyId: string;
  states: StoryRef[];
  variants: StoryRef[];
  tabLabel: (s: StoryRef) => string;
  componentName: string;
  frames: (Window | null)[];
  selection: Selection;
  meta: TokenMeta[];
  mode: Mode;
  overrides: Overrides;
  edits: ElementEdit[];
  addEdit: (e: ElementEdit) => void;
  removeEdit: (id: string) => void;
  findings: Finding[];
  file?: string;
};

const SETTLE_MS = [60, 600];
const ALSO_FIRST = 12;

// Whether the frame can draw a font family (see Task 2's inspect.ts: the
// panel passes this to inspectElement). Unchanged from the old panel.
const fontCheck = (doc: Document) => {
  const ctx = doc.createElement('canvas').getContext('2d');
  const cache = new Map<string, boolean>();
  const GENERIC =
    /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-\w+|-apple-system|BlinkMacSystemFont)$/i;
  return (family: string) => {
    if (GENERIC.test(family)) return true;
    if (!ctx) return true;
    let ok = cache.get(family);
    if (ok === undefined) {
      const width = (font: string) => {
        ctx.font = `32px ${font}`;
        return ctx.measureText('mmmmmmmmmlli1WQgé').width;
      };
      ok =
        width(`"${family}", monospace`) !== width('monospace') ||
        width(`"${family}", serif`) !== width('serif');
      cache.set(family, ok);
    }
    return ok;
  };
};

// The ancestors of the selection up to the story box, nearest first.
const ancestorsOf = (el: Element): Element[] => {
  const out: Element[] = [];
  let at = parentTarget(el);
  while (at) {
    out.push(at);
    at = parentTarget(at);
  }
  return out;
};

const GLYPH_OF_FINDING: Record<string, Parameters<typeof Icon>[0]['name']> = {
  px: 'padding',
  hex: 'fill',
  rgba: 'fill',
  'named-color': 'fill',
  'layout-spacing': 'gap',
  'styled-block': 'layers',
  'legacy-theme': 'tokens',
  'legacy-colors': 'fill',
  'legacy-bo': 'tokens',
};

const StorySelect = ({
  id,
  stories,
  value,
  tabLabel,
  onChange,
}: {
  id: string;
  stories: StoryRef[];
  value: string;
  tabLabel: (s: StoryRef) => string;
  onChange: (id: string) => void;
}) => (
  <label className="wb-toolbar-field wb-toolbar-field-story">
    <span className="wb-visually-hidden">{id}</span>
    <select
      data-testid={`wb-insp-${id}`}
      value={value}
      onChange={(e) => e.target.value && onChange(e.target.value)}
    >
      {!value && <option value="">Choose…</option>}
      {stories.map((s) => (
        <option key={s.id} value={s.id}>
          {tabLabel(s)}
        </option>
      ))}
    </select>
    <Icon name="chevron" size={14} />
  </label>
);

// The Design tab: the component's variant row, the selected element, its
// values as fields and pills, the rest of the file's hard values, the props.
const Design = ({
  section,
  storyId,
  states,
  variants,
  tabLabel,
  componentName,
  frames,
  selection,
  meta,
  mode,
  overrides,
  edits,
  addEdit,
  removeEdit,
  findings,
  file,
}: Props) => {
  const frame = frames[0];
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [picker, setPicker] = useState<string | undefined>();
  const [ancestors, setAncestors] = useState(false);
  const [alsoAll, setAlsoAll] = useState(false);
  const { selected, version, pick } = selection;
  const live = useMemo(() => resolveTokens(DEFS, overrides), [overrides]);
  const resolved = live[mode];

  useEffect(() => {
    if (!selected || !frame) {
      setInspection(null);
      return undefined;
    }
    const read = () => {
      try {
        setInspection(inspectElement(selected, meta, fontCheck(frame.document)));
      } catch {
        setInspection(null);
      }
    };
    const timers = SETTLE_MS.map((ms) => window.setTimeout(read, ms));
    let fonts: FontFaceSet | undefined;
    try {
      fonts = frame.document.fonts;
      fonts.addEventListener('loadingdone', read);
    } catch {
      fonts = undefined;
    }
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      fonts?.removeEventListener('loadingdone', read);
    };
  }, [selected, version, frame, meta, overrides, edits, mode]);
  useEffect(() => {
    setPicker(undefined);
    setAncestors(false);
  }, [selected]);

  const go = (id: string) => {
    window.location.hash = `#/${section}/${encodeURIComponent(id)}`;
  };
  const inStates = states.some((s) => s.id === storyId);
  const inVariants = variants.some((s) => s.id === storyId);

  const path = selected ? pathOf(selected) : null;
  const editOf = (row: InspectRow) =>
    edits.find((e) => e.id === editId(storyId, path, row.id));
  const base = (row: InspectRow, sectionLabel: string) => ({
    id: editId(storyId, path, row.id),
    storyId,
    path,
    rowId: row.id,
    label: row.label ? `${sectionLabel} · ${row.label}` : sectionLabel,
    glyph: row.glyph,
    props: row.props,
    from: editOf(row)?.from ?? { raw: row.value.raw, shown: row.value.shown, token: row.value.link === 'linked' ? row.value.token : undefined },
    at: Date.now(),
  });
  const attach = (row: InspectRow, sectionLabel: string, token: TokenName) =>
    addEdit({
      ...base(row, sectionLabel),
      to: { value: resolved[token] ?? row.value.raw, token },
      kind: row.value.link === 'linked' ? 'swap' : 'attach',
    });
  const detach = (row: InspectRow, sectionLabel: string) =>
    addEdit({ ...base(row, sectionLabel), to: { value: row.value.raw }, kind: 'detach' });
  const commit = (row: InspectRow, sectionLabel: string, typed: string) => {
    const withUnit = row.snap && row.snap !== 'color' && /^\d+(\.\d+)?$/.test(typed) ? `${typed}px` : typed;
    const value = row.snap === 'color' && /^[0-9a-f]{3,8}$/i.test(withUnit) ? `#${withUnit}` : withUnit;
    const r = snapValue(row.snap, value, meta, mode);
    if (r.to) {
      addEdit({ ...base(row, sectionLabel), to: { value: r.value, token: r.to }, kind: row.value.link === 'linked' ? 'swap' : 'attach' });
    } else {
      addEdit({ ...base(row, sectionLabel), to: { value: r.value }, kind: 'custom' });
    }
  };

  // Hard values of the file the selection does not cover: every healable
  // finding, minus those an edit already stands for.
  const covered = new Set(edits.filter((e) => e.kind === 'file').map((e) => `${e.line}:${e.col}`));
  const also = findings.filter((f) => isHealable(f) && !covered.has(`${f.line}:${f.col}`));
  const alsoShown = alsoAll ? also : also.slice(0, ALSO_FIRST);
  const healFile = (f: Finding) => {
    const token = healToken(f, meta)[0] as TokenName | undefined;
    addEdit({
      id: editId(storyId, null, `${f.line}:${f.col}`),
      storyId,
      path: null,
      rowId: 'file',
      label: `${f.category} L${f.line}`,
      glyph: GLYPH_OF_FINDING[f.category] ?? 'tokens',
      props: [],
      from: { raw: f.raw.replace(/\s+/g, ''), shown: f.raw.replace(/\s+/g, '') },
      to: { value: token ? resolved[token] ?? '' : '', token },
      kind: 'file',
      file: f.file,
      line: f.line,
      col: f.col,
      at: Date.now(),
    });
  };

  return (
    <div className="wb-insp" data-testid="wb-panel-design">
      <section className="wb-insp-block" data-testid="wb-insp-story">
        <header className="wb-insp-head">
          <h3>{componentName}</h3>
        </header>
        <div className="wb-insp-grid">
          {states.length > 0 && (
            <div className={variants.length > 0 ? '' : 'wb-insp-full'}>
              <StorySelect id="state" stories={states} value={inStates ? storyId : ''} tabLabel={tabLabel} onChange={go} />
            </div>
          )}
          {variants.length > 0 && (
            <div className={states.length > 0 ? '' : 'wb-insp-full'}>
              <StorySelect id="variant" stories={variants} value={inVariants ? storyId : ''} tabLabel={tabLabel} onChange={go} />
            </div>
          )}
        </div>
      </section>

      <section className="wb-insp-block wb-insp-prop" data-testid="wb-insp-selection">
        {selected ? (
          <>
            <button
              type="button"
              className="wb-insp-layer"
              data-testid="wb-insp-layer"
              aria-haspopup="menu"
              aria-expanded={ancestors}
              onClick={() => setAncestors((a) => !a)}
            >
              <Icon name="layers" size={14} />
              <span className="wb-insp-layer-name">{labelOf(selected)}</span>
              <Icon name="chevron" size={14} />
            </button>
            {ancestors && (
              <ul className="wb-insp-ancestors" role="menu">
                {ancestorsOf(selected).map((el, i) => (
                  <li key={i} role="none">
                    <button type="button" role="menuitem" onClick={() => { pick(el); setAncestors(false); }}>
                      <Icon name="up" size={14} />
                      {labelOf(el)}
                    </button>
                  </li>
                ))}
                {ancestorsOf(selected).length === 0 && (
                  <li className="wb-muted" role="none">At the top of the story</li>
                )}
              </ul>
            )}
          </>
        ) : (
          <p className="wb-insp-hint">
            <Icon name="pointer" size={14} />
          </p>
        )}
      </section>

      {inspection?.sections.map((s) => (
        <InspSection key={s.id} id={s.id} title={s.label}>
          {s.rows.map((r) => {
            const key = `${s.id}:${r.id}`;
            return (
              <div key={key} className={r.half ? 'wb-insp-prop' : 'wb-insp-prop wb-insp-full'}>
                <ValueField
                  row={r}
                  liveToken={r.value.token ? resolved[r.value.token] : undefined}
                  edit={editOf(r)}
                  onCommit={(typed) => commit(r, s.label, typed)}
                  onAttach={(token) => attach(r, s.label, token)}
                  onDetach={() => detach(r, s.label)}
                  onOpenPicker={() => setPicker(picker === key ? undefined : key)}
                />
                {picker === key && (
                  <TokenPicker
                    row={r}
                    meta={meta}
                    resolved={resolved}
                    onPick={(token) => { attach(r, s.label, token); setPicker(undefined); }}
                    onClose={() => setPicker(undefined)}
                  />
                )}
              </div>
            );
          })}
        </InspSection>
      ))}

      {also.length > 0 && (
        <InspSection id="also" title="Also in this file" count={also.length} defaultOpen={false}>
          {alsoShown.map((f) => {
            const token = healToken(f, meta)[0];
            return (
              <div key={`${f.line}:${f.col}`} className="wb-also-row" data-testid="wb-also-row">
                <Icon name={GLYPH_OF_FINDING[f.category] ?? 'tokens'} size={14} />
                <code>{f.raw.replace(/\s+/g, '')}</code>
                <Icon name="arrow" size={12} />
                {token ? <code>{token.replace(/^--gv-/, '')}</code> : <span className="wb-muted">choose</span>}
                <HealButton iconOnly label={`Heal line ${f.line}`} onClick={() => healFile(f)} testId="wb-also-heal" />
              </div>
            );
          })}
          {!alsoAll && also.length > ALSO_FIRST && (
            <button type="button" className="wb-controls-more wb-insp-full" onClick={() => setAlsoAll(true)}>
              {`Show all ${also.length}`}
            </button>
          )}
        </InspSection>
      )}

      <details className="wb-insp-block wb-insp-props" data-testid="wb-insp-props">
        <summary className="wb-insp-head">
          <h3>Props</h3>
          <Icon name="chevron" size={14} />
        </summary>
        <Controls storyId={storyId} frames={frames} />
      </details>
    </div>
  );
};

export default Design;
```

Notes for the implementer:
- `removeEdit` is unused inside the panel on purpose (Changes resets); drop it from the props if the linter complains.
- `GLYPH_OF_FINDING` is typed through `Icon`'s props to avoid importing `IconName` as a value; `import type { IconName }` is the cleaner form if the file already imports it.
- The old `TokenEditor`, `LINK_TITLE`, `Block`, `Row`, the legend and the Component/Canvas blocks are gone. `MODE_LABEL`, `cities`, `LANGUAGES`, `Field`, `MODES`, `VIEWPORTS`, `ChangesDrawer`, `tokenEdit` imports are removed from this file.
- `file` is unused here if `findings` are passed already filtered; remove the prop if so.

- [ ] **Step 2: Delete `panels/Tokens.tsx`** and anything only it used (`grep -rn "panels/Tokens\|panelTokens\|healCount\|MATCH_LABEL" .storybook scripts`). Remove `panelTokens`, `healCount`, `PanelToken`, `Match`, `MATCH_ORDER` from `componentPanels.ts` and their `describe` blocks from `componentPanels.test.ts` when no other importer remains. Keep `fileFindings`, `usageFiles`, `propCounts`, `routesByOffice`, `githubLink`, `reviewLink`, `CATEGORY_LABEL`.

- [ ] **Step 3: Typecheck**

Run: `npm run ds:workbench:typecheck`
Expected: errors only in `pages/Component.tsx` (props changed): Task 10 fixes them. If `jest` shows `componentPanels.test.ts` failing on removed exports, you missed a `describe`.

- [ ] **Step 4: Commit**

```bash
git add .storybook/workbench/src/panels/Design.tsx .storybook/workbench/src/lib/componentPanels.ts .storybook/workbench/src/lib/componentPanels.test.ts
git rm .storybook/workbench/src/panels/Tokens.tsx
git commit -m "design-system(workbench): the Design tab: fields, pills, picker, also-in-file [AI-assisted]"
```

---

### Task 10: The component page: tabs, canvas bar, usage disclosure, one Changes

**Files:**
- Modify: `front/.storybook/workbench/src/pages/Component.tsx`
- Modify: `front/.storybook/workbench/src/components/Toolbar.tsx` (add `CanvasSettings`)
- Modify: `front/.storybook/workbench/src/components/Canvas.tsx` (apply element edits)
- Modify: `front/.storybook/workbench/src/shell.css`

**Interfaces:**
- Consumes: `useElementEdits` (Task 4), `applyElementEdits`, `Design` props (Task 9), `ChangesDrawer` props (Task 8).
- Produces:
  - `CanvasSettings({ toolbar, setToolbar, storyLang })` in `Toolbar.tsx`: City, Viewport, Language as `Field`s each prefixed by `<Icon name="city" | "monitor" | "language" size={14} />`, ids unchanged (`wb-toolbar-city`, `wb-toolbar-viewport`, `wb-toolbar-lang`).
  - Mode segmented on the canvas bar: `data-testid="wb-toolbar-mode"` on the group, buttons `data-value="today" | "redesign" | "both"`.
  - `Canvas` prop `elementEdits: ElementEdit[]` applied in `apply()` after `applyEdits(...)`: `applyElementEdits(doc, elementEdits, storyId, appliedElements.current.get(doc) ?? new map)` with a `WeakMap<Document, Map<string, Map<string, string>>>` like `applied`.
  - Page: `button data-testid="wb-changes-toggle"` on the canvas bar (badge count = token overrides + element edits); `details data-testid="wb-usage-toggle"` under the header wrapping `<Usage …/>`; tabs `data-tab="design" | "a11y"`.

- [ ] **Step 1: `CanvasSettings` in `Toolbar.tsx`**

```tsx
import { cities } from '../../../cities';
import { LANGUAGES } from '../../../languages';

// City, Viewport and Language on the canvas bar: glyph and value, no label.
export const CanvasSettings = ({
  toolbar,
  setToolbar,
  storyLang,
}: {
  toolbar: ToolbarState;
  setToolbar: (next: ToolbarState) => void;
  storyLang?: string;
}) => {
  const set =
    <K extends keyof ToolbarState>(key: K) =>
    (v: string) =>
      setToolbar({ ...toolbar, [key]: v as ToolbarState[K] });
  const lang = storyLang ?? toolbar.lang;
  const languages = LANGUAGES.map(({ value, label }) => ({ value, label }));
  if (!languages.some((l) => l.value === lang)) languages.push({ value: lang, label: lang });
  return (
    <span className="wb-canvas-settings" role="group" aria-label="Canvas">
      <span className="wb-canvas-setting">
        <Icon name="city" size={14} />
        <Field id="city" label="City" value={toolbar.city} options={Object.entries(cities).map(([v, c]) => ({ value: v, label: c.title }))} onChange={set('city')} />
      </span>
      <span className="wb-canvas-setting">
        <Icon name="monitor" size={14} />
        <Field id="viewport" label="Viewport" value={toolbar.viewport} options={VIEWPORTS} onChange={set('viewport')} />
      </span>
      <span className="wb-canvas-setting">
        <Icon name="language" size={14} />
        <Field id="lang" label="Language" value={lang} options={languages} onChange={set('lang')} disabled={!!storyLang} title={storyLang ? 'Language: this story sets it itself.' : undefined} />
      </span>
    </span>
  );
};
```

- [ ] **Step 2: `Canvas.tsx`**

Add prop `elementEdits: ElementEdit[]`, keep it in `latest` (`latest.current = { overrides, elementEdits, mode, onFrame, fit, room, storyId }`), add `const appliedElements = useRef(new WeakMap<Document, Map<string, Map<string, string>>>());` and in `apply`, after `applyEdits(...)`:

```ts
    let els = appliedElements.current.get(doc);
    if (!els) {
      els = new Map();
      appliedElements.current.set(doc, els);
    }
    applyElementEdits(doc, latest.current.elementEdits, latest.current.storyId, els);
```

and `useEffect(apply, [apply, overrides, elementEdits, toolbar.mode, fit]);`.

- [ ] **Step 3: `Component.tsx`**

Changes, in order of the file:
- Imports: drop `Tokens`; add `ChangesDrawer`, `CanvasSettings`, `useElementEdits`, `fileFindings`, `TaskContext`.
- Types: `type Tab = 'design' | 'a11y'; const TABS: Tab[] = ['design', 'a11y'];` `storedTab` maps a stored `'inspect'` to `'design'`. Remove `Detail`, `detail`, `tokenCount`.
- State: `const { edits, add: addEdit, remove: removeEdit, clear: clearEdits } = useElementEdits(TOKEN_META);` `const [drawer, setDrawer] = useState(false);`
- `view` stays; the mode segmented:

```tsx
        <Segmented<'today' | 'redesign' | 'both'>
          label="Mode"
          testId="wb-toolbar-mode"
          value={split ? 'both' : toolbar.mode}
          options={[
            { value: 'today', label: 'Today' },
            { value: 'redesign', label: 'Redesign' },
            { value: 'both', label: <><Icon name="split" size={16} />Both</> },
          ]}
          onChange={(m) => {
            if (m === 'both') setView('split');
            else {
              setView('single');
              setToolbar({ ...toolbar, mode: m });
            }
          }}
        />
```

  Remove the Single / Side by side segmented. The bar's right end: `<CanvasSettings …/>`, `<ZoomControl …/>`, then

```tsx
          <button type="button" className="wb-changes-toggle wb-icon-button" data-testid="wb-changes-toggle" aria-expanded={drawer} onClick={() => setDrawer((d) => !d)}>
            <Icon name="edit" size={14} />
            Changes
            <span className={count > 0 ? 'wb-count wb-count-on' : 'wb-count'}>{count}</span>
          </button>
```

  with `const count = Object.keys(overrides).length + edits.length;`.
- Under the bar, before the stage:

```tsx
      {drawer && (
        <ChangesDrawer
          meta={TOKEN_META}
          mode={toolbar.mode}
          overrides={overrides}
          onReset={reset}
          onClose={() => setDrawer(false)}
          elements={edits}
          onResetElement={removeEdit}
          onResetElements={clearEdits}
          resolve={(t) => live[toolbar.mode][t] ?? ''}
          task={task}
        />
      )}
```

  where `const live = useMemo(() => resolveTokens(DEFS, overrides), [overrides]);` (imports from `../lib/contrast` and `../lib/tokenValues`) and

```ts
  const findings = useMemo(() => (indexes.scan ? fileFindings(indexes.scan, group.file) : []), [indexes.scan, group.file]);
  const task: TaskContext = {
    component: group.score?.component ?? group.name,
    file: group.file,
    storyId,
    routes: group.score?.routes ?? [],
    mode: heal,
    layer: selection.label ?? '',
    findings,
  };
```

  (`group` is defined after the early returns; place these after it, which means hooks above the returns must not depend on them: compute `findings` with `useMemo` keyed on `groups` and `storyId` before the returns, or compute it without `useMemo`.)
- Header chip row: replace the `Used N times` chip with

```tsx
            {group.score && (
              <details className="wb-usage-details" data-testid="wb-usage-toggle">
                <summary className="wb-chip wb-chip-office">
                  <Icon name="usage" size={12} />
                  {`Usage · ${group.score.usageCount}`}
                </summary>
              </details>
            )}
```

  and render the `Usage` panel right under the header when that details is open. A `<details>` cannot host content outside the summary in another place, so instead keep a `const [usageOpen, setUsageOpen] = useState(false)` and render `<button data-testid="wb-usage-toggle" aria-expanded={usageOpen} className="wb-chip wb-chip-office" …>` in the chip row and, under `</header>`:

```tsx
      {usageOpen && (
        <section className="wb-drawer wb-usage-drawer" aria-label="Usage">
          <Usage storyId={storyId} group={group} indexes={indexes} healMode={heal} onHealMode={onHealMode} />
        </section>
      )}
```

- Both canvases get `elementEdits={edits}`.
- Tabs:

```tsx
        tabs={[
          { id: 'design', label: 'Design', icon: 'sliders', content: (
              <Design
                section={section} storyId={storyId} states={states} variants={variants} tabLabel={tabLabel}
                componentName={group.name} frames={shownFrames} selection={selection}
                meta={TOKEN_META} mode={toolbar.mode} overrides={overrides}
                edits={edits} addEdit={addEdit} removeEdit={removeEdit}
                findings={findings} file={group.file}
              />
            ) },
          { id: 'a11y', label: 'A11y', icon: 'a11y',
            count: a11y.loaded ? a11y.results?.stories[storyId]?.violations.length : undefined,
            content: (
              <div className="wb-inspect" data-testid="wb-panel-inspect">
                <A11y storyId={storyId} storyLabel={current ? tabLabel(current) : undefined} group={group} section={section} results={a11y.results} loaded={a11y.loaded} checklist={checklistOf(CHECKLISTS, group)} />
              </div>
            ) },
        ]}
```

- CSS: `.wb-canvas-settings { display: inline-flex; gap: var(--gv-space-1); } .wb-canvas-setting { display: inline-flex; align-items: center; gap: 2px; color: var(--wb-muted); } .wb-canvas-setting .wb-toolbar-field select { max-width: 120px; } .wb-usage-drawer { margin: 0 0 var(--gv-space-3); }`. If the bar overflows at 1280 px wide, let `.wb-canvas-bar` wrap (`flex-wrap: wrap; row-gap: var(--gv-space-2)`).

- [ ] **Step 4: Typecheck, unit tests, build**

Run: `npm run ds:workbench:typecheck && npx jest .storybook/workbench && npm run ds:workbench`
Expected: all PASS, the build writes `build/storybook/workbench` (or wherever `ds:workbench` writes; see its vite config).

- [ ] **Step 5: Look at it**

Run `npx storybook dev -p 6006 --ci --no-open` and open `http://localhost:6006/workbench/#/components/components-actions-button--default`. Check against the spec: two tabs; canvas bar with Mode / City / Viewport / Language / zoom / Changes; the Design tab starts with "Button" and the State select; sections Layout, Fill, Radius, Text; Size shows a field with an attach glyph; clicking it turns Size into a pill and the badge reads 1; typing `12` into the vertical padding field gives a `space-3` pill; Changes lists both with Copy for agent; Reset all clears. Fix what differs before the commit.

- [ ] **Step 6: Commit**

```bash
git add .storybook/workbench/src/pages/Component.tsx .storybook/workbench/src/components/Toolbar.tsx .storybook/workbench/src/components/Canvas.tsx .storybook/workbench/src/shell.css
git commit -m "design-system(workbench): component page: Design and A11y tabs, canvas bar settings, one Changes [AI-assisted]"
```

---

### Task 11: Smoke checks and the notes

**Files:**
- Modify: `front/scripts/design-system/workbench-smoke.ts` (`canvasChecks` mode step, `controlsChecks`, `panelChecks`)
- Modify: `front/.storybook/AGENTS.md`

- [ ] **Step 1: Mode on the canvas bar**

Replace `await page.selectOption('[data-testid="wb-toolbar-mode"]', 'redesign');` with `await page.click('[data-testid="wb-toolbar-mode"] [data-value="redesign"]');`. If `canvasChecks` later selects `today` the same way, change that too. If the Foundations page has its own mode select with the same testid, scope this one: `[data-testid="wb-canvas-bar"] [data-testid="wb-toolbar-mode"]`.

- [ ] **Step 2: `controlsChecks`**

Before waiting for `wb-controls-reset`, open the Props section:

```ts
  const props = '[data-testid="wb-insp-props"]';
  if (!(await page.$eval(props, (el: Element) => (el as HTMLDetailsElement).open))) {
    await page.click(`${props} > summary`);
  }
```

- [ ] **Step 3: `panelChecks`**

Replace the body after the "a click on the canvas picks the element" block (keep that block; the layer selector becomes `'[data-testid="wb-insp-selection"] .wb-insp-layer-name'`, unchanged) with:

```ts
  // Size is hard-coded and equals --gv-fs-s: the field offers to attach it.
  const SIZE_TOKEN = '--gv-fs-s';
  // Back to the button: the label span has no padding rows.
  await page.keyboard.press('Escape');
  const suggest = `[data-testid="wb-panel-design"] [data-row="size"] [data-testid="wb-insp-suggest"][data-token="${SIZE_TOKEN}"]`;
  let attached: string | null = null;
  try {
    await page.waitForSelector(suggest, { timeout: 20000 });
    await page.click(suggest);
    await page.waitForFunction(
      (sel: string) => document.querySelector(sel)?.getAttribute('data-link') === 'linked',
      `[data-testid="wb-panel-design"] [data-row="size"][data-testid="wb-insp-value"]`,
      { timeout: 10000 }
    );
    attached = await page.$eval(
      `[data-testid="wb-panel-design"] [data-row="size"][data-testid="wb-insp-value"]`,
      (el: Element) => el.getAttribute('data-token')
    );
  } catch {
    // Reported below.
  }
  if (attached !== SIZE_TOKEN) {
    failures.push(`attaching ${SIZE_TOKEN} to Size left the field ${attached ?? 'unbound'}`);
  }
  // Typing 12 into the vertical padding snaps to the space scale.
  const pad = '[data-testid="wb-panel-design"] [data-row="padding-v"] [data-testid="wb-insp-input"]';
  let snapped: string | null = null;
  if (await page.$(pad)) {
    await page.fill(pad, '12');
    await page.keyboard.press('Enter');
    try {
      await page.waitForFunction(
        (sel: string) => document.querySelector(sel)?.getAttribute('data-link') === 'linked',
        '[data-testid="wb-panel-design"] [data-row="padding-v"][data-testid="wb-insp-value"]',
        { timeout: 10000 }
      );
    } catch {
      // Reported below.
    }
    snapped = await page
      .$eval('[data-testid="wb-panel-design"] [data-row="padding-v"][data-testid="wb-insp-value"]', (el: Element) => el.getAttribute('data-token'))
      .catch(() => null);
    if (snapped !== '--gv-space-3') {
      failures.push(`typing 12 into the vertical padding gave ${snapped ?? 'no token'}, expected --gv-space-3`);
    }
  } else {
    failures.push('the Design tab shows no vertical padding field for the button');
  }
  // One Changes list with both edits and a task for the agent.
  await page.click('[data-testid="wb-changes-toggle"]');
  const rows = await page.$$eval('[data-testid="wb-changes"] [data-testid="wb-change-row"][data-kind]', (els: Element[]) => els.length);
  if (rows < 2) failures.push(`the Changes drawer lists ${rows} element edits, expected 2`);
  await page.click('[data-testid="wb-copy-agent"]');
  const task: string = await page
    .$eval('[data-testid="wb-copy-fallback"]', (el: Element) => (el as HTMLTextAreaElement).value)
    .catch(async () => page.evaluate(() => navigator.clipboard.readText()).catch(() => ''));
  if (!task.includes(`→ ${SIZE_TOKEN}`)) {
    failures.push(`the agent task does not name ${SIZE_TOKEN}: ${task.slice(0, 120)}`);
  }
  await page.click('[data-testid="wb-changes"] button:has-text("Reset all")');
  const left = await page.$$eval('[data-testid="wb-change-row"]', (els: Element[]) => els.length);
  if (left !== 0) failures.push(`Reset all left ${left} changes`);
  console.log(`design: ${RADIUS_TOKEN} ${link} on the button; a click selects ${picked}; attach ${attached}, snap ${snapped}, task ok`);

  // Usage under the header: back office routes.
  await page.click('[data-testid="wb-usage-toggle"]');
  const admin = '[data-testid="wb-usage-route"][data-office="admin"]';
  let routes = 0;
  try {
    await page.waitForSelector(admin, { timeout: 20000 });
    routes = await page.$$eval(admin, (els: Element[]) => els.length);
  } catch {
    failures.push('the Usage disclosure lists no back office route for Button');
  }
  console.log(`usage: ${routes} back office routes`);

  // The A11y tab: Button's checklist badge with its date and counts.
  await page.click('[data-testid="wb-panel-tab"][data-tab="a11y"]');
  // ... keep the existing A11y block unchanged from here (reviewed badge, no compliance claim).
```

Clipboard in headless Playwright: grant `clipboard-read` in the context (`context.grantPermissions(['clipboard-read', 'clipboard-write'])`) where the runner creates it, or rely on the fallback textarea the drawer shows when copying fails. Remove the old `inspect()` helper and the Tokens panel block. The smoke's test file (`workbench-smoke.test.ts`) only covers pure helpers; nothing to change unless you exported a new helper.

- [ ] **Step 4: Run the smoke**

With Storybook running on 6006: `npm run ds:smoke` (read the runner's header for the base URL flag).
Expected: `failures: 0`. Fix the app, not the check, when something fails, unless the check reads a selector you renamed.

- [ ] **Step 5: AGENTS.md**

In `front/.storybook/AGENTS.md`, in the workbench section that lists the panels (search "Tokens, Usage and A11y panels" and the `src/panels/` line), replace the description with:

> The component page: canvas bar (Select / Interact, Mode Today | Redesign | Both, City, Viewport, Language, zoom, Changes), the stage, and the inspector with two tabs. **Design** is Figma's Design tab over the selected element: sections Layout, Fill, Stroke, Radius, Text, Effects; a value is a pill when bound to a token (click = token picker, hover = detach) or a field (type to snap to the scale or palette; a link glyph attaches the token the value equals); "Also in this file" lists the file's healable findings; Props last. Element edits paint the frame as inline styles (`lib/elementEdits.ts`, localStorage `gv-element-edits`) and sit with token edits in the one Changes drawer, whose "Copy for agent" gives the heal / change tasks. **A11y** is unchanged. Usage opens under the page header. `src/panels/`: `Design`, `Usage`, `Controls`, `A11y`.

Also add `src/lib/elementEdits.ts`, `src/lib/tokenPicker.ts`, `src/lib/useElementEdits.ts` to the file list and the `#/foundations/<category>/<token>` route to the routes line. Add under "The heal task": the `change:` task shape from the spec.

- [ ] **Step 6: Commit**

```bash
git add scripts/design-system/workbench-smoke.ts .storybook/AGENTS.md
git commit -m "design-system(workbench): smoke checks for the new inspector; notes [AI-assisted]"
```

- [ ] **Step 7: Final gate**

```bash
npm run ds:workbench:typecheck && npx jest .storybook/workbench scripts/design-system && npm run ds:workbench && npm run ds:check
```

Expected: all green. Report the smoke's console lines and the commit list. Do not push unless the person asks (a push redeploys the preview).

---

## Self-review notes

- Spec coverage: tabs (T10), canvas bar (T10), Design order (T9), fields and pills (T6), picker (T5, T6), element edits + storage + look flag (T4), task text (T4), Changes drawer (T8), Foundations deep link (T7), Also in this file (T9), removed parts (T9, T10), acceptance (T11).
- Known seams for the implementer: `inspectElement`'s `Inspection.size` removal touches only `Design.tsx`; `Segmented` renders a `role="group"` with `data-testid` on the group, which the smoke's `[data-value]` click relies on; the `--gv-font-mono` custom property may not exist.
- Not done here by design: sending tasks to a clanker; share links for element edits.
