// The join for a property a styled-components rule wins. The rule's owner
// (owner.ts) is run again with its own context, its CSS parsed with the
// place every character came from (evaluate.ts, cssParse.ts). The parsed
// rule is the one whose canonical selector and conditions are the CSSOM
// rule's, at the same ordinal; its last declaration of the property is the
// decl, checked against the CSSOM's own value; the expression that wrote
// the value is read back to its leaf (readEval.ts). Each step either holds
// exactly or names why the property is not traced.
import { alignOutcome } from './align';
import {
  Declared,
  MatchedRule,
  originalPart,
  originalSelector,
  sheetKind,
} from './cascade';
import type { Canonicaliser } from './canonical';
import { indexDeclAt, ParsedDecl, ParsedRule, parseCss } from './cssParse';
import { flattenWithOrigins } from './evaluate';
import type { IndexClient } from './indexClient';
import type { ComponentStyle } from './internals';
import {
  generatedClasses,
  Owner,
  ownerClass,
  ownerElement,
  resolveOwner,
} from './owner';
import { EvalOk, EvalStuck, readEval } from './readEval';
import type {
  Alignment,
  Editable,
  IndexMeta,
  Origin,
  PropTrace,
  Read,
  Span,
  Template,
  TraceSource,
  ViaStep,
  Why,
} from './types';

export type StyledDeps = {
  client: IndexClient;
  canon: Canonicaliser;
  meta: IndexMeta;
  // One run per owner element and generated name, for one traceElement.
  runs: WeakMap<Element, Map<string, Promise<Run>>>;
};

export type StyledTrace = { trace: PropTrace; root?: Template };

type Run =
  | { ok: true; owner: Owner; alignment: Alignment; rules: ParsedRule[] }
  | { ok: false; why: Why };

// ------------------------------------------------------------ the rule

export const ruleInfo = (m: MatchedRule): NonNullable<PropTrace['rule']> => ({
  selector: m.rule.selectorText,
  atRules: m.atRules,
  sheet: sheetKind(m.sheet),
  ...(m.sheet.href ? { href: m.sheet.href } : {}),
});

export const isStoryFrame = (file: string) =>
  /\.stories\.[jt]sx?$/.test(file) || file.startsWith('.storybook/');

// ------------------------------------------------------------ the run

type Aligned = { ok: true; alignment: Alignment } | { ok: false; why: Why };

const alignments = new WeakMap<
  IndexClient,
  WeakMap<ComponentStyle, Promise<Aligned>>
>();

// The componentStyle's own template: exactly one styled template among the
// lookup's candidates aligns with its rules.
const alignmentOf = (cs: ComponentStyle, client: IndexClient) => {
  let mine = alignments.get(client);
  if (!mine) alignments.set(client, (mine = new WeakMap()));
  let known = mine.get(cs);
  if (!known) {
    known = (async (): Promise<Aligned> => {
      const found: Alignment[] = [];
      let unsure = false;
      for (const id of await client.candidates(cs.rules)) {
        const t = await client.load(id);
        if (t?.kind !== 'styled') continue;
        const r = alignOutcome(cs.rules, t, client.get);
        if (r.ok) found.push(r.alignment);
        else if (r.why !== 'no-match') unsure = true;
      }
      if (found.length === 1 && !unsure) {
        return { ok: true, alignment: found[0] };
      }
      return {
        ok: false,
        why: found.length > 1 || unsure ? 'ambiguous' : 'no-index-match',
      };
    })();
    mine.set(cs, known);
  }
  return known;
};

const runOf = async (
  element: Element,
  name: string,
  deps: StyledDeps
): Promise<Run> => {
  const res = resolveOwner(
    element,
    name,
    generatedClasses(element.ownerDocument)
  );
  if (!res.ok) return res;
  const { owner } = res;
  const aligned = await alignmentOf(owner.style, deps.client);
  if (!aligned.ok) return aligned;
  const pieces = await flattenWithOrigins(
    owner.style.rules,
    owner.context,
    aligned.alignment,
    deps.client
  );
  return {
    ok: true,
    owner,
    alignment: aligned.alignment,
    rules: parseCss(pieces, name, owner.style.componentId),
  };
};

const runFor = (element: Element, name: string, deps: StyledDeps) => {
  let byName = deps.runs.get(element);
  if (!byName) deps.runs.set(element, (byName = new Map()));
  let run = byName.get(name);
  if (!run) {
    run = runOf(element, name, deps);
    byName.set(name, run);
  }
  return run;
};

