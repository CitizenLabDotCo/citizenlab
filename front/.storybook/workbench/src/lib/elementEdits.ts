// Session edits of one element's properties on the canvas: attach a token
// to a hard value, swap or detach a token, or a custom value. Painted as
// inline styles in the frame, kept in localStorage, handed to the agent as
// task text from the Changes drawer.
import type { TokenName } from '@ds/tokens/tokens';

import type { IconName } from '../components/Icon';

import type { TokenMeta } from './data';
import { MAX_TASK_ROUTES, routeLabel } from './healTask';
import { atPath, rowSpec } from './inspect';
import { parseColour } from './overrides';
import { sameValue } from './tokenPicker';
import type { EditTrace } from './trace/codemod';

export type EditKind =
  | 'attach'
  | 'swap'
  | 'detach'
  | 'custom'
  | 'file'
  | 'define';

export type ElementEdit = {
  // `${storyId}|${path.join('.')}|${rowId}`; file edits
  // `${storyId}|file|${line}:${col}`.
  id: string;
  storyId: string;
  // The element's place under the story box; null for `file`.
  path: number[] | null;
  rowId: string;
  // "Padding · Vertical", for the list and the task.
  label: string;
  glyph: IconName;
  // The CSS longhands the edit sets on the element.
  props: string[];
  from: { raw: string; shown: string; token?: TokenName };
  // `value`: the literal, or the token's resolved value.
  to: { value: string; token?: TokenName };
  kind: EditKind;
  // A token attached to traced code: where the codemod writes it (the
  // trace's editable range, at the index's commit).
  source?: EditTrace;
  // A `define` edit: the named value changed where the code defines it
  // (colors.textPrimary at styleUtils.ts:114); every use follows.
  define?: { name: string; file: string; line: number };
  // A `file` edit: the scan finding's place.
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
// Colours compare by channel: #163A7D is rgb(22, 58, 125).
export const changesLook = (
  e: ElementEdit,
  resolve: (token: TokenName) => string
) => {
  const after = e.to.token ? resolve(e.to.token) || e.to.value : e.to.value;
  return !sameValue(after, e.from.raw);
};

// An icon is an SVG element: it has an inline style too.
const isElement = (
  doc: Document,
  el: Element | null
): el is HTMLElement | SVGElement =>
  !!el &&
  (el instanceof (doc.defaultView?.HTMLElement ?? HTMLElement) ||
    el instanceof (doc.defaultView?.SVGElement ?? SVGElement));

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
    const [story, pathText] = id.split('|');
    // Only the story on the canvas can be put back; another story's element
    // at the same path is not the one the edit painted.
    const el =
      story === storyId && pathText !== 'file' && pathText !== undefined
        ? atPath(doc, pathText ? pathText.split('.').map(Number) : [])
        : null;
    if (isElement(doc, el)) {
      for (const [prop, before] of originals) {
        if (before) el.style.setProperty(prop, before);
        else el.style.removeProperty(prop);
      }
    }
    applied.delete(id);
  }
  for (const e of edits) {
    if (e.storyId !== storyId || !e.path) continue;
    const el = atPath(doc, e.path);
    if (!isElement(doc, el)) continue;
    const originals = applied.get(e.id) ?? new Map<string, string>();
    const value = inlineValue(e);
    for (const prop of e.props) {
      if (!originals.has(prop)) {
        originals.set(prop, el.style.getPropertyValue(prop));
      }
      if (el.style.getPropertyValue(prop) !== value) {
        el.style.setProperty(prop, value);
      }
    }
    applied.set(e.id, originals);
  }
};

export type TaskContext = {
  component: string;
  file?: string;
  storyId: string;
  routes: string[];
  layer: string;
};

const flat = (s: string) => s.replace(/\s+/g, ' ').trim();

const routeList = (routes: string[]) => {
  if (routes.length === 0) return 'none';
  const named = routes.slice(0, MAX_TASK_ROUTES).map(routeLabel).join(', ');
  const rest = routes.length - MAX_TASK_ROUTES;
  return rest > 0 ? `${named} and ${rest} more` : named;
};

// The commit subject of an attached token, in the trace's words
// (theme.borderRadius → --gv-radius-control): a design change when the look
// changes, a heal when it does not.
export const subjectOfEdit = (
  e: ElementEdit,
  component: string,
  look: boolean
) =>
  e.define
    ? `design-system(design): ${e.define.name} → ${e.to.value}, where it is defined (seen on ${component}) [AI-assisted]`
    : `design-system(${look ? 'design' : 'heal'}): ${component} ${e.label
    .toLowerCase()
    .replace(/\s+/g, ' ')} ${
    e.source?.text ?? e.from.token ?? flat(e.from.raw)
  } → ${e.to.token ?? e.to.value} [AI-assisted]`;

