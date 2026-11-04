// Runs a componentStyle's rules with the context its component rendered
// with, the way styled-components 5.3.9 does (`flatten`, `Ne(e,n,r,o)` in
// node_modules/styled-components/dist/styled-components.browser.esm.js),
// then labels every piece of the CSS text with where it came from: a quasi
// of an indexed template, or what one of its expressions produced. A
// function's result is placed in its own template: an array (a css``
// result) by aligning it, a string a string template returned (the Button's
// getButtonStyle) by splitting it back into its expressions exactly.
import { alignOutcome } from './align';
import type { IndexClient } from './indexClient';
import {
  ComponentStyle,
  Context,
  generatedNames,
  isStyledComponent,
} from './internals';
import { readEval } from './readEval';
import type { Alignment, Hop, Origin, Piece, Slot, Template } from './types';

// ------------------------------------------------------------ the copy

// `_e=function(e){return null==e||!1===e||""===e}`
const isFalsish = (v: unknown) =>
  v === undefined || v === null || v === false || v === '';

// The Keyframes class (`ve`): an object with its name, id and getName.
const isKeyframes = (v: unknown): v is { getName(): string } =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as { getName?: unknown }).getName === 'function' &&
  typeof (v as { id?: unknown }).id === 'string' &&
  (v as { id: string }).id.startsWith('sc-keyframes-');

const REACT_ELEMENT = Symbol.for('react.element');
const REACT_PORTAL = Symbol.for('react.portal');

// `S=function(t){return null!==t&&"object"==typeof t&&"[object Object]"===
// (t.toString?t.toString():Object.prototype.toString.call(t))&&!e(t)}`
// where e is react-is typeOf (an element or a portal).
const isPlainObject = (t: unknown): t is Record<string, unknown> => {
  if (t === null || typeof t !== 'object') return false;
  const o = t as { toString?: () => string; $$typeof?: unknown };
  const tag = o.toString ? o.toString() : Object.prototype.toString.call(t);
  return (
    tag === '[object Object]' &&
    o.$$typeof !== REACT_ELEMENT &&
    o.$$typeof !== REACT_PORTAL
  );
};

// @emotion/unitless 0.7.5, the copy styled-components 5.3.9 depends on.
// Read with `in`, as the original does.
const UNITLESS: Record<string, 1> = {
  animationIterationCount: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1,
};