// ------------------------------------------------------------ the rule's place

type Ctor = abstract new (...args: never[]) => unknown;

const isA = (view: Window | null, rule: CSSRule, name: string) => {
  const C = (view as unknown as Record<string, unknown> | null)?.[name];
  return typeof C === 'function' && rule instanceof (C as Ctor);
};

const conditionOf = (rule: CSSRule): string =>
  (rule as CSSConditionRule).conditionText ??
  (rule as CSSMediaRule).media?.mediaText ??
  '';

// Every style rule of the sheet with its conditions ('@media <text>'),
// whether or not they hold now.
const styleRulesOf = (sheet: CSSStyleSheet, view: Window | null) => {
  const out: { rule: CSSStyleRule; atRules: string[] }[] = [];
  const walk = (list: CSSRuleList, atRules: string[]) => {
    for (const rule of Array.from(list)) {
      if (isA(view, rule, 'CSSStyleRule')) {
        out.push({ rule: rule as CSSStyleRule, atRules });
      } else if (isA(view, rule, 'CSSMediaRule')) {
        walk((rule as CSSMediaRule).cssRules, [
          ...atRules,
          `@media ${conditionOf(rule)}`,
        ]);
      } else if (isA(view, rule, 'CSSSupportsRule')) {
        walk((rule as CSSSupportsRule).cssRules, [
          ...atRules,
          `@supports ${conditionOf(rule)}`,
        ]);
      } else if ((rule as CSSGroupingRule).cssRules) {
        walk((rule as CSSGroupingRule).cssRules, atRules);
      }
    }
  };
  try {
    walk(sheet.cssRules, []);
  } catch {
    return [];
  }
  return out;
};

// The parsed rule the CSSOM rule was inserted from: the same canonical
// selector (the pseudo-states addon's rewrites taken out) and conditions,
// and the same ordinal among the rules that share both.
const parsedRuleOf = (
  m: MatchedRule,
  rules: ParsedRule[],
  canon: Canonicaliser,
  view: Window | null
): ParsedRule | undefined => {
  const keyOf = (selectorText: string, atRules: string[]) =>
    `${originalSelector(selectorText)}\u0000${atRules.join('\u0001')}`;
  const all = styleRulesOf(m.sheet, view);
  const mine = all.find((r) => r.rule === m.rule);
  if (!mine) return undefined;
  const key = keyOf(m.rule.selectorText, mine.atRules);
  const same = all.filter((r) => keyOf(r.rule.selectorText, r.atRules) === key);
  const selector = canon.selector(originalSelector(m.rule.selectorText));
  const conditions = mine.atRules.map((a) => canon.atRule(a));
  if (selector === undefined || conditions.includes(undefined)) {
    return undefined;
  }
  const parsed = rules.filter(
    (p) =>
      canon.selector(p.selector) === selector &&
      p.atRules.length === conditions.length &&
      p.atRules.every((a, i) => canon.atRule(a) === conditions[i])
  );
  if (parsed.length !== same.length) return undefined;
  return parsed[same.findIndex((r) => r.rule === m.rule)];
};

// ------------------------------------------------------------ shorthands

type Part = { start: number; end: number; text: string };

// The whitespace-separated parts of a value, outside parentheses and quotes.
export const partsOf = (value: string): Part[] => {
  const out: Part[] = [];
  let start = -1;
  let depth = 0;
  let quote = '';
  for (let i = 0; i <= value.length; i++) {
    const c = value[i];
    const space = c === undefined || (/\s/.test(c) && !quote && depth === 0);
    if (!space && start < 0) start = i;
    if (space && start >= 0) {
      out.push({ start, end: i, text: value.slice(start, i) });
      start = -1;
    }
    if (c === undefined) break;
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')') depth = Math.max(0, depth - 1);
  }
  return out;
};

// The box shorthands: the longhands in the order the spec's positions
// name them (top right bottom left; row column for gap).
const BOX: Record<string, string[]> = {};
for (const box of ['padding', 'margin', 'scroll-margin', 'scroll-padding']) {
  BOX[box] = ['top', 'right', 'bottom', 'left'].map((s) => `${box}-${s}`);
}
for (const part of ['width', 'style', 'color']) {
  BOX[`border-${part}`] = ['top', 'right', 'bottom', 'left'].map(
    (s) => `border-${s}-${part}`
  );
}
BOX.inset = ['top', 'right', 'bottom', 'left'];
BOX['border-radius'] = [
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
];
BOX.gap = ['row-gap', 'column-gap'];

