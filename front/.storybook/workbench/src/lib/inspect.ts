// What the Design panel shows for the element selected on the canvas: its
// rendered properties grouped like Figma's inspector (Layout, Fill, Stroke,
// Radius, Text, Effects), and for each value the token it
// comes from. A value is `linked` when a style rule (or inline style) that
// applies to the element names the token for that property and the token
// resolves to the rendered value; `theme` when the value equals a city token
// (tenant colours, the font) the component reads through the styled theme,
// which hands it the same city value as a literal; `equal` when no rule names
// it but the rendered value equals a token (a hard-coded value that happens to
// match); otherwise it is a plain value.
import type { TokenName } from '@ds/tokens/tokens';

import type { IconName } from '../components/Icon';

import type { TokenMeta } from './data';

export type Link = 'linked' | 'theme' | 'equal';

// Tokens the styled theme also carries per city (theme.colors.tenant*,
// theme.fontFamily). A rendered value equal to one comes from the city.
export const isCityToken = (t: Pick<TokenMeta, 'legacy'>) =>
  (t.legacy ?? []).some((k) =>
    /^theme\.(colors\.tenant\w*|fontFamily)$/.test(k)
  );

export type InspectValue = {
  // The computed value as the browser writes it.
  raw: string;
  // How it reads in the panel (FDFDFD, 12, Public Sans).
  shown: string;
  token?: TokenName;
  link?: Link;
  // A colour to draw as a swatch.
  swatch?: string;
};

export type SnapKind = 'space' | 'radius' | 'color';

export type InspectRow = {
  id: string;
  // Words for aria-label and the Changes list ("Vertical", "Size").
  label: string;
  value: InspectValue;
  // The CSS longhands this row sets.
  props: string[];
  glyph: IconName;
  // Two per line.
  half: boolean;
  // W, H and the shadow are read-only.
  editable: boolean;
  // What a typed value snaps to.
  snap?: SnapKind;
};

export type InspectSection = {
  id: SectionId;
  label: string;
  rows: InspectRow[];
};

export type SectionId =
  | 'layout'
  | 'fill'
  | 'stroke'
  | 'radius'
  | 'text'
  | 'effects';

export type Inspection = {
  label: string;
  sections: InspectSection[];
};

// ------------------------------------------------------------ declarations