export const taskOfEdit = (e: ElementEdit, ctx: TaskContext): string => {
  const file = e.file ?? ctx.file ?? '(file unknown)';
  const check = `check: story ${ctx.storyId}, routes ${routeList(ctx.routes)}`;
  if (e.kind === 'attach' || e.kind === 'file') {
    // The trace's line when there is one; a file edit's finding line.
    const where = e.source
      ? `${e.source.file}:${e.source.line}`
      : e.line
      ? `${file}:${e.line}`
      : file;
    const layer = ctx.layer ? ` (${ctx.layer})` : '';
    const label = e.label.toLowerCase();
    return [
      `heal: ${ctx.component} · ${where} · ${e.source?.text ?? e.from.raw} → ${
        e.to.token ?? '(choose a token)'
      }`,
      e.source
        ? `why: the workbench traced ${label}${layer} to this line`
        : `why: ${label} set in the workbench${layer}; not traced to a line, so find it by hand`,
      check,
    ].join('\n');
  }
  if (e.kind === 'define' && e.define) {
    const d = e.define;
    return [
      `define: ${d.name} · ${d.file}:${d.line} · ${e.from.raw} → ${e.to.value}`,
      `why: changed where ${d.name} is defined, so every use follows; seen on ${ctx.component}`,
      check,
    ].join('\n');
  }
  const from = e.from.token ?? e.from.raw;
  const to = e.to.token ? `var(${e.to.token})` : e.to.value;
  return [
    `change: ${ctx.component} · ${file} · ${e.props.join(
      ', '
    )} ${from} → ${to}`,
    `why: design change from the workbench (${e.kind}); it changes the look wherever the component renders, so a token change or its own PR off master`,
    check,
  ].join('\n');
};

// ---------------------------------------------------------------- storage

const KINDS = new Set<EditKind>([
  'attach',
  'swap',
  'detach',
  'custom',
  'file',
  'define',
]);
const PX = /^-?\d+(\.\d+)?px$/;

// A literal the row can take: the right kind for the row, short, nothing
// that loads a resource or breaks out of a declaration.
export const valueFits = (rowId: string, value: string) => {
  if (value.length > MAX_VALUE || /url\(|expression\(|[<>;{}\\]/i.test(value)) {
    return false;
  }
  const spec = rowSpec(rowId);
  if (spec.choices) return spec.choices.some(([v]) => v === value);
  // A share of 0 to 1, as opacityValue writes it.
  if (rowId === 'opacity') return /^(0|1|0?\.\d+)$/.test(value);
  const kind = spec.snap;
  if (kind === 'space' || kind === 'radius')
    return value === '0' || PX.test(value);
  if (kind === 'color') return parseColour(value) !== null;
  return true;
};

// A stored trace: a plain place in a front/ file, nothing that walks out.
const isTrace = (v: unknown): v is EditTrace => {
  if (typeof v !== 'object' || v === null) return false;
  const t = v as Record<string, unknown>;
  const int = (n: unknown) => Number.isInteger(n) && (n as number) >= 0;
  return (
    typeof t.commit === 'string' &&
    /^[0-9a-f]{7,40}$/.test(t.commit) &&
    typeof t.file === 'string' &&
    /^[\w@.-]+(\/[\w@.-]+)*$/.test(t.file) &&
    !t.file.split('/').includes('..') &&
    int(t.line) &&
    int(t.start) &&
    int(t.end) &&
    (t.end as number) > (t.start as number) &&
    (t.context === 'js' || t.context === 'template') &&
    (t.part === undefined || int(t.part)) &&
    typeof t.lineText === 'string' &&
    t.lineText.length <= 400 &&
    !/[\r\n]/.test(t.lineText) &&
    (t.text === undefined ||
      (typeof t.text === 'string' && t.text.length <= 200))
  );
};

const isEdit = (v: unknown, known: Set<string>): v is ElementEdit => {
  if (typeof v !== 'object' || v === null) return false;
  const e = v as Record<string, unknown>;
  const to = e.to as Record<string, unknown> | undefined;
  const from = e.from as Record<string, unknown> | undefined;
  return (
    typeof e.id === 'string' &&
    typeof e.storyId === 'string' &&
    (e.path === null ||
      (Array.isArray(e.path) && e.path.every((n) => Number.isInteger(n)))) &&
    typeof e.rowId === 'string' &&
    typeof e.label === 'string' &&
    typeof e.glyph === 'string' &&
    Array.isArray(e.props) &&
    e.props.every((p) => typeof p === 'string' && /^[a-z-]+$/.test(p)) &&
    KINDS.has(e.kind as EditKind) &&
    !!from &&
    typeof from.raw === 'string' &&
    typeof from.shown === 'string' &&
    (from.token === undefined || known.has(from.token as string)) &&
    !!to &&
    typeof to.value === 'string' &&
    (to.token === undefined || known.has(to.token as string)) &&
    (e.source === undefined || isTrace(e.source)) &&
    // A token edit paints var(token); its value is only shown.
    (to.token !== undefined
      ? (to.value as string).length <= 256 && !/[<>]/.test(to.value as string)
      : valueFits(e.rowId as string, to.value as string)) &&
    typeof e.at === 'number'
  );
};

// Stored edits, each checked: a known token, a literal that fits the row,
// at most MAX_VALUE characters, nothing that loads a resource. Bad entries
// are dropped.
export const parseStored = (
  raw: string | null,
  meta: TokenMeta[]
): ElementEdit[] => {
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