// Which of n values each position takes: 1 value for all, 2 for vertical
// and horizontal, 3 for top, horizontal, bottom, 4 for each.
const POSITION = [
  [0, 0, 0, 0],
  [0, 1, 0, 1],
  [0, 1, 2, 1],
  [0, 1, 2, 3],
];

// The part of a shorthand's value that sets the longhand: the spec's
// position for the box shorthands, else the one part that is a valid value
// of the longhand serializing to the same text. Either way the browser
// must agree: the part as the longhand serializes to its value.
export const shorthandPart = (
  canon: Canonicaliser,
  prop: string,
  value: string,
  longhand: string,
  serialized: string
): (Part & { index: number }) | undefined => {
  if (!serialized) return undefined;
  const parts = partsOf(value);
  const same = (p: Part) => canon.value(longhand, p.text) === serialized;
  const box = BOX[prop];
  if (box) {
    const side = box.indexOf(longhand);
    const n = parts.length;
    if (side < 0 || n < 1 || n > box.length || value.includes('/')) {
      return undefined;
    }
    const index =
      box.length === 2 ? Math.min(side, n - 1) : POSITION[n - 1][side];
    return same(parts[index]) ? { ...parts[index], index } : undefined;
  }
  const hits = parts.filter(same);
  if (hits.length !== 1) return undefined;
  return { ...hits[0], index: parts.indexOf(hits[0]) };
};

// ------------------------------------------------------------ source text

const BREAK = /\r\n|[\n\r\u2028\u2029]/g;

// 1-based line, 0-based column, and the line's text, as Babel counts lines.
export const lineAt = (src: string, offset: number) => {
  let line = 1;
  let start = 0;
  for (const m of src.matchAll(BREAK)) {
    if (m.index >= offset) break;
    line++;
    start = m.index + m[0].length;
  }
  const rest = src.slice(start).search(/[\n\r\u2028\u2029]/);
  const end = rest < 0 ? src.length : start + rest;
  return { line, col: offset - start, text: src.slice(start, end) };
};

// The length of the escape sequence at raw[i] and the UTF-16 units it cooks
// to (the index's loc.ts, copied).
const escapeAt = (raw: string, i: number): [number, number] => {
  const c = raw[i + 1];
  if (c === undefined) return [1, 0];
  if (c === '\r') return [raw[i + 2] === '\n' ? 3 : 2, 0];
  if (c === '\n' || c === '\u2028' || c === '\u2029') return [2, 0];
  if (c === 'x') return [4, 1];
  if (c === 'u') {
    if (raw[i + 2] === '{') {
      const close = raw.indexOf('}', i + 3);
      if (close < 0) return [2, 1];
      return [
        close - i + 1,
        parseInt(raw.slice(i + 3, close), 16) > 0xffff ? 2 : 1,
      ];
    }
    return [6, 1];
  }
  return [2, 1];
};

type Range = { start: number; end: number; escaped: boolean };

// Where characters [from, to) of quasi k's cooked text are written in the
// file: from the opening delimiter (k 0) or the `}` closing hole k-1, cooking
// escapes on the way. Undefined when the file does not read as the index
// says (the text there is not the quasi's).
export const quasiRange = (
  src: string,
  t: Template,
  k: number,
  from: number,
  to: number
): Range | undefined => {
  let i: number;
  if (k === 0) {
    if (!'`\'"'.includes(src[t.loc.start] ?? 'x')) return undefined;
    i = t.loc.start + 1;
  } else {
    i = t.exprs[k - 1].loc.end;
    while (/\s/.test(src[i] ?? '')) i++;
    if (src[i] !== '}') return undefined;
    i++;
  }
  let cooked = 0;
  let start = -1;
  let escaped = false;
  while (cooked < to && i < src.length) {
    if (cooked === from && start < 0) start = i;
    if (src[i] === '\\') {
      const [len, n] = escapeAt(src, i);
      if (start >= 0) escaped = true;
      i += len;
      cooked += n;
    } else {
      i++;
      cooked++;
    }
  }
  if (cooked !== to || start < 0) return undefined;
  const text = t.quasis[k].slice(from, to);
  if (!escaped && src.slice(start, i) !== text) return undefined;
  return { start, end: i, escaped };
};

