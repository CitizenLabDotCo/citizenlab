# Inspector 2: the component page as a designers' workspace

Rob, 23 Oct 2026. Design agreed in conversation; the plan is `2026-10-23-inspector-2-plan.md`.

## Purpose

Rob and Tali open a component, read its values the way Figma's Design tab shows them, rebind a value to a
token or try another value, and hand every correction to an agent as one list. Designers know Figma's
conventions: the panel speaks in glyphs and pills, not sentences. Nothing in the panel edits code; the
agent does, from the list, on the branch, and the preview redeploys.

## What is wrong today (the audit)

- One click on a value opens the Foundations token editor inside the panel (description, both modes, a
  text input that edits the token for the whole session, a colour picker, usage, a "Heal it in Inspect"
  jump). Editing a token's value is a Foundations job.
- "Hard-coded, equals a token" is drawn as a third kind of pill with an orange dot, a legend, a title
  tooltip and an inline note. On Button Default it is 6 of 9 values, so the exception is the norm.
- Two vocabularies for the same facts: "from a token / hard-coded, equals a token" (Design) and
  Linked / Matches / Code (Inspect). Changes lives in two panels with two counters.
- Component (State, Variant) and Canvas (Mode, City, Viewport, Language) sit above the selection in the
  Design tab. Canvas settings are not properties of the selected element.
- Every pill carries the same generic drop glyph; W and H are text; padding, gap and line height are bare
  numbers with a "not a token" tooltip and nothing to do about them.
- Inspect holds Tokens (a second copy of Foundations rows with inputs), Usage and A11y under one tab, then
  Tokens adds a four-way filter: three levels of tabs for one panel.

## Vocabulary

