// Instance props: a library component used inside a pattern, with one of
// its props switched for that use only, live in the canvas (Figma's
// instance properties). The component renders through `useGvInstance`
// (app/component-library/utils/gvInstance.ts), which takes the override
// and reports what it renders; .storybook/instanceProps.tsx carries both
// over the preview's channel. Pure functions: identity, the props a panel
// may offer (from the component's own argTypes), the share-link codec and
// its checks, the frame payload, the Changes line and the agent task.
//
// Identity: the story id, the component's name and the instance's place
// among the story's elements tagged with that name, in DOM order (`index`).
// It holds across re-renders, a remount and a switch in place (a story
// renders the same instances in the same order), and it reads the same in
// anyone's browser, so a share link can carry it.
import type { ScanOutput } from './data';
import type { ArgType } from './preview';
import { controlOf } from './preview';

export type PropValue = string | number | boolean;

export type InstanceRef = {
  storyId: string;
  component: string;
  index: number;
};

export type InstanceEdit = InstanceRef & {
  prop: string;
  value: PropValue;
  // What the instance rendered before the edit, once known.
  from?: PropValue | null;
};

// What the hook reports of one mounted instance (gvInstance.ts
// InstanceReport).
export type InstanceReport = {
  uid: string;
  name: string;
  index: number;
  props: Record<string, PropValue | null>;
  base: Record<string, PropValue | null>;
  set: string[];
  overridden: string[];
};

export type PropSpec =
  | { name: string; kind: 'enum'; options: PropValue[] }
  | { name: string; kind: 'boolean' };

// Channel events and the instance attribute, as gvInstance.ts and
// .storybook/instanceProps.tsx name them (a test keeps them equal).
export const SET_EVENT = 'gvInstanceProps';
export const REPORT_EVENT = 'gvInstanceReport';
export const INSTANCE_ATTR = 'data-gv-instance';

export const instanceKey = (r: InstanceRef) =>
  `${r.storyId}|${r.component}|${r.index}`;

export const editKey = (e: InstanceEdit) => `${instanceKey(e)}|${e.prop}`;

export const sameInstance = (a: InstanceRef, b: InstanceRef) =>
  instanceKey(a) === instanceKey(b);

// ---------------------------------------------------------------- props

// The instance properties a panel offers: the props the component declares
// for its instances (`names`, from its report), each as the component's own
// argTypes describe it, enums as a select and booleans as a toggle. A name
// the argTypes do not describe that way is left out: nothing is made up.
// Children, functions and objects never qualify.
export const propSpecs = (
  argTypes: Record<string, ArgType>,
  names: string[]
): PropSpec[] =>
  names.flatMap((name): PropSpec[] => {
    const t = argTypes[name] as ArgType | undefined;
    if (!t || name === 'children') return [];
    const c = controlOf(name, t);
    if (c?.kind === 'boolean') return [{ name, kind: 'boolean' }];
    if (c?.kind === 'select') {
      const options = c.options
        .map((o) => o.value)
        .filter((v) => typeof v === 'string' || typeof v === 'number');
      return options.length ? [{ name, kind: 'enum', options }] : [];
    }
    return [];
  });

// Why a value may not be set on a prop, or undefined when it may.
export const specError = (
  spec: PropSpec | undefined,
  value: unknown
): string | undefined => {
  if (!spec) return 'not an instance property';
  if (spec.kind === 'boolean') {
    return typeof value === 'boolean' ? undefined : 'not true or false';
  }
  return spec.options.some((o) => Object.is(o, value))
    ? undefined
    : 'not one of its options';
};

export type Verdict = 'ok' | 'bad' | 'unknown';

// An edit against the specs known so far: unknown while the component's
// argTypes are not loaded.
export const verdictOf = (
  e: InstanceEdit,
  specs: Partial<Record<string, PropSpec[]>>
): Verdict => {
  const list = specs[e.component];
  if (!list) return 'unknown';
  return specError(
    list.find((s) => s.name === e.prop),
    e.value
  )
    ? 'bad'
    : 'ok';
};

// ---------------------------------------------------------------- codec

export const PARAM = 'p';
export const STORAGE_KEY = 'gv-instance-props';
export const MAX_EDITS = 40;
// base64url of at most MAX_EDITS short tuples.
export const MAX_PAYLOAD = 4096;
export const MAX_TEXT = 64;
const MAX_INDEX = 999;

const STORY_ID = /^[a-z0-9][a-z0-9-]{0,159}$/;
const COMPONENT = /^[A-Z][A-Za-z0-9]{0,39}$/;
const PROP = /^[a-z][A-Za-z0-9]{0,39}$/;
// Enum values as the library spells them: words, dashes, dots.
const TEXT = /^[A-Za-z0-9][A-Za-z0-9 _.-]*$/;

const isValue = (v: unknown): v is PropValue =>
  typeof v === 'boolean' ||
  (typeof v === 'number' && Number.isFinite(v)) ||
  (typeof v === 'string' && v.length <= MAX_TEXT && TEXT.test(v));

const isFrom = (v: unknown) => v === undefined || v === null || isValue(v);