// A rendering of a read, for a file the trace could not read.
const rendered = (r: Read): string => {
  switch (r.k) {
    case 'literal':
      return `'${r.value}'`;
    case 'token':
      return `var(${r.name})`;
    case 'theme':
      return `theme.${r.path.join('.')}`;
    case 'const':
      return `${r.source}.${r.path.join('.')}`;
    case 'prop':
      return `props.${r.name}`;
    case 'call':
      return `${r.callee}(…)`;
    case 'map':
      return `[…].${r.field}`;
    case 'unknown':
      return r.text;
    default:
      return r.k;
  }
};

// Whether the text at a read's place is that read: a file at another
// commit than the index's does not pass.
const reads = (r: Read, text: string): boolean => {
  const last = (path: string[]) => path[path.length - 1] ?? '';
  switch (r.k) {
    case 'literal':
      return (
        r.value === '' ||
        text === r.value ||
        text.includes('\\') ||
        ('`\'"'.includes(text[0]) && text.slice(1, -1) === r.value)
      );
    case 'theme':
    case 'const':
      return text.includes(last(r.path));
    case 'prop':
      return text.includes(r.name);
    case 'token':
      return text.includes(r.name);
    default:
      return text.length > 0;
  }
};

const firstLine = (s: string) => {
  const line = s.split(/[\n\r\u2028\u2029]/)[0].trim();
  return line.length > 120 ? `${line.slice(0, 119)}…` : line;
};

// ------------------------------------------------------------ the leaf

type Text = { src?: string; file: string };

const textOf = (r: Read, at: Text) => {
  const slice = at.src?.slice(r.loc.start, r.loc.end);
  return slice !== undefined && reads(r, slice) ? slice : undefined;
};

// Template expression hops (outermost first), the decl's own expression,
// then each const followed, map and call crossed, then the leaf.
const viaOf = (
  path: { template: Template; expr: number }[],
  reached: Read[],
  leaf: Read,
  at: Text
): ViaStep[] => {
  const out: ViaStep[] = path.map(({ template, expr }) => ({
    text: `\${${template.exprs[expr].text}}`,
    file: template.file,
    line: template.exprs[expr].loc.line,
  }));
  for (const r of [...reached, leaf]) {
    for (const c of r.consts ?? []) {
      out.push({ text: `const ${c.name}`, file: at.file, line: c.loc.line });
    }
    if (r !== leaf && (r.k === 'map' || r.k === 'call')) {
      const text = textOf(r, at);
      out.push({
        text: text ? firstLine(text) : rendered(r),
        file: at.file,
        line: r.loc.line,
      });
    }
  }
  const text = textOf(leaf, at);
  out.push({
    text: text ? firstLine(text) : rendered(leaf),
    file: at.file,
    line: leaf.loc.line,
  });
  return out;
};

const keyOfLeaf = (r: Read): string | undefined =>
  r.k === 'theme'
    ? `theme.${r.path.join('.')}`
    : r.k === 'const'
    ? `${r.source}.${r.path.join('.')}`
    : undefined;

// A concat of literals (and tokens) around one theme or const read.
const onlyRead = (r: Read): Read | undefined => {
  if (r.k !== 'concat') return undefined;
  const others = r.parts.filter((p) => p.k !== 'literal' && p.k !== 'token');
  return others.length === 1 && keyOfLeaf(others[0]) ? others[0] : undefined;
};

const staticOf = (r: Read): string | undefined => {
  switch (r.k) {
    case 'literal':
      return r.value;
    case 'token':
      return `var(${r.name})`;
    case 'theme':
    case 'const':
      return r.value;
    case 'concat': {
      const parts = r.parts.map(staticOf);
      return parts.every((p) => p !== undefined) ? parts.join('') : undefined;
    }
    default:
      return undefined;
  }
};

const defOf = (r: Read, runtime: unknown, meta: IndexMeta) => {
  if (r.k !== 'theme' && r.k !== 'const') return undefined;
  if (r.value === undefined || String(runtime) !== r.value) return undefined;
  const dotted = r.path.join('.');
  const place =
    r.k === 'theme'
      ? meta.themeDefs[dotted]
      : meta.constDefs[`${r.source}.${dotted}`] ??
        (r.source === 'fontSizes'
          ? meta.themeDefs[`fontSizes.${dotted}`]
          : r.source === 'stylingConsts'
          ? meta.themeDefs[dotted]
          : undefined);
  return place && { file: place.file, line: place.line };
};