// `be`: `ge.test(e)?e.replace(Se,Ee).replace(we,"-ms-"):e`
const hyphenate = (s: string) =>
  /([A-Z])/.test(s)
    ? s
        .replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`)
        .replace(/^ms-/, '-ms-')
    : s;

// What `Array.prototype.join` writes for an entry.
const joined = (v: unknown) => (v === undefined || v === null ? '' : String(v));

// `objToCssArray` (the function inside Ne): its entries are not flattened
// again, so a function or a css array in it is written by join().
const objToCss = (obj: Record<string, unknown>, prev?: string): unknown[] => {
  const out: unknown[] = [];
  for (const key in obj) {
    if (
      !Object.prototype.hasOwnProperty.call(obj, key) ||
      isFalsish(obj[key])
    ) {
      continue;
    }
    const v = obj[key];
    if (
      (Array.isArray(v) && (v as { isCss?: boolean }).isCss) ||
      typeof v === 'function'
    ) {
      out.push(`${hyphenate(key)}:`, v, ';');
    } else if (isPlainObject(v)) {
      out.push(...objToCss(v, key));
    } else {
      const unit =
        v === null || v === undefined || typeof v === 'boolean' || v === ''
          ? ''
          : typeof v !== 'number' || v === 0 || key in UNITLESS
          ? String(v).trim()
          : `${v}px`;
      out.push(`${hyphenate(key)}: ${unit};`);
    }
  }
  return prev ? [`${prev} {`, ...out, '}'] : out;
};

// The flattening of one value, kept as a tree so each function's raw
// result stays next to what it flattened to.
export type FlatNode =
  | { k: 'text'; text: string }
  | { k: 'list'; items: { i: number; node: FlatNode }[] }
  | { k: 'call'; result: unknown; out: FlatNode };

const EMPTY: FlatNode = { k: 'text', text: '' };

// `Ne(e, n, r, o)` with an execution context `n` (always given here) and a
// stylis instance without plugins (a keyframes' name gets no suffix).
export const flatten = (chunk: unknown, context: Context): FlatNode => {
  if (Array.isArray(chunk)) {
    const items: { i: number; node: FlatNode }[] = [];
    chunk.forEach((c, i) => {
      const node = flatten(c, context);
      if (!(node.k === 'text' && node.text === '')) items.push({ i, node });
    });
    return { k: 'list', items };
  }
  if (isFalsish(chunk)) return EMPTY;
  if (isStyledComponent(chunk)) {
    return {
      k: 'text',
      text: `.${(chunk as { styledComponentId: string }).styledComponentId}`,
    };
  }
  if (typeof chunk === 'function') {
    const proto = (chunk as { prototype?: { isReactComponent?: unknown } })
      .prototype;
    if (proto && proto.isReactComponent)
      return { k: 'text', text: String(chunk) };
    const result = (chunk as (c: Context) => unknown)(context);
    return { k: 'call', result, out: flatten(result, context) };
  }
  if (isKeyframes(chunk)) return { k: 'text', text: chunk.getName() };
  if (isPlainObject(chunk)) {
    return {
      k: 'list',
      items: objToCss(chunk).map((v, i) => ({
        i,
        node: { k: 'text', text: joined(v) },
      })),
    };
  }
  return { k: 'text', text: (chunk as { toString(): string }).toString() };
};

export const textOf = (node: FlatNode): string =>
  node.k === 'text'
    ? node.text
    : node.k === 'call'
    ? textOf(node.out)
    : node.items.map((x) => textOf(x.node)).join('');

// Each rule of a componentStyle flattened as generateAndInjectStyles does:
// a string as it is, a truthy non-string through Ne, a falsy one skipped.
export const flattenRules = (
  rules: unknown[],
  context: Context
): (FlatNode | undefined)[] =>
  rules.map((rule) =>
    typeof rule === 'string'
      ? { k: 'text', text: rule }
      : rule
      ? flatten(rule, context)
      : undefined
  );

// The class names (production, development) the componentStyle generates
// with this context: the owner of a rule is the style whose name it carries.
export const namesOf = (cs: ComponentStyle, context: Context): string[] =>
  generatedNames(
    cs,
    flattenRules(cs.rules, context).map((n) => (n ? textOf(n) : undefined))
  );

// ------------------------------------------------------------ string split

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export type SplitResult =
  | { ok: true; method: 'eval' | 'regex'; values: string[] }
  | { ok: false };

// The runtime string a string template produced, split back into its
// expressions' values. 1: every expression evaluates and the quasis with
// the values give the string, character for character. 2: an anchored
// regex of the escaped quasis, each expression that evaluates pinned to its
// value and each that does not a group; the lazy and the greedy match must
// agree, which proves the split is the only one. Never an indexOf: many
// quasis are the same `;\n    `.
export const splitString = (
  t: Template,
  runtime: string,
  context: Context
): SplitResult => {
  const known = t.exprs.map((e) => {
    const r = readEval(e.read, context);
    return r.ok ? String(r.value) : undefined;
  });
  if (known.every((v) => v !== undefined)) {
    const values = known as string[];
    const whole = t.quasis.map((q, k) => q + (values[k] ?? '')).join('');
    if (whole === runtime) return { ok: true, method: 'eval', values };
  }
  const pattern = (group: string) =>
    new RegExp(
      `^${t.quasis
        .map(
          (q, k) =>
            escapeRegExp(q) +
            (k < t.exprs.length
              ? known[k] !== undefined
                ? `(${escapeRegExp(known[k] as string)})`
                : group
              : '')
        )
        .join('')}$`,
      's'
    );
  const lazy = pattern('(.*?)').exec(runtime);
  const greedy = pattern('(.*)').exec(runtime);
  if (!lazy || !greedy) return { ok: false };
  const values = lazy.slice(1);
  if (values.some((v, k) => v !== greedy[k + 1])) return { ok: false };
  return { ok: true, method: 'regex', values };
};

// ------------------------------------------------------------ origins

// The string template a function's expression returns, when its read says
// so: `call getButtonStyle` whose body returns `template <id>`, followed
// through the code's own conditions with this context.
const templateIdOf = (t: Template, k: number, context: Context) => {
  const r = readEval(t.exprs[k].read, context);
  return !r.ok && r.leafPosition && r.at.k === 'template' ? r.at.id : undefined;
};

type Labeller = {
  context: Context;
  client: Pick<IndexClient, 'candidates' | 'load' | 'get'>;
};

const slotOrigin = (slot: Slot, value: string): Origin =>
  slot.kind === 'quasi'
    ? { kind: 'quasi', template: slot.template, k: slot.k, path: slot.path }
    : {
        kind: 'expr',
        template: slot.template,
        k: slot.k,
        value,
        path: slot.path,
      };

// Pieces of a node whose inner structure is not placed: one origin, the
// expression, for the whole text.
const wholeOf = (node: FlatNode, origin: Origin): Piece[] => {
  const text = textOf(node);
  return text ? [{ text, origin, at: 0 }] : [];
};

// Aligns a function's array result with its own template: the one its read
// names, else the helper's call site, else the unique candidate the lookup
// gives among css templates.
const alignResult = async (
  result: unknown[],
  hint: string | undefined,
  l: Labeller
): Promise<Alignment | undefined> => {
  const tryOne = async (id: string) => {
    const t = await l.client.load(id);
    if (!t) return undefined;
    const r = alignOutcome(result, t, l.client.get);
    return r.ok ? r.alignment : undefined;
  };
  if (hint) return tryOne(hint);
  const found: Alignment[] = [];
  for (const id of await l.client.candidates(result)) {
    const t = await l.client.load(id);
    if (t?.kind !== 'css') continue;
    const a = await tryOne(id);
    if (a) found.push(a);
  }
  return found.length === 1 ? found[0] : undefined;
};

// The pieces of what the expression at `slot` produced at runtime.
const labelCall = async (
  node: Extract<FlatNode, { k: 'call' }>,
  slot: Extract<Slot, { kind: 'expr' }>,
  l: Labeller
): Promise<Piece[]> => {
  const text = textOf(node);
  const whole: Origin = slotOrigin(slot, text);
  if (!text) return [];
  const hop: Hop[] = [...slot.path, { template: slot.template, expr: slot.k }];
  const read = templateIdOf(slot.template, slot.k, l.context);
  const { result } = node;
  if (typeof result === 'string' && read) {
    const t = await l.client.load(read);
    if (t?.kind === 'string') {
      const split = splitString(t, result, l.context);
      if (!split.ok) return wholeOf(node, whole);
      const out: Piece[] = [];
      t.quasis.forEach((q, k) => {
        if (q) {
          out.push({
            text: q,
            origin: { kind: 'quasi', template: t, k, path: hop },
            at: 0,
          });
        }
        const v = split.values[k];
        if (k < t.exprs.length && v) {
          out.push({
            text: v,
            origin: { kind: 'expr', template: t, k, value: v, path: hop },
            at: 0,
          });
        }
      });
      return out;
    }
  }
  if (Array.isArray(result) && node.out.k === 'list') {
    const alignment = await alignResult(result, read ?? slot.slot, l);
    if (alignment) {
      const inner = alignment.slots.map((s) => ({
        ...s,
        path: [...hop, ...s.path],
      })) as Slot[];
      return labelList(node.out, inner, l);
    }
  }
  return wholeOf(node, whole);
};

// The pieces of a list whose entries are placed by `slots` (entry i of the
// raw array at slots[i]).
const labelList = async (
  list: Extract<FlatNode, { k: 'list' }>,
  slots: Slot[],
  l: Labeller
): Promise<Piece[]> => {
  const out: Piece[] = [];
  for (const { i, node } of list.items) {
    out.push(...(await labelNode(node, slots[i], l)));
  }
  return out;
};

const labelNode = async (
  node: FlatNode,
  slot: Slot,
  l: Labeller
): Promise<Piece[]> => {
  if (node.k === 'call' && slot.kind === 'expr')
    return labelCall(node, slot, l);
  return wholeOf(node, slotOrigin(slot, textOf(node)));
};

// The componentStyle's CSS text as pieces with origins, in rule order. The
// texts joined are exactly what 5.3.9 handed to stylis.
export const flattenWithOrigins = async (
  rules: unknown[],
  context: Context,
  alignment: Alignment,
  client: Labeller['client']
): Promise<Piece[]> => {
  const nodes = flattenRules(rules, context);
  const l: Labeller = { context, client };
  const out: Piece[] = [];
  for (let d = 0; d < rules.length; d++) {
    const node = nodes[d];
    if (node) out.push(...(await labelNode(node, alignment.slots[d], l)));
  }
  return out;
};