// Why one entry is refused, by shape alone (the argTypes check comes when
// the component's stories are loaded), or undefined.
export const shapeError = (e: unknown): string | undefined => {
  if (typeof e !== 'object' || e === null) return 'an entry is not an edit';
  const x = e as Record<string, unknown>;
  if (typeof x.storyId !== 'string' || !STORY_ID.test(x.storyId)) {
    return 'an entry names no valid story';
  }
  if (typeof x.component !== 'string' || !COMPONENT.test(x.component)) {
    return 'an entry names no valid component';
  }
  if (
    typeof x.index !== 'number' ||
    !Number.isInteger(x.index) ||
    x.index < 0 ||
    x.index > MAX_INDEX
  ) {
    return 'an entry has no valid instance number';
  }
  if (typeof x.prop !== 'string' || !PROP.test(x.prop)) {
    return 'an entry names no valid prop';
  }
  if (!isValue(x.value)) return `${x.prop} has a value that is not allowed`;
  if (!isFrom(x.from)) return `${x.prop} has a value that is not allowed`;
  return undefined;
};

const toBase64Url = (text: string) =>
  btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromBase64Url = (payload: string) =>
  atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

type Tuple = [string, string, number, string, PropValue];

// `[storyId, component, index, prop, value]` per edit, as base64url JSON.
// ASCII only: every field passed shapeError.
export const encodeInstanceEdits = (edits: InstanceEdit[]): string =>
  toBase64Url(
    JSON.stringify(
      edits.map(
        (e): Tuple => [e.storyId, e.component, e.index, e.prop, e.value]
      )
    )
  );

export type ParseResult = { edits: InstanceEdit[]; error?: string };

const fail = (error: string): ParseResult => ({ edits: [], error });

// Decodes and checks a share link's `p`. The hash is anyone's input: any
// bad entry rejects the whole link, as the token link does.
export const decodeInstanceEdits = (payload: string): ParseResult => {
  if (payload.length > MAX_PAYLOAD) return fail('the link is too long');
  if (!/^[A-Za-z0-9_-]+$/.test(payload)) return fail('the link is damaged');
  let json: unknown;
  try {
    json = JSON.parse(fromBase64Url(payload));
  } catch {
    return fail('the link is damaged');
  }
  if (!Array.isArray(json)) return fail('the link is damaged');
  if (json.length > MAX_EDITS) return fail('the link has too many prop edits');
  const edits: InstanceEdit[] = [];
  const seen = new Set<string>();
  for (const t of json) {
    if (!Array.isArray(t) || t.length !== 5) return fail('the link is damaged');
    const [storyId, component, index, prop, value] = t as unknown[];
    const e = { storyId, component, index, prop, value };
    const error = shapeError(e);
    if (error) return fail(error);
    const edit = e as InstanceEdit;
    if (seen.has(editKey(edit))) return fail('the link repeats a prop edit');
    seen.add(editKey(edit));
    edits.push(edit);
  }
  return { edits };
};

const splitHash = (hash: string) => {
  const raw = hash.replace(/^#/, '');
  const q = raw.indexOf('?');
  return {
    path: q === -1 ? raw : raw.slice(0, q),
    params: new URLSearchParams(q === -1 ? '' : raw.slice(q + 1)),
  };
};

export const payloadOfHash = (hash: string): string | null =>
  splitHash(hash).params.get(PARAM) || null;

// The hash with `p` set to the edits, or removed when there are none; the
// other parameters (the token link's `o`) kept.
export const withInstanceEdits = (hash: string, edits: InstanceEdit[]) => {
  const { path, params } = splitHash(hash);
  if (edits.length) params.set(PARAM, encodeInstanceEdits(edits));
  else params.delete(PARAM);
  const q = params.toString();
  return `#${path}${q ? `?${q}` : ''}`;
};

// Stored edits, checked one by one: bad ones are dropped.
export const parseStoredEdits = (raw: string | null): InstanceEdit[] => {
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    const seen = new Set<string>();
    return list.slice(0, MAX_EDITS).flatMap((v): InstanceEdit[] => {
      if (shapeError(v)) return [];
      const x = v as InstanceEdit;
      const e: InstanceEdit = {
        storyId: x.storyId,
        component: x.component,
        index: x.index,
        prop: x.prop,
        value: x.value,
        ...(x.from !== undefined && { from: x.from }),
      };
      if (seen.has(editKey(e))) return [];
      seen.add(editKey(e));
      return [e];
    });
  } catch {
    return [];
  }
};

// ---------------------------------------------------------------- frame

// What the frame's registry takes: per story id, per `<Name>#<index>`, the
// props to set.
export const framePayload = (
  edits: InstanceEdit[]
): Record<string, Record<string, Record<string, PropValue>>> => {
  const out: Record<string, Record<string, Record<string, PropValue>>> = {};
  edits.forEach((e) => {
    const story = (out[e.storyId] ??= {});
    (story[`${e.component}#${e.index}`] ??= {})[e.prop] = e.value;
  });
  return out;
};