// The deepest result whose value holds [from, to): the concat part that
// covers the range, recursively, and the range inside it.
// A unit written right after the one expression of a longer string
// (`font-size: ${fontSizes.m}px;`) belongs to the string, as in a styled
// template: the range drills into that expression, and says so (an edit
// there would keep the unit after it).
const UNIT = /^[a-z%]+$/i;

type Drilled = { r: EvalOk; from: number; to: number; unit?: boolean };

export const drillTo = (r: EvalOk, from: number, to: number): Drilled => {
  const part = r.parts?.find((p) => p.start <= from && to <= p.end);
  if (part) return drillTo(part.result, from - part.start, to - part.start);
  const text = String(r.value);
  if (from === 0 && to === text.length) return { r, from, to };
  const over = (r.parts ?? []).filter((p) => p.start < to && from < p.end);
  const e = over.length === 2 && over[0].start === from ? over[0] : undefined;
  const rest = over[1];
  if (
    e &&
    e.result.leaf.k !== 'literal' &&
    rest.result.leaf.k === 'literal' &&
    UNIT.test(text.slice(rest.start, to))
  ) {
    return { ...drillTo(e.result, 0, e.end - e.start), unit: true };
  }
  return { r, from, to };
};

// The source of characters [from, to) of what expression k of `t` produced.
type Leaf = {
  source: TraceSource;
  sharedBy?: string[];
  editable: Editable;
};

// The leaf as a source. `res` is its evaluation (none for a read the
// trace could not evaluate): a theme or const value counts as defined in
// values.ts only when the runtime value is the static one.
const sourceOf = (
  r: Read,
  res: EvalOk | undefined,
  via: ViaStep[],
  at: Text,
  meta: IndexMeta,
  extra: Partial<TraceSource>
): TraceSource => {
  const inner = onlyRead(r);
  const innerRes = inner && res?.parts?.find((p) => p.result.leaf === inner);
  const def = keyOfLeaf(r)
    ? res && defOf(r, res.value, meta)
    : inner && innerRes && defOf(inner, innerRes.result.value, meta);
  const staticValue = staticOf(r);
  const legacyKey = keyOfLeaf(r) ?? (inner && keyOfLeaf(inner));
  return {
    read: r.k,
    text: textOf(r, at) ?? rendered(r),
    file: at.file,
    line: r.loc.line,
    col: r.loc.col,
    start: r.loc.start,
    end: r.loc.end,
    ...(r.k === 'theme' ? { themePath: r.path } : {}),
    ...(r.k === 'prop' ? { prop: r.name } : {}),
    ...(def ? { def } : {}),
    ...(legacyKey ? { legacyKey } : {}),
    ...(staticValue !== undefined ? { staticValue } : {}),
    via,
    ...extra,
  };
};

const editableAt = (
  r: Read,
  at: Text,
  root: Template,
  part?: number
): Editable => {
  if (r.k === 'prop') return { no: `set by the caller via prop ${r.name}` };
  if (at.file !== root.file)
    return { no: `written in ${at.file}, outside the component's own file` };
  if (at.src === undefined) {
    return { no: 'the file is not readable at the index commit' };
  }
  const text = textOf(r, at);
  if (text === undefined) {
    return { no: 'the file at the index commit does not read as indexed' };
  }
  const line = lineAt(at.src, r.loc.start);
  return {
    file: at.file,
    start: r.loc.start,
    end: r.loc.end,
    context: 'js',
    ...(part !== undefined ? { part } : {}),
    lineText: line.text,
    line: line.line,
  };
};

const stuckLeaf = (
  s: EvalStuck,
  path: { template: Template; expr: number }[],
  at: Text,
  meta: IndexMeta
): Leaf => {
  const via = viaOf(path, s.via, s.at, at);
  const by =
    s.at.k === 'call'
      ? s.at.callee
      : s.at.k === 'unknown'
      ? s.at.text
      : rendered(s.at);
  return {
    source: sourceOf(s.at, undefined, via, at, meta, {
      ...(s.mapKey !== undefined ? { mapKey: s.mapKey } : {}),
    }),
    ...(s.sharedBy ? { sharedBy: s.sharedBy } : {}),
    editable: { no: `computed by ${firstLine(by)}` },
  };
};