const VAR = /var\(\s*(--gv-[\w-]+)/g;

// `prop: value` pairs of a rule's cssText, in order. Splits on semicolons
// outside brackets, so a url(data:...;base64) stays whole.
export const declarations = (cssText: string): [string, string][] => {
  const out: [string, string][] = [];
  let depth = 0;
  let start = 0;
  const push = (part: string) => {
    const at = part.indexOf(':');
    if (at <= 0) return;
    const prop = part.slice(0, at).trim().toLowerCase();
    const value = part
      .slice(at + 1)
      .replace(/!important\s*$/i, '')
      .trim();
    if (prop && value) out.push([prop, value]);
  };
  for (let i = 0; i < cssText.length; i++) {
    const c = cssText[i];
    if (c === '(') depth++;
    else if (c === ')') depth = Math.max(0, depth - 1);
    else if (c === ';' && depth === 0) {
      push(cssText.slice(start, i));
      start = i + 1;
    }
  }
  push(cssText.slice(start));
  return out;
};

// The token names a value reads, in order, each once.
export const varsOf = (value: string): TokenName[] => [
  ...new Set([...value.matchAll(VAR)].map((m) => m[1] as TokenName)),
];

// The declarations that can set a longhand: itself and its shorthands.
export const FAMILY: Record<string, string[]> = {
  'background-color': ['background-color', 'background'],
  color: ['color'],
  fill: ['fill'],
  stroke: ['stroke'],
  'font-family': ['font-family', 'font'],
  'font-size': ['font-size', 'font'],
  'font-weight': ['font-weight', 'font'],
  'line-height': ['line-height', 'font'],
  'letter-spacing': ['letter-spacing'],
  'border-top-color': [
    'border-top-color',
    'border-color',
    'border-top',
    'border',
  ],
  'border-top-width': [
    'border-top-width',
    'border-width',
    'border-top',
    'border',
  ],
  'border-top-left-radius': ['border-top-left-radius', 'border-radius'],
  'border-top-right-radius': ['border-top-right-radius', 'border-radius'],
  'border-bottom-right-radius': ['border-bottom-right-radius', 'border-radius'],
  'border-bottom-left-radius': ['border-bottom-left-radius', 'border-radius'],
  'padding-top': [
    'padding-top',
    'padding',
    'padding-block',
    'padding-block-start',
  ],
  'padding-right': [
    'padding-right',
    'padding',
    'padding-inline',
    'padding-inline-end',
  ],
  'padding-bottom': [
    'padding-bottom',
    'padding',
    'padding-block',
    'padding-block-end',
  ],
  'padding-left': [
    'padding-left',
    'padding',
    'padding-inline',
    'padding-inline-start',
  ],
  'row-gap': ['row-gap', 'gap'],
  'column-gap': ['column-gap', 'gap'],
  'box-shadow': ['box-shadow'],
};

// Token names the declarations offer for a longhand, nearest last (a later
// declaration wins in the cascade, so its names are tried first).
export const candidatesFor = (
  longhand: string,
  decls: [string, string][]
): TokenName[] => {
  const family = FAMILY[longhand] ?? [longhand];
  const out: TokenName[] = [];
  for (let i = decls.length - 1; i >= 0; i--) {
    const [prop, value] = decls[i];
    if (!family.includes(prop)) continue;
    for (const name of varsOf(value)) if (!out.includes(name)) out.push(name);
  }
  return out;
};

// ------------------------------------------------------------ formatting

const RGB =
  /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/;

const hex2 = (n: number) =>
  Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

// rgb(253, 253, 253) -> FDFDFD; with alpha, FDFDFD 50%.
export const colourText = (value: string): string => {
  const m = RGB.exec(value.trim());
  if (!m) return value;
  const hex = hex2(+m[1]) + hex2(+m[2]) + hex2(+m[3]);
  if (m[4] === undefined) return hex;
  const a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  return a >= 1 ? hex : `${hex} ${Math.round(a * 100)}%`;
};

export const isTransparent = (value: string) => {
  const v = value.replace(/\s/g, '');
  return v === '' || v === 'transparent' || /^rgba\(\d+,\d+,\d+,0\)$/.test(v);
};

// 12px -> 12, 12.5px -> 12.5; anything else as it is.
export const pxText = (value: string): string => {
  const m = /^(-?[\d.]+)px$/.exec(value.trim());
  return m ? String(Math.round(parseFloat(m[1]) * 100) / 100) : value;
};

// The first family of a stack the document can draw, so a city face that is
// not installed reads as the one that renders instead.
export const shownFamily = (
  stack: string,
  available: (family: string) => boolean
): string => {
  const families = stack
    .split(',')
    .map((f) => f.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
  return families.find(available) ?? families[0] ?? stack;
};

// --gv-tenant-primary -> tenant-primary.
export const shortName = (name: string) => name.replace(/^--gv-/, '');

// ------------------------------------------------------------ reading

type RuleDecls = { selector: string; decls: [string, string][] };

const MAX_RULES = 20000;

// Style rules that name a --gv- token, with their declarations.
const tokenRules = (doc: Document): RuleDecls[] => {
  const out: RuleDecls[] = [];
  let seen = 0;
  const walk = (rules: CSSRuleList) => {
    for (let i = 0; i < rules.length && seen < MAX_RULES; i++) {
      seen++;
      const rule = rules[i] as CSSStyleRule & { cssRules?: CSSRuleList };
      if (rule.selectorText !== undefined) {
        const text = rule.style?.cssText ?? '';
        if (text.includes('var(--gv-')) {
          out.push({ selector: rule.selectorText, decls: declarations(text) });
        }
      }
      if (rule.cssRules) walk(rule.cssRules);
    }
  };
  for (const sheet of Array.from(doc.styleSheets)) {
    try {
      walk(sheet.cssRules);
    } catch {
      // A cross-origin sheet throws on cssRules; skip it.
    }
  }
  return out;
};

const matches = (el: Element, selector: string) => {
  try {
    return el.matches(selector);
  } catch {
    // A pseudo-element selector (::before) does not apply to the element.
    return false;
  }
};

// Declarations that apply to the element, in cascade order as far as source
// order goes (rules first, the inline style last).
const declsOf = (el: Element, rules: RuleDecls[]): [string, string][] => {
  const out: [string, string][] = [];
  for (const r of rules) if (matches(el, r.selector)) out.push(...r.decls);
  out.push(...declarations(el.getAttribute('style') ?? ''));
  return out;
};

// Which token categories may stand for a longhand.
const CATEGORY: Record<string, (t: TokenMeta) => boolean> = {
  'background-color': (t) => t.category === 'color',
  color: (t) => t.category === 'color',
  fill: (t) => t.category === 'color',
  stroke: (t) => t.category === 'color',
  'border-top-color': (t) => t.category === 'color',
  'border-color': (t) => t.category === 'color',
  'font-family': (t) => t.type === 'fontFamily',
  'letter-spacing': (t) => t.category === 'text' && /-ls$/.test(t.name),
  'font-size': (t) =>
    (t.category === 'font' || t.category === 'text') &&
    /(^--gv-fs-|-size$)/.test(t.name),
  'font-weight': (t) => t.category === 'text' && /-weight$/.test(t.name),
  'line-height': (t) => t.category === 'text' && /-lh$/.test(t.name),
  'border-top-left-radius': (t) => t.category === 'radius',
  'padding-top': (t) => t.category === 'space',
  'row-gap': (t) => t.category === 'space',
  'box-shadow': (t) => t.category === 'shadow',
};
CATEGORY['border-top-right-radius'] = CATEGORY['border-top-left-radius'];
CATEGORY['border-bottom-right-radius'] = CATEGORY['border-top-left-radius'];
CATEGORY['border-bottom-left-radius'] = CATEGORY['border-top-left-radius'];
CATEGORY['padding-right'] = CATEGORY['padding-top'];
CATEGORY['padding-bottom'] = CATEGORY['padding-top'];
CATEGORY['padding-left'] = CATEGORY['padding-top'];
CATEGORY['column-gap'] = CATEGORY['row-gap'];

// The token categories that fit a longhand (the picker's filter).
export const fitsProp = (prop: string) => CATEGORY[prop];

// Resolves tokens through a hidden probe the way the browser computes the
// property, cached per call of inspectElement.
const resolver = (doc: Document, parent: Element) => {
  const win = doc.defaultView;
  const probe = doc.createElement('div');
  probe.style.cssText =
    'position:absolute;visibility:hidden;pointer-events:none;border-style:solid';
  parent.appendChild(probe);
  const cache = new Map<string, string>();
  const resolve = (prop: string, name: string) => {
    const key = `${prop}|${name}`;
    let v = cache.get(key);
    if (v === undefined) {
      probe.style.setProperty(prop, `var(${name})`);
      v = win?.getComputedStyle(probe).getPropertyValue(prop).trim() ?? '';
      probe.style.removeProperty(prop);
      cache.set(key, v);
    }
    return v;
  };
  return { resolve, done: () => probe.remove() };
};

const NEUTRAL = new Set(['', 'none', 'normal', 'auto']);

// The rendered property of the element and its token.
const valueOf = (
  prop: string,
  cs: CSSStyleDeclaration,
  decls: [string, string][],
  meta: TokenMeta[],
  resolve: (prop: string, name: string) => string,
  format: (v: string) => string
): InspectValue => {
  const raw = cs.getPropertyValue(prop).trim();
  const out: InspectValue = { raw, shown: format(raw) };
  if (/color$|^fill$|^stroke$/.test(prop) && !isTransparent(raw)) {
    out.swatch = raw;
  }
  if (NEUTRAL.has(raw)) return out;
  for (const name of candidatesFor(prop, decls)) {
    if (resolve(prop, name) === raw)
      return { ...out, token: name, link: 'linked' };
  }
  const fits = CATEGORY[prop];
  if (!fits) return out;
  for (const t of meta) {
    if (t.deprecated || !fits(t) || !isCityToken(t)) continue;
    if (resolve(prop, t.name) === raw) {
      return { ...out, token: t.name as TokenName, link: 'theme' };
    }
  }
  // Scale tokens first: a value that equals both a role and a scale step
  // reads as the step.
  const ordered = [...meta].sort((a, b) => a.tier - b.tier);
  for (const t of ordered) {
    if (t.deprecated || !fits(t)) continue;
    if (resolve(prop, t.name) === raw) {
      return { ...out, token: t.name as TokenName, link: 'equal' };
    }
  }
  return out;
};

// ------------------------------------------------------------ rows

type Spec = Pick<InspectRow, 'props' | 'glyph' | 'half' | 'editable' | 'snap'>;

const P = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'];
const R = [
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
];
const SIDE_GLYPH: IconName[] = [
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
];

const SPECS: Record<string, Spec> = {
  w: { props: ['width'], glyph: 'width', half: true, editable: false },
  h: { props: ['height'], glyph: 'height', half: true, editable: false },
  padding: {
    props: P,
    glyph: 'padding',
    half: false,
    editable: true,
    snap: 'space',
  },
  'padding-v': {
    props: [P[0], P[2]],
    glyph: 'padding-y',
    half: true,
    editable: true,
    snap: 'space',
  },
  'padding-h': {
    props: [P[3], P[1]],
    glyph: 'padding-x',
    half: true,
    editable: true,
    snap: 'space',
  },
  gap: {
    props: ['row-gap', 'column-gap'],
    glyph: 'gap',
    half: false,
    editable: true,
    snap: 'space',
  },
  'gap-row': {
    props: ['row-gap'],
    glyph: 'gap-row',
    half: true,
    editable: true,
    snap: 'space',
  },
  'gap-col': {
    props: ['column-gap'],
    glyph: 'gap-col',
    half: true,
    editable: true,
    snap: 'space',
  },
  fill: {
    props: ['background-color'],
    glyph: 'fill',
    half: false,
    editable: true,
    snap: 'color',
  },
  'stroke-color': {
    props: ['border-color'],
    glyph: 'stroke',
    half: true,
    editable: true,
    snap: 'color',
  },
  'stroke-width': {
    props: ['border-width'],
    glyph: 'stroke-width',
    half: true,
    editable: true,
  },
  radius: {
    props: R,
    glyph: 'radius',
    half: false,
    editable: true,
    snap: 'radius',
  },
  'radius-v': {
    props: [R[0], R[2]],
    glyph: 'radius',
    half: true,
    editable: true,
    snap: 'radius',
  },
  'radius-h': {
    props: [R[1], R[3]],
    glyph: 'radius',
    half: true,
    editable: true,
    snap: 'radius',
  },
  family: {
    props: ['font-family'],
    glyph: 'text',
    half: false,
    editable: true,
  },
  size: {
    props: ['font-size'],
    glyph: 'font-size',
    half: true,
    editable: true,
  },
  weight: {
    props: ['font-weight'],
    glyph: 'font-weight',
    half: true,
    editable: true,
  },
  lh: {
    props: ['line-height'],
    glyph: 'line-height',
    half: true,
    editable: true,
  },
  ls: {
    props: ['letter-spacing'],
    glyph: 'letter-spacing',
    half: true,
    editable: true,
  },
  color: {
    props: ['color'],
    glyph: 'text',
    half: false,
    editable: true,
    snap: 'color',
  },
  // An icon's own paint (SVG fill and stroke).
  'icon-fill': {
    props: ['fill'],
    glyph: 'fill',
    half: false,
    editable: true,
    snap: 'color',
  },
  'icon-stroke': {
    props: ['stroke'],
    glyph: 'stroke',
    half: false,
    editable: true,
    snap: 'color',
  },
  shadow: {
    props: ['box-shadow'],
    glyph: 'shadow',
    half: false,
    editable: false,
  },
};
for (let i = 0; i < 4; i++) {
  SPECS[`padding-${i}`] = {
    props: [P[i]],
    glyph: SIDE_GLYPH[i],
    half: true,
    editable: true,
    snap: 'space',
  };
  SPECS[`radius-${i}`] = {
    props: [R[i]],
    glyph: 'radius',
    half: true,
    editable: true,
    snap: 'radius',
  };
}

// What a row stands for: its longhands, glyph, width and edit kind.
export const rowSpec = (id: string): Spec =>
  SPECS[id] ?? { props: [], glyph: 'tokens', half: false, editable: false };

const row = (id: string, label: string, value: InspectValue): InspectRow => ({
  id,
  label,
  value,
  ...rowSpec(id),
});

// The four sides or corners as rows: one row when all four read the same,
// two when opposite sides pair up, four otherwise.
const sides = (
  id: string,
  values: InspectValue[],
  labels: [string, string, string, string],
  pairs: [string, string],
  whole: string
): InspectRow[] => {
  const same = (a: InspectValue, b: InspectValue) =>
    a.raw === b.raw && a.token === b.token;
  const [t, r, b, l] = values;
  if (same(t, r) && same(t, b) && same(t, l)) {
    return [row(id, whole, t)];
  }
  if (same(t, b) && same(l, r)) {
    return [row(`${id}-v`, pairs[0], t), row(`${id}-h`, pairs[1], l)];
  }
  return values.map((v, i) => row(`${id}-${i}`, labels[i], v));
};

// Figma shows a layer the properties of its kind: Text for an element
// that holds text of its own (a text node child, or a field people type
// in), never for a box of other elements or an icon.
export const holdsText = (el: Element) =>
  el.namespaceURI === 'http://www.w3.org/2000/svg'
    ? /^(text|tspan|textPath)$/.test(el.localName)
    : /^(input|textarea|select)$/.test(el.localName) ||
      [...el.childNodes].some(
        (n) => n.nodeType === 3 && !!n.textContent?.trim()
      );

// The panel's reading of one element. `available` says whether the
// document can draw a font family (document.fonts.check in the frame).
export const inspectElement = (
  el: Element,
  meta: TokenMeta[],
  available: (family: string) => boolean = () => true
): Inspection | null => {
  const doc = el.ownerDocument;
  const win = doc.defaultView;
  if (!win) return null;
  const cs = win.getComputedStyle(el);
  const decls = declsOf(el, tokenRules(doc));
  const { resolve, done } = resolver(doc, el.parentElement ?? doc.body);
  try {
    const v = (prop: string, format: (s: string) => string = pxText) =>
      valueOf(prop, cs, decls, meta, resolve, format);
    const sections: InspectSection[] = [];

    const rect = el.getBoundingClientRect();
    const sizeRow = (id: 'w' | 'h', n: number): InspectRow =>
      row(id, id === 'w' ? 'Width' : 'Height', {
        raw: `${n}px`,
        shown: String(Math.round(n)),
      });
    const layout: InspectRow[] = [
      sizeRow('w', rect.width),
      sizeRow('h', rect.height),
    ];
    const padding = sides(
      'padding',
      [
        v('padding-top'),
        v('padding-right'),
        v('padding-bottom'),
        v('padding-left'),
      ],
      ['Top', 'Right', 'Bottom', 'Left'],
      ['Vertical', 'Horizontal'],
      'Padding'
    );
    if (padding.some((r) => r.value.raw !== '0px')) layout.push(...padding);
    const display = cs.getPropertyValue('display');
    if (/flex|grid/.test(display)) {
      const rowGap = v('row-gap');
      const colGap = v('column-gap');
      const gaps =
        rowGap.raw === colGap.raw
          ? [row('gap', 'Gap', rowGap)]
          : [row('gap-row', 'Rows', rowGap), row('gap-col', 'Columns', colGap)];
      if (
        gaps.some((g) => !NEUTRAL.has(g.value.raw) && g.value.raw !== '0px')
      ) {
        layout.push(...gaps);
      }
    }
    sections.push({ id: 'layout', label: 'Layout', rows: layout });

    // An icon paints with its fill and stroke, never with the text colour,
    // so it shows those and no Text section.
    const icon =
      el.namespaceURI === 'http://www.w3.org/2000/svg' &&
      !/^(text|tspan|textPath)$/.test(el.localName);
    const paint = (prop: string) => {
      const p = v(prop, colourText);
      return p.raw === 'none' || isTransparent(p.raw) ? undefined : p;
    };
    const iconFill = icon ? paint('fill') : undefined;
    const iconStroke = icon ? paint('stroke') : undefined;

    const fill = v('background-color', colourText);
    const fills: InspectRow[] = [];
    if (!isTransparent(fill.raw)) {
      fills.push(row('fill', iconFill ? 'Background' : 'Fill', fill));
    }
    if (iconFill) fills.push(row('icon-fill', 'Fill', iconFill));
    if (fills.length) sections.push({ id: 'fill', label: 'Fill', rows: fills });

    const width = parseFloat(cs.getPropertyValue('border-top-width')) || 0;
    const strokes: InspectRow[] = [];
    if (
      width > 0 &&
      cs.getPropertyValue('border-top-style') !== 'none' &&
      !isTransparent(cs.getPropertyValue('border-top-color'))
    ) {
      strokes.push(
        row('stroke-color', 'Colour', v('border-top-color', colourText)),
        row('stroke-width', 'Width', v('border-top-width'))
      );
    }
    if (iconStroke) strokes.push(row('icon-stroke', 'Colour', iconStroke));
    if (strokes.length) {
      sections.push({ id: 'stroke', label: 'Stroke', rows: strokes });
    }

    const radius = sides(
      'radius',
      [
        v('border-top-left-radius'),
        v('border-top-right-radius'),
        v('border-bottom-right-radius'),
        v('border-bottom-left-radius'),
      ],
      ['Top left', 'Top right', 'Bottom right', 'Bottom left'],
      ['Top left, bottom right', 'Top right, bottom left'],
      'Radius'
    );
    if (radius.some((r) => r.value.raw !== '0px')) {
      sections.push({ id: 'radius', label: 'Radius', rows: radius });
    }

    const family = v('font-family', (s) => shownFamily(s, available));
    // A family token holds a stack, which the rendered value starts with
    // (the rule may add fallbacks after it).
    if (!family.token) {
      const named = candidatesFor('font-family', decls);
      const stacks = meta.filter((t) => t.type === 'fontFamily');
      const starts = (name: string) => {
        const stack = resolve('font-family', name);
        return !!stack && family.raw.startsWith(stack);
      };
      const linked = named.find(starts);
      const equal = linked ? undefined : stacks.find((t) => starts(t.name));
      const city = linked
        ? undefined
        : stacks.find((t) => isCityToken(t) && starts(t.name));
      if (linked) Object.assign(family, { token: linked, link: 'linked' });
      else if (city) Object.assign(family, { token: city.name, link: 'theme' });
      else if (equal)
        Object.assign(family, { token: equal.name, link: 'equal' });
    }
    const textRows = [
      row('family', 'Font', family),
      row('weight', 'Weight', v('font-weight')),
      row('size', 'Size', v('font-size')),
      row('lh', 'Line height', v('line-height')),
    ];
    const ls = v('letter-spacing');
    if (!NEUTRAL.has(ls.raw)) textRows.push(row('ls', 'Letter spacing', ls));
    textRows.push(row('color', 'Colour', v('color', colourText)));
    if (holdsText(el)) {
      sections.push({ id: 'text', label: 'Text', rows: textRows });
    }

    const shadow = v('box-shadow', (s) => (s === 'none' ? 'None' : 'Shadow'));
    if (shadow.raw !== 'none') {
      sections.push({
        id: 'effects',
        label: 'Effects',
        rows: [row('shadow', 'Drop shadow', shadow)],
      });
    }

    return { label: labelOf(el), sections };
  } finally {
    done();
  }
};

// ------------------------------------------------------------ layers

// A short name for an element, like a layer name: its role or tag, and
// its label or text when it has one (button "Save changes").
export const labelOf = (el: Element): string => {
  const tag = el.tagName.toLowerCase();
  const kind = el.getAttribute('role') ?? tag;
  const name =
    el.getAttribute('aria-label') ??
    el.getAttribute('data-testid') ??
    el.textContent?.replace(/\s+/g, ' ').trim();
  const short = name && name.length > 28 ? `${name.slice(0, 27)}…` : name;
  return short ? `${kind} "${short}"` : kind;
};

const BOX = '[data-gv-story-box]';

// What a story selects first: the outer element of the component, through
// wrappers that draw nothing and hold a single element.
export const defaultTarget = (doc: Document): Element | null => {
  const box = doc.querySelector(BOX);
  let el = box?.firstElementChild ?? null;
  const win = doc.defaultView;
  while (el && el.children.length === 1 && win) {
    const cs = win.getComputedStyle(el);
    const draws =
      !isTransparent(cs.backgroundColor) ||
      parseFloat(cs.borderTopWidth) > 0 ||
      (!!cs.boxShadow && cs.boxShadow !== 'none');
    if (draws) break;
    el = el.firstElementChild;
  }
  return el;
};

// The element's place under the story box as child indexes, so the
// selection can be found again after the story renders anew.
export const pathOf = (el: Element): number[] | null => {
  const path: number[] = [];
  let at: Element | null = el;
  while (at && !at.matches(BOX)) {
    const parent: Element | null = at.parentElement;
    if (!parent) return null;
    path.unshift(Array.prototype.indexOf.call(parent.children, at));
    at = parent;
  }
  return at ? path : null;
};

export const atPath = (doc: Document, path: number[]): Element | null => {
  let at: Element | null = doc.querySelector(BOX);
  for (const i of path) {
    at = at?.children[i] ?? null;
    if (!at) return null;
  }
  return at;
};

// The parent of a selection, short of the story box.
export const parentTarget = (el: Element): Element | null => {
  const parent = el.parentElement;
  return parent && !parent.matches(BOX) ? parent : null;
};