// Sets or replaces one edit; setting a prop back to what the instance
// rendered before removes the edit.
export const putEdit = (
  edits: InstanceEdit[],
  next: InstanceEdit
): InstanceEdit[] => {
  const key = editKey(next);
  const old = edits.find((e) => editKey(e) === key);
  const from = old ? old.from : next.from;
  const rest = edits.filter((e) => editKey(e) !== key);
  if (from !== undefined && Object.is(from, next.value)) return rest;
  return [...rest, { ...next, from }];
};

// ---------------------------------------------------------------- words

export const valueText = (v: PropValue | null | undefined) =>
  v === null || v === undefined ? 'not set' : String(v);

// "Spotlight › Button: buttonStyle primary → text"
export const changeLine = (e: InstanceEdit, storyName: string) =>
  `${storyName} › ${e.component}${e.index > 0 ? ` ${e.index + 1}` : ''}: ${
    e.prop
  } ${valueText(e.from)} → ${valueText(e.value)}`;

// The prop as JSX: buttonStyle="text", disabled, disabled={false}, size={2}.
export const jsxProp = (prop: string, value: PropValue) =>
  typeof value === 'string'
    ? `${prop}="${value}"`
    : value === true
    ? prop
    : `${prop}={${String(value)}}`;

export type CallSite = {
  line: number;
  // The JSX element at the line: the component itself or a wrapper.
  element: string;
  // The wrapper's file, when the element wraps the component.
  wrapperFile?: string;
};

const fileOfComponent = (scan: ScanOutput, name: string) =>
  scan.components.find((c) => c.component === name)?.file;

// Where `parentFile` renders `component`: its own JSX elements, and those
// of components whose main file renders it (a wrapper such as
// ButtonWithLink around Button), in line order. Needs the scan's `sites`.
export const callSitesOf = (
  scan: ScanOutput,
  parentFile: string,
  component: string
): CallSite[] => {
  const here = scan.usages.filter((u) => u.file === parentFile);
  const usesIt = (file: string) =>
    scan.usages.some((u) => u.file === file && u.component === component);
  const out: CallSite[] = [];
  here.forEach((u) => {
    if (u.component === component) {
      (u.sites ?? []).forEach((line) => out.push({ line, element: component }));
      return;
    }
    const wrapperFile = fileOfComponent(scan, u.component);
    if (wrapperFile && wrapperFile !== parentFile && usesIt(wrapperFile)) {
      (u.sites ?? []).forEach((line) =>
        out.push({ line, element: u.component, wrapperFile })
      );
    }
  });
  return out.sort((a, b) => a.line - b.line);
};

export type InstanceTaskContext = {
  // The story's name and its component file (the parent's code).
  storyName: string;
  parentFile?: string;
  sites: CallSite[];
};

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

// The code task for one instance edit: the parent file, the call site and
// the prop to set there. A wrapper is named as such.
export const instanceTask = (
  e: InstanceEdit,
  ctx: InstanceTaskContext
): string => {
  const prop = jsxProp(e.prop, e.value);
  const nth =
    e.index > 0
      ? ` (the ${ordinal(e.index + 1)} ${e.component} in the story)`
      : '';
  const file = ctx.parentFile ?? `the file of ${ctx.storyName}`;
  const lines: string[] = [];
  if (ctx.sites.length === 1) {
    const s = ctx.sites[0];
    lines.push(
      `change: ${ctx.storyName} · ${file}:${s.line} · on the ${s.element} at line ${s.line}, set ${prop}`
    );
    if (s.wrapperFile) {
      lines.push(
        `note: the call site is ${s.element}, a wrapper (${s.wrapperFile}) that renders ${e.component}; check that it passes ${e.prop} through to ${e.component}`
      );
    }
  } else if (ctx.sites.length > 1) {
    const list = ctx.sites
      .map(
        (s) =>
          `line ${s.line} (${s.element}${s.wrapperFile ? ', a wrapper' : ''})`
      )
      .join(', ');
    lines.push(
      `change: ${ctx.storyName} · ${file} · set ${prop} on the call site that renders this ${e.component}${nth}, one of: ${list}`
    );
    const wrappers = ctx.sites.filter((s) => s.wrapperFile);
    wrappers
      .filter(
        (s, i) => wrappers.findIndex((w) => w.element === s.element) === i
      )
      .forEach((s) =>
        lines.push(
          `note: ${s.element} is a wrapper (${s.wrapperFile}) that renders ${e.component}; check that it passes ${e.prop} through`
        )
      );
  } else {
    lines.push(
      `change: ${ctx.storyName} · ${file} · set ${prop} on the ${e.component}${nth}; the scan found no call site of ${e.component} in this file, so it may sit in a component this file renders`
    );
  }
  lines.push(
    `why: instance prop from the workbench: ${e.prop} ${valueText(
      e.from
    )} → ${valueText(e.value)} on this ${e.component} inside ${
      ctx.storyName
    }, not on every ${e.component}; it changes every ${
      ctx.storyName
    } wherever it renders`,
    `check: story ${e.storyId}`
  );
  return lines.join('\n');
};