// What expression k produced, read back from its value to the leaf.
const exprLeaf = (
  origin: Extract<Origin, { kind: 'expr' }>,
  from: number,
  to: number,
  context: Record<string, unknown>,
  at: Text,
  root: Template,
  meta: IndexMeta
): Leaf | { why: Why } => {
  const e = origin.template.exprs[origin.k];
  const path = [...origin.path, { template: origin.template, expr: origin.k }];
  const r = readEval(e.read, context, origin.value);
  if (!r.ok) {
    if (!r.leafPosition) return { why: 'unknown-read' };
    if (r.at.k === 'template') return { why: 'string-split' };
    return stuckLeaf(r, path, at, meta);
  }
  if (String(r.value) !== origin.value) return { why: 'read-mismatch' };
  const d = drillTo(r, from, to);
  const leafValue = String(d.r.value);
  const whole = d.from === 0 && d.to === leafValue.length;
  let part: number | undefined;
  if (!whole) {
    const parts = partsOf(leafValue);
    const index = parts.findIndex((p) => p.start === d.from && p.end === d.to);
    if (d.r.leaf.k !== 'literal' || index < 0) {
      const via = viaOf(path, d.r.via, d.r.leaf, at);
      return {
        source: sourceOf(d.r.leaf, d.r, via, at, meta, {}),
        editable: { no: 'the value is one piece of a longer value' },
      };
    }
    part = index;
  }
  const leaf = d.r.leaf;
  const unitAfter =
    d.unit && leaf.k !== 'prop'
      ? { no: 'its unit is written after it in the same string' }
      : undefined;
  const mapKey = d.r.mapKey ?? r.mapKey;
  const sharedBy = d.r.sharedBy ?? r.sharedBy;
  const via = viaOf(path, d.r.via, leaf, at);
  return {
    source: sourceOf(leaf, d.r, via, at, meta, {
      ...(mapKey !== undefined ? { mapKey } : {}),
    }),
    ...(sharedBy ? { sharedBy } : {}),
    editable: unitAfter ?? editableAt(leaf, at, root, part),
  };
};

// Characters [a, b) of a declaration's value as spans of their origins.
const sliceSpans = (
  spans: Span[],
  length: number,
  a: number,
  b: number
): Span[] | undefined => {
  let at = 0;
  const out: Span[] = [];
  for (const s of spans) {
    const n = s.to - s.from;
    const lo = Math.max(a, at);
    const hi = Math.min(b, at + n);
    if (lo < hi) {
      out.push({
        origin: s.origin,
        from: s.from + lo - at,
        to: s.from + hi - at,
      });
    }
    at += n;
  }
  return at === length ? out : undefined;
};

// ------------------------------------------------------------ the trace