- **Bound**: the rendered value comes from a `var(--gv-…)` that a rule or the inline style of the element
  names (today's `linked`). Drawn as a **pill**.
- **Text value**: anything else. Drawn as a **field**. A text value that equals a token is still a text
  value; the field carries a small **attach** suggestion.
- **Element edit**: a session change to one property of the selected element. Kinds: `attach` (text value
  → the token it equals), `swap` (pill → another token), `detach` (pill → the resolved literal),
  `custom` (a typed value that snapped to nothing), `file` (a Heal of a scan finding the current story
  does not render). Applied as an inline style in the frame, kept in localStorage, listed in Changes.
- **Token edit**: the existing session override of a token's value (Foundations). Unchanged.
- **Changes**: token edits and element edits, one list, one badge.

## The component page

**Header.** Breadcrumbs; title row with the score ring, the name, the status and office chips, a
**Usage · N** chip that is a disclosure (the former Usage panel opens under the header: files, props,
routes, audit; engineers' and agents' territory), the file.

**Canvas bar.** Left: Select | Interact. Centre: Mode **Today | Redesign | Both** (Both is the former
Side by side). Right: City, Viewport, Language as compact selects with a glyph, the zoom control, and the
**Changes** badge (count = token edits + element edits) that opens the Changes drawer under the bar.

**Panel.** Two tabs: **Design** and **A11y**. "Inspect" and the Tokens panel are gone. A11y keeps its
content.

## The Design tab, top to bottom

1. **Component row**: the component name, then the State and Variant selects (Figma's variant row).
2. **Selection**: one button with the layer label (`button "Save changes"`) and a chevron; it opens a menu
   of the ancestors up to the story box, nearest first. Esc still selects the parent. No legend.
3. **Sections**, each a collapsible block with a chevron; open state remembered per section in
   localStorage `wb-insp-open`; a section with no rows is not shown:
   - **Layout**: W and H (read-only, as a pair), Padding (one field, a vertical/horizontal pair, or four),
     Gap (one, or a rows/columns pair).
   - **Fill**.
   - **Stroke**: colour and width as a pair.
   - **Radius**: one, a pair (top-left with bottom-right, top-right with bottom-left), or four.
   - **Text**: Font (full width), Weight and Size (pair), Line height and Letter spacing (pair; letter
     spacing only when it is not `normal`), Colour.
   - **Effects**: the shadow, read-only this round.
   - **Also in this file · N** (collapsed by default): the healable scan findings of the component's
     file that no field of the current selection covers. Each row: a glyph for the finding's category,
     the raw value, an arrow, the suggested token (or "choose"), a Heal button that adds a `file` edit.
   - **Props** (collapsed by default): the existing Controls.
4. Half-width rows sit two per line. Rows carry no visible label: the glyph says what the field is, the
   `aria-label` says it in words. No title tooltips on values.

## Fields

- **Field** (text value): glyph on the left, the value (unit-less numbers, hex without `#`, the first
  family that renders), editable when the row allows it. Click to type; Enter or blur commits; Esc reverts.
  A commit goes through `snapValue`: padding, gap and radius snap to the nearest `--gv-space-N` or radius
  step, colours to the nearest palette colour (a tier 2 token with the same value wins over the tier 1
  primitive). A snapped value becomes an `attach` edit to that token (the field turns into a pill). A value
  that snaps to nothing becomes a `custom` edit, drawn as a field with a caution glyph.
  When the value equals a token, a small link-glyph button sits at the right edge
  (`aria-label="Attach <token>"`); clicking it adds the `attach` edit.
- **Pill** (bound): swatch for colours, the row's glyph otherwise; the token's short name; the resolved
  value muted at the right. On hover a detach-glyph button appears at the right edge
  (`aria-label="Detach"`): it adds a `detach` edit (the pill becomes a field holding the literal). A click
  on the pill body opens the **token picker**.
- W, H and the shadow are read-only: a field without an edit affordance.

## Token picker

A popover under the field. A search input with focus. Rows filtered to the tokens that fit the property
(colours for Fill, Stroke colour and Text colour; space for Padding and Gap; radius for Radius; size, weight
and line height tokens for their rows; font families for Font). Deprecated tokens hidden. Groups, in
order: **Matches** (tokens whose resolved value equals the rendered value), **Semantic** (tier 2),
**Scale** (tier 1). A row: the mini preview Foundations draws (swatch, bar, radius square, Aa), the short
name, the resolved value muted. Enter picks the first visible row, Esc or a click outside closes. The
footer link **Edit in Foundations** opens `#/foundations/<category>/<token>`, which scrolls to and focuses
that token's row. Picking from a field is an `attach`, from a pill a `swap`.

## Element edits

```ts
type EditKind = 'attach' | 'swap' | 'detach' | 'custom' | 'file';
type ElementEdit = {
  id: string;                 // `${storyId}|${path.join('.')}|${rowId}`; file edits `${storyId}|file|${line}:${col}`
  storyId: string;
  path: number[] | null;      // the element's place under the story box; null for `file`
  rowId: string;              // 'padding-v', 'fill', 'size' ...
  label: string;              // "Padding · Vertical", for the list and the task
  glyph: IconName;
  props: string[];            // the CSS longhands the edit sets on the element
  from: { raw: string; shown: string; token?: TokenName };
  to: { value: string; token?: TokenName };   // value = the literal or the token's resolved value
  kind: EditKind;
  file?: string; line?: number; col?: number; // from the scan finding, when one matched
  at: number;
};
```

- Applied in the frame after every render of the story: the element is found again by `path`
  (`atPath`), each prop set inline to `var(<token>)` or the literal. Originals are remembered per element
  and put back on reset. Because the panel reads the inline style, an attach or swap reads back as bound
  and a detach as a text value, with no special casing.
- Storage: localStorage `gv-element-edits`, a JSON array, validated on read: a known token name, a literal
  that fits the row (px for space and radius, a colour for colours), at most 64 characters, no `url(`.
  Bad entries are dropped. Not in the share link this round.
- `changesLook(edit)`: true when the resolved `to` differs from `from.raw`. An attach never does; a swap,
  a detach with a new value and a custom do.

## The Changes drawer

Opened by the badge on the canvas bar; one drawer, under the bar. Two groups:

- **Elements**: glyph or swatch, the layer label and the row label, `from → to` (token short names when
  bound), a kind mark (link glyph for attach, swap glyph for swap, caution glyph with
  `aria-label="Changes today's look"` for detach and custom), Reset.
- **Tokens**: the existing rows (name, from → to, Reset).

Actions: **Copy for agent** (every element edit's task, blank line between), **Copy as token source diff**
and **Copy share link** (as today, token edits only), **Reset all**.

## Task text (what the agent receives)

For an `attach` or `file` edit whose scan finding is known (same file, the finding's raw value equals
the edit's raw value, or the `file` edit's own finding):

```
heal: <Component> · <file>:<line> · <raw> → <token> · mode <mode>
why: <category>, scan confidence <confidence>
check: story <story id>, routes <list>
```

(`formatHealTask`, unchanged.) For an `attach` with no matching finding:

```
heal: <Component> · <file> · <from.raw> → <token> · mode <mode>
why: hard-coded <row label> seen in the workbench (<layer label>), scan confidence low
check: story <story id>, routes <list>
```

For `swap`, `detach` and `custom` (the look changes):

```
change: <Component> · <file> · <props, comma separated> <from> → <to> · mode redesign
why: design change from the workbench (<kind>); changes today's look, so redesign scope or a token change
check: story <story id>, routes <list>
```

`<to>` is `var(<token>)` for a swap and the literal otherwise. `<mode>` for attach is `healModeOf` (the
component's office, or the mode picked in Usage). The heal skill stays the gate: it refuses a change that
breaks mode safety, and the task says so in `why`.

## Foundations deep link

`#/foundations/<category>/<token>` opens the category page, opens the token's ramp when it has one,
scrolls its row into view and focuses its input (the existing `pick`).

## Removed

The Tokens panel, the Inspect segmented control, the token editor inside the Design tab, the legend, the
value tooltips, the Component and Canvas blocks of the Design tab, the Side by side control (Both replaces
it), the second Changes button.

## Not in this round

Sending the list to a clanker on the box (a follow-up: a door that queues the task text to a Work bot).
Element edits in share links. Adding a stroke or an effect to an element that has none. Editing W and H.
Changing the A11y tab.

## Acceptance (the smoke run on the Button page)

- The Design tab shows `--gv-radius-control` as a pill (`data-link="linked"`), and Size as a field with
  an attach suggestion for `--gv-fs-s`.
- Clicking the suggestion turns Size into a pill for `--gv-fs-s` after the next read, the Changes badge
  reads 1, and Copy for agent yields a text containing `→ --gv-fs-s`.
- Typing `12` in the vertical padding field snaps to `--gv-space-3` and shows a pill.
- Reset all clears the badge and the pills go back.
- A click on the button's label selects the `span`.
- The Usage disclosure lists back office routes; the A11y tab shows the reviewed badge; the Props
  section opens and the `disabled` control re-renders the frame.
