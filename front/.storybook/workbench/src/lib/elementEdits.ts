// Session edits of one element's properties on the canvas: attach a token
// to a hard value, swap or detach a token, or a custom value. Painted as
// inline styles in the frame, kept in localStorage, handed to the agent as
// task text from the Changes drawer.
import type { TokenName } from '@ds/tokens/tokens';

import type { IconName } from '../components/Icon';

import type { Finding, TokenMeta } from './data';
import {
  formatHealTask,
  HealMode,
  MAX_TASK_ROUTES,
  routeLabel,
} from './healTask';
import { atPath, rowSpec } from './inspect';
import { parseColour } from './overrides';

export type EditKind = 'attach' | 'swap' | 'detach' | 'custom' | 'file';

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
  // From the scan finding, when one matched.
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
export const changesLook = (
  e: ElementEdit,
  resolve: (token: TokenName) => string
) => {
  const after = e.to.token ? resolve(e.to.token) || e.to.value : e.to.value;
  return after.trim().toLowerCase() !== e.from.raw.trim().toLowerCase();
};

const isElement = (doc: Document, el: Element | null): el is HTMLElement =>
  !!el && el instanceof (doc.defaultView?.HTMLElement ?? HTMLElement);

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
    ? ctx.findings.find(
        (f) => f.file === e.file && f.line === e.line && f.col === e.col
      )
    : ctx.findings.find(
        (f) =>
          f.file === ctx.file &&
          [e.from.raw, e.from.shown, `${e.from.shown}px`].includes(flat(f.raw))
      );

export const taskOfEdit = (e: ElementEdit, ctx: TaskContext): string => {
  const file = e.file ?? ctx.file ?? '(file unknown)';
  const check = `check: story ${ctx.storyId}, routes ${routeList(ctx.routes)}`;
  if (e.kind === 'attach' || e.kind === 'file') {
    const f = findingOf(e, ctx);
    if (f && e.to.token) {
      return formatHealTask(
        f,
        ctx.component,
        ctx.storyId,
        ctx.routes,
        ctx.mode,
        { token: e.to.token }
      );
    }
    return [
      `heal: ${ctx.component} · ${file} · ${e.from.raw} → ${
        e.to.token ?? '(choose a token)'
      } · mode ${ctx.mode}`,
      `why: hard-coded ${e.label.toLowerCase()} seen in the workbench (${
        ctx.layer
      }), scan confidence low`,
      check,
    ].join('\n');
  }
  const from = e.from.token ?? e.from.raw;
  const to = e.to.token ? `var(${e.to.token})` : e.to.value;
  return [
    `change: ${ctx.component} · ${file} · ${e.props.join(
      ', '
    )} ${from} → ${to} · mode redesign`,
    `why: design change from the workbench (${e.kind}); changes today's look, so redesign scope or a token change`,
    check,
  ].join('\n');
};

// ---------------------------------------------------------------- storage

const KINDS = new Set<EditKind>(['attach', 'swap', 'detach', 'custom', 'file']);
const PX = /^-?\d+(\.\d+)?px$/;

const literalFits = (rowId: string, value: string) => {
  if (value.length > MAX_VALUE || /url\(|expression\(|[<>;{}\\]/i.test(value)) {
    return false;
  }
  const kind = rowSpec(rowId).snap;
  if (kind === 'space' || kind === 'radius')
    return value === '0' || PX.test(value);
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
    // A token edit paints var(token); its value is only shown.
    (to.token !== undefined
      ? (to.value as string).length <= 256 && !/[<>]/.test(to.value as string)
      : literalFits(e.rowId as string, to.value as string)) &&
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