export const traceStyled = async (
  el: Element,
  prop: string,
  value: string,
  m: MatchedRule,
  declared: Declared,
  deps: StyledDeps
): Promise<StyledTrace> => {
  const base: PropTrace = {
    prop,
    value,
    status: 'untraced',
    rule: ruleInfo(m),
  };
  const fail = (why: Why, extra: Partial<PropTrace> = {}, root?: Template) => ({
    trace: { ...base, why, ...extra },
    ...(root ? { root } : {}),
  });

  // 1. The owner, its template, its CSS with origins.
  const g = generatedClasses(el.ownerDocument);
  const name = ownerClass(originalPart(m.rule.selectorText, m.part), g);
  // A rule scoped by no component's class is a global style's
  // (createGlobalStyle): global CSS, as a stylesheet's rule is.
  if (!name) return { trace: { ...base, status: 'global' } };
  const element = ownerElement(el, name);
  if (!element) return fail('no-owner');
  const run = await runFor(element, name, deps);
  if (!run.ok) return fail(run.why);
  const root = run.alignment.template;
  const { canon, meta, client } = deps;

  // 2. The parsed rule, and its last declaration that sets the longhand.
  const rule = parsedRuleOf(m, run.rules, canon, el.ownerDocument.defaultView);
  if (!rule) return fail('selector', {}, root);
  const decl = [...rule.decls]
    .reverse()
    .find(
      (d: ParsedDecl) =>
        d.important === declared.important &&
        !!canon.longhands(d.prop, d.value)?.has(prop)
    );
  if (!decl) return fail('parse', {}, root);

  const head = decl.propOrigins[0];
  if (!head) return fail('parse', {}, root);
  const t = head.origin.template;
  let line: number;
  if (head.origin.kind === 'quasi') {
    const indexed = indexDeclAt(t, head.origin.k, head.from);
    if (!indexed) return fail('parse', {}, root);
    line = indexed.loc.line;
  } else {
    line = t.exprs[head.origin.k].loc.line;
  }
  const declInfo: NonNullable<PropTrace['decl']> = {
    template: t.id,
    file: t.file,
    line,
    ...(t.name ? { name: t.name } : {}),
    storyFrame: isStoryFrame(t.file),
  };

  // 3. The declaration's value is the CSSOM's, in the browser's own form:
  // the longhand's, or the shorthand's when the CSSOM holds the shorthand
  // only (a var() pending substitution leaves the longhands empty).
  const mine = canon.longhands(decl.prop, decl.value)?.get(prop);
  const verified =
    declared.prop === prop
      ? mine === declared.value
      : decl.prop === declared.prop &&
        canon.value(decl.prop, decl.value) === declared.value;
  if (!verified) return fail('read-mismatch', { decl: declInfo }, root);
  const traced: PropTrace = { ...base, status: 'traced', decl: declInfo };
  const done = (extra: Partial<PropTrace>) => ({
    trace: { ...traced, ...extra },
    root,
  });

  // 4. The characters that set the longhand: the whole value, or its part.
  let a = 0;
  let b = decl.value.length;
  if (decl.prop !== prop) {
    const p = shorthandPart(canon, decl.prop, decl.value, prop, mine ?? '');
    if (!p) return done({ editable: { no: `one part of ${decl.prop}` } });
    a = p.start;
    b = p.end;
  }
  const spans = sliceSpans(decl.valueOrigins, decl.value.length, a, b);
  if (!spans || !spans.length) return fail('parse', { decl: declInfo }, root);
  const origins = [...new Set(spans.map((s) => s.origin))];
  const exprs = origins.filter((o) => o.kind === 'expr');

  // 5. The leaf.
  const textAt = async (template: Template): Promise<Text> => ({
    file: template.file,
    src: await client.source(template.file),
  });

  if (
    origins.length === 1 &&
    spans.length === 1 &&
    origins[0].kind === 'quasi'
  ) {
    const o = origins[0];
    const at = await textAt(o.template);
    const place =
      at.src && quasiRange(at.src, o.template, o.k, spans[0].from, spans[0].to);
    if (!at.src || !place) {
      return done({
        editable: {
          no: at.src
            ? 'the file at the index commit does not read as indexed'
            : 'the file is not readable at the index commit',
        },
      });
    }
    const pos = lineAt(at.src, place.start);
    const text = at.src.slice(place.start, place.end);
    const via = [
      ...o.path.map(({ template, expr }) => ({
        text: `\${${template.exprs[expr].text}}`,
        file: template.file,
        line: template.exprs[expr].loc.line,
      })),
      { text: firstLine(text), file: at.file, line: pos.line },
    ];
    const source: TraceSource = {
      read: 'literal',
      text,
      file: at.file,
      line: pos.line,
      col: pos.col,
      start: place.start,
      end: place.end,
      via,
    };
    const editable: Editable =
      at.file !== root.file
        ? { no: `written in ${at.file}, outside the component's own file` }
        : place.escaped
        ? { no: 'written with escapes' }
        : {
            file: at.file,
            start: place.start,
            end: place.end,
            context: 'template',
            lineText: pos.text,
            line: pos.line,
          };
    return done({ source, editable });
  }

  if (exprs.length === 1) {
    const o = exprs[0] as Extract<Origin, { kind: 'expr' }>;
    const own = spans.filter((s) => s.origin === o);
    if (own.length !== 1) {
      return done({ editable: { no: 'built from several pieces' } });
    }
    const at = await textAt(o.template);
    const leaf = exprLeaf(
      o,
      own[0].from,
      own[0].to,
      run.owner.context,
      at,
      root,
      meta
    );
    if ('why' in leaf) return fail(leaf.why, { decl: declInfo }, root);
    const built = origins.length > 1;
    return done({
      source: leaf.source,
      ...(leaf.sharedBy ? { sharedBy: leaf.sharedBy } : {}),
      editable: built
        ? { no: `built in the template at line ${declInfo.line}` }
        : leaf.editable,
    });
  }

  return done({
    editable: { no: 'built from several expressions' },
  });
};
