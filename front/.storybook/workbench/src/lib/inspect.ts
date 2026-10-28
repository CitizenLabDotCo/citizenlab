// What the Design panel shows for the element selected on the canvas: its
// rendered properties grouped like Figma's inspector for its kind of layer
// (Layout, Appearance, Typography, Fill, Stroke, Effects, and the Selection
// colours of what it holds). Every value is the browser's computed one.
// Where a value comes from is not read here: lib/trace follows the rule that
// wins in the cascade back to the line of code that writes it, and a row
// shows a token only when that rule's value reads var(--gv-…). Nothing is
// matched by value.
import type { TokenName } from '@ds/tokens/tokens';

import type { IconName } from '../components/Icon';

import type { TokenMeta } from './data';

export type InspectValue = {
  // The computed value as the browser writes it.
  raw: string;
  // How it reads in the panel (FDFDFD, 12, Public Sans).
  shown: string;
  // The token the winning declaration reads (var(--gv-…)), from the trace,
  // or the one the session's edit attached.
  token?: TokenName;
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
  // A short list of values, drawn as a menu: [value, words].
  choices?: [string, string][];
  // Read-only, but a token can still be picked for it (the shadow).
  pickOnly?: boolean;
};

// What a section's "+" paints on an element that has none of it (Figma's
// empty Fill, Stroke and Effects).
export type SectionAdd = {
  rowId: string;
  // Words for the button ("Add fill").
  label: string;
  // What the element renders today, and what the add paints.
  from: string;
  value: string;
};

export type InspectSection = {
  id: SectionId;
  label: string;
  rows: InspectRow[];
  add?: SectionAdd;
};

export type SectionId =
  | 'layout'
  | 'appearance'
  | 'typography'
  | 'fill'
  | 'stroke'
  | 'effects';

// Figma's kinds of layer: a frame (box), text, a vector (icon), an image,
// and a field people type in.
export type LayerKind = 'box' | 'text' | 'icon' | 'image' | 'field';

// One colour the selection paints with, on one element and row.
export type ColourUse = { el: Element; rowId: string; value: InspectValue };
export type ColourGroup = {
  key: string;
  value: InspectValue;
  uses: ColourUse[];
};

export type Inspection = {
  label: string;
  kind: LayerKind;
  sections: InspectSection[];
  // Every colour of the selection and what it holds, each once; empty for
  // a layer that holds no other.
  colours: ColourGroup[];
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
const SIDES = ['top', 'right', 'bottom', 'left'] as const;
for (const side of SIDES) {
  for (const part of ['color', 'width']) {
    FAMILY[`border-${side}-${part}`] = [
      `border-${side}-${part}`,
      `border-${part}`,
      `border-${side}`,
      'border',
    ];
  }
}

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
for (const side of SIDES) {
  CATEGORY[`border-${side}-color`] = CATEGORY['border-color'];
}

// The token categories that fit a longhand (the picker's filter).
export const fitsProp = (prop: string) => CATEGORY[prop];

const NEUTRAL = new Set(['', 'none', 'normal', 'auto']);

// The rendered property of the element, as the browser computes it.
const valueOf = (
  prop: string,
  cs: CSSStyleDeclaration,
  format: (v: string) => string
): InspectValue => {
  const raw = cs.getPropertyValue(prop).trim();
  const out: InspectValue = { raw, shown: format(raw) };
  if (/color$|^fill$|^stroke$/.test(prop) && !isTransparent(raw)) {
    out.swatch = raw;
  }
  return out;
};

// ------------------------------------------------------------ rows

type Spec = Pick<
  InspectRow,
  'props' | 'glyph' | 'half' | 'editable' | 'snap' | 'choices' | 'pickOnly'
>;

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
const SIDE_WORDS = ['Top', 'Right', 'Bottom', 'Left'] as const;

// The values a menu row offers, as Figma names them.
const CHOICES: Record<string, [string, string][]> = {
  direction: [
    ['row', 'Horizontal'],
    ['column', 'Vertical'],
    ['row-reverse', 'Horizontal, reversed'],
    ['column-reverse', 'Vertical, reversed'],
  ],
  wrap: [
    ['nowrap', 'No wrap'],
    ['wrap', 'Wrap'],
    ['wrap-reverse', 'Wrap, reversed'],
  ],
  align: [
    ['normal', 'Normal'],
    ['stretch', 'Stretch'],
    ['flex-start', 'Start'],
    ['center', 'Centre'],
    ['flex-end', 'End'],
    ['baseline', 'Baseline'],
  ],
  justify: [
    ['normal', 'Normal'],
    ['flex-start', 'Start'],
    ['center', 'Centre'],
    ['flex-end', 'End'],
    ['space-between', 'Space between'],
    ['space-around', 'Space around'],
    ['space-evenly', 'Space evenly'],
  ],
  'text-align': [
    ['start', 'Start'],
    ['left', 'Left'],
    ['center', 'Centre'],
    ['right', 'Right'],
    ['end', 'End'],
    ['justify', 'Justified'],
  ],
};

// A menu row's words for a value; a value the menu lacks reads as it is.
export const choiceText = (rowId: string, value: string) =>
  CHOICES[rowId]?.find(([v]) => v === value)?.[1] ?? value;

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
    props: SIDES.map((side) => `border-${side}-color`),
    glyph: 'stroke',
    half: true,
    editable: true,
    snap: 'color',
  },
  'stroke-width': {
    props: SIDES.map((side) => `border-${side}-width`),
    glyph: 'stroke-width',
    half: true,
    editable: true,
  },
  'stroke-width-v': {
    props: ['border-top-width', 'border-bottom-width'],
    glyph: 'stroke-width',
    half: true,
    editable: true,
  },
  'stroke-width-h': {
    props: ['border-left-width', 'border-right-width'],
    glyph: 'stroke-width',
    half: true,
    editable: true,
  },
  // The "+" of an empty Stroke: a whole border in one value.
  stroke: {
    props: ['border'],
    glyph: 'stroke',
    half: false,
    editable: true,
  },
  radius: {
    props: R,
    glyph: 'radius',
    half: true,
    editable: true,
    snap: 'radius',
  },
  opacity: {
    props: ['opacity'],
    glyph: 'opacity',
    half: true,
    editable: true,
  },
  direction: {
    props: ['flex-direction'],
    glyph: 'direction',
    half: true,
    editable: true,
  },
  wrap: { props: ['flex-wrap'], glyph: 'wrap', half: true, editable: true },
  align: { props: ['align-items'], glyph: 'align', half: true, editable: true },
  justify: {
    props: ['justify-content'],
    glyph: 'justify',
    half: true,
    editable: true,
  },
  'text-align': {
    props: ['text-align'],
    glyph: 'text-align',
    half: true,
    editable: true,
  },
  image: { props: [], glyph: 'image', half: false, editable: false },
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
    half: true,
    editable: true,
    snap: 'color',
  },
  'icon-stroke-width': {
    props: ['stroke-width'],
    glyph: 'stroke-width',
    half: true,
    editable: true,
  },
  shadow: {
    props: ['box-shadow'],
    glyph: 'shadow',
    half: false,
    editable: false,
    pickOnly: true,
  },
};
for (const [id, choices] of Object.entries(CHOICES)) {
  SPECS[id] = { ...SPECS[id], choices };
}
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
  SPECS[`stroke-color-${i}`] = {
    props: [`border-${SIDES[i]}-color`],
    glyph: 'stroke',
    half: true,
    editable: true,
    snap: 'color',
  };
  SPECS[`stroke-width-${i}`] = {
    props: [`border-${SIDES[i]}-width`],
    glyph: 'stroke-width',
    half: true,
    editable: true,
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

const SVG = 'http://www.w3.org/2000/svg';
const SVG_TEXT = /^(text|tspan|textPath)$/;
// The input types people type text in.
const TYPED =
  /^(|text|search|email|url|tel|password|number|date|datetime-local|month|week|time)$/;

// A form field people type in or pick a value from.
const isField = (el: Element) =>
  /^(textarea|select)$/.test(el.localName) ||
  (el.localName === 'input' &&
    TYPED.test((el.getAttribute('type') ?? '').toLowerCase()));

// Figma shows a layer the properties of its kind: Typography for an
// element that holds text of its own (a text node child, or a field people
// type in), never for a box of other elements or an icon.
export const holdsText = (el: Element) =>
  el.namespaceURI === SVG
    ? SVG_TEXT.test(el.localName)
    : isField(el) ||
      [...el.childNodes].some(
        (n) => n.nodeType === 3 && !!n.textContent?.trim()
      );

// Whether an element draws a box of its own around what it holds.
const drawsBox = (look: (prop: string) => string) =>
  !isTransparent(look('background-color')) ||
  !NEUTRAL.has(look('background-image')) ||
  !NEUTRAL.has(look('box-shadow')) ||
  P.some((p) => parseFloat(look(p)) > 0) ||
  SIDES.some(
    (side) =>
      parseFloat(look(`border-${side}-width`)) > 0 &&
      !/^(none|hidden|)$/.test(look(`border-${side}-style`))
  );

// The kind of layer an element is. Text is text of its own and nothing
// drawn around it; text in a box of its own (a badge, a button) is a box
// that holds text. `look` reads the element's computed style.
export const kindOf = (
  el: Element,
  look: (prop: string) => string
): LayerKind => {
  if (el.namespaceURI === SVG) {
    return SVG_TEXT.test(el.localName) ? 'text' : 'icon';
  }
  if (/^(img|picture|video|canvas)$/.test(el.localName)) return 'image';
  if (isField(el)) return 'field';
  if (holdsText(el) && el.children.length === 0 && !drawsBox(look)) {
    return 'text';
  }
  return 'box';
};

// What a click on the canvas selects: the whole icon for a click on one of
// its shapes, as Figma selects the top layer first; Enter goes inside.
export const layerOf = (el: Element): Element =>
  el.namespaceURI === SVG && el.localName !== 'svg'
    ? el.closest('svg') ?? el
    : el;

// A typed opacity is a percent, as in Figma (50, 50%); the CSS share it
// stands for (0.5), or undefined past 0 to 100.
export const opacityValue = (typed: string): string | undefined => {
  const m = /^(\d+(?:\.\d+)?|\.\d+)\s*%?$/.exec(typed.trim());
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  if (n > 100) return undefined;
  return String(Math.round(n * 10) / 1000);
};

export const opacityText = (raw: string) =>
  `${Math.round(parseFloat(raw) * 100)}%`;

const flatColour = (raw: string) => raw.replace(/\s+/g, '').toLowerCase();

// The selection's colours, each once (Figma's Selection colors): a colour
// bound to a token by its token, any other by its value, most used first.
export const groupColours = (uses: ColourUse[]): ColourGroup[] => {
  const groups = new Map<string, ColourGroup>();
  for (const u of uses) {
    const key = u.value.token
      ? `token:${u.value.token}`
      : `value:${flatColour(u.value.raw)}`;
    const g = groups.get(key);
    if (g) g.uses.push(u);
    else groups.set(key, { key, value: u.value, uses: [u] });
  }
  return [...groups.values()].sort((a, b) => b.uses.length - a.uses.length);
};

// Layers read for Selection colours, at most.
const MAX_LAYERS = 400;
// SVG elements that paint.
const SVG_PAINTS =
  /^(svg|g|path|circle|rect|ellipse|line|polyline|polygon|text|tspan|use)$/;

// The visible borders of an element: one colour row when they share it,
// one per side otherwise; the widths of all four as sides(), or of each
// visible side.
const borderRows = (
  v: (prop: string, format?: (s: string) => string) => InspectValue,
  look: (prop: string) => string
): InspectRow[] => {
  const on = [0, 1, 2, 3].filter(
    (i) =>
      parseFloat(look(`border-${SIDES[i]}-width`)) > 0 &&
      !/^(none|hidden)$/.test(look(`border-${SIDES[i]}-style`)) &&
      !isTransparent(look(`border-${SIDES[i]}-color`))
  );
  if (on.length === 0) return [];
  const colours = SIDES.map((side) => v(`border-${side}-color`, colourText));
  const widths = SIDES.map((side) => v(`border-${side}-width`));
  const same = (a: InspectValue, b: InspectValue) =>
    a.raw === b.raw && a.token === b.token;
  const out: InspectRow[] = [];
  if (on.every((i) => same(colours[i], colours[on[0]]))) {
    // The sides that draw: a hidden side's colour is not this one.
    out.push({
      ...row('stroke-color', 'Colour', colours[on[0]]),
      props: on.map((i) => `border-${SIDES[i]}-color`),
    });
  } else {
    for (const i of on) {
      out.push(row(`stroke-color-${i}`, `${SIDE_WORDS[i]} colour`, colours[i]));
    }
  }
  if (on.length === 4) {
    out.push(
      ...sides(
        'stroke-width',
        widths,
        ['Top width', 'Right width', 'Bottom width', 'Left width'],
        ['Vertical width', 'Horizontal width'],
        'Width'
      )
    );
  } else {
    for (const i of on) {
      out.push(row(`stroke-width-${i}`, `${SIDE_WORDS[i]} width`, widths[i]));
    }
  }
  return out;
};

// Figma's default looks for an added fill, stroke and shadow.
const ADDED = {
  fill: '#FFFFFF',
  paint: '#000000',
  stroke: '1px solid #000000',
  shadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
};

// The panel's reading of one element, by its kind of layer. `available`
// says whether the document can draw a font family (document.fonts.check
// in the frame).
export const inspectElement = (
  el: Element,
  available: (family: string) => boolean = () => true
): Inspection | null => {
  const doc = el.ownerDocument;
  const win = doc.defaultView;
  if (!win) return null;
  const cs = win.getComputedStyle(el);
  const v = (prop: string, format: (s: string) => string = pxText) =>
    valueOf(prop, cs, format);
  const look = (prop: string) => cs.getPropertyValue(prop).trim();
  const kind = kindOf(el, look);
  // A box, a field and an image are frames: radius, stroke, shadow.
  const framed = kind === 'box' || kind === 'field' || kind === 'image';
  const text =
    kind === 'text' || ((kind === 'box' || kind === 'field') && holdsText(el));
  const sections: InspectSection[] = [];

  // Layout: Figma's Auto layout for a flex or grid box (direction, size,
  // alignment, gap, padding), the size otherwise.
  const rect = el.getBoundingClientRect();
  const sizeRow = (id: 'w' | 'h', n: number): InspectRow =>
    row(id, id === 'w' ? 'Width' : 'Height', {
      raw: `${n}px`,
      shown: String(Math.round(n)),
    });
  const display = look('display');
  const flex = /flex/.test(display);
  const auto = flex || /grid/.test(display);
  const choice = (id: string) => (s: string) => choiceText(id, s);
  const layout: InspectRow[] = [];
  if (flex) {
    layout.push(
      row('direction', 'Direction', v('flex-direction', choice('direction'))),
      row('wrap', 'Wrap', v('flex-wrap', choice('wrap')))
    );
  }
  layout.push(sizeRow('w', rect.width), sizeRow('h', rect.height));
  if (flex) {
    layout.push(
      row('align', 'Align', v('align-items', choice('align'))),
      row('justify', 'Justify', v('justify-content', choice('justify')))
    );
  }
  if (auto) {
    const gapText = (s: string) => (s === 'normal' ? '0' : pxText(s));
    const rowGap = v('row-gap', gapText);
    const colGap = v('column-gap', gapText);
    layout.push(
      ...(rowGap.raw === colGap.raw
        ? [row('gap', 'Gap', rowGap)]
        : [row('gap-row', 'Rows', rowGap), row('gap-col', 'Columns', colGap)])
    );
  }
  if (framed) {
    const padding = sides(
      'padding',
      P.map((p) => v(p)),
      ['Top', 'Right', 'Bottom', 'Left'],
      ['Vertical', 'Horizontal'],
      'Padding'
    );
    if (auto || padding.some((r) => r.value.raw !== '0px')) {
      layout.push(...padding);
    }
  }
  sections.push({
    id: 'layout',
    label: auto ? 'Auto layout' : 'Layout',
    rows: layout,
  });

  // Appearance: opacity for every layer, the corner radius for a frame.
  const appearance = [row('opacity', 'Opacity', v('opacity', opacityText))];
  if (framed) {
    appearance.push(
      ...sides(
        'radius',
        R.map((r) => v(r)),
        ['Top left', 'Top right', 'Bottom right', 'Bottom left'],
        ['Top left, bottom right', 'Top right, bottom left'],
        'Radius'
      )
    );
  }
  sections.push({ id: 'appearance', label: 'Appearance', rows: appearance });

  // Typography, for a layer that holds text; its colour is a Fill.
  if (text) {
    const family = v('font-family', (s) => shownFamily(s, available));
    const type = [
      row('family', 'Font', family),
      row('weight', 'Weight', v('font-weight')),
      row('size', 'Size', v('font-size')),
      row('lh', 'Line height', v('line-height')),
    ];
    const ls = v('letter-spacing');
    if (!NEUTRAL.has(ls.raw)) type.push(row('ls', 'Letter spacing', ls));
    type.push(
      row('text-align', 'Align', v('text-align', choice('text-align')))
    );
    sections.push({ id: 'typography', label: 'Typography', rows: type });
  }

  // Fill: a text layer's is its colour; a frame's its background, and
  // the colour of its text when it holds some; an icon's its own paint.
  const paint = (prop: string) => {
    const p = v(prop, colourText);
    return p.raw === 'none' || isTransparent(p.raw) ? undefined : p;
  };
  const bg = v('background-color', colourText);
  const hasBg = !isTransparent(bg.raw);
  const fills: InspectRow[] = [];
  let addFill: SectionAdd | undefined;
  if (kind === 'text') {
    fills.push(row('color', 'Fill', v('color', colourText)));
  } else if (kind === 'icon') {
    const own = paint('fill');
    if (own) fills.push(row('icon-fill', 'Fill', own));
    else {
      addFill = {
        rowId: 'icon-fill',
        label: 'Add fill',
        from: look('fill'),
        value: ADDED.paint,
      };
    }
    if (hasBg) fills.push(row('fill', 'Background', bg));
  } else {
    if (kind === 'image') {
      fills.push(row('image', 'Image', { raw: 'image', shown: 'Image' }));
    }
    if (hasBg) {
      fills.push(
        row('fill', text || kind === 'image' ? 'Background' : 'Fill', bg)
      );
    } else if (kind !== 'image') {
      addFill = {
        rowId: 'fill',
        label: text ? 'Add background' : 'Add fill',
        from: bg.raw,
        value: ADDED.fill,
      };
    }
    if (text) fills.push(row('color', 'Text', v('color', colourText)));
  }
  sections.push({ id: 'fill', label: 'Fill', rows: fills, add: addFill });

  // Stroke: every side of a frame's border; an icon's own stroke.
  if (kind !== 'text') {
    const strokes = borderRows(v, look);
    let addStroke: SectionAdd | undefined;
    if (kind === 'icon') {
      const own = paint('stroke');
      if (own) {
        strokes.push(
          row('icon-stroke', 'Colour', own),
          row('icon-stroke-width', 'Width', v('stroke-width'))
        );
      } else if (strokes.length === 0) {
        addStroke = {
          rowId: 'icon-stroke',
          label: 'Add stroke',
          from: look('stroke'),
          value: ADDED.paint,
        };
      }
    } else if (strokes.length === 0) {
      addStroke = {
        rowId: 'stroke',
        label: 'Add stroke',
        from: look('border') || 'none',
        value: ADDED.stroke,
      };
    }
    sections.push({
      id: 'stroke',
      label: 'Stroke',
      rows: strokes,
      add: addStroke,
    });
  }

  // Effects: a frame's shadow, or a "+" for one.
  const shadow = v('box-shadow', (s) => (s === 'none' ? 'None' : 'Shadow'));
  if (shadow.raw !== 'none' || framed) {
    sections.push({
      id: 'effects',
      label: 'Effects',
      rows: shadow.raw !== 'none' ? [row('shadow', 'Drop shadow', shadow)] : [],
      add:
        shadow.raw === 'none'
          ? {
              rowId: 'shadow',
              label: 'Add shadow',
              from: 'none',
              value: ADDED.shadow,
            }
          : undefined,
    });
  }

  // Selection colours: the layer's own and those of what it holds. Text
  // of its own is a layer it holds, as a frame holds a text layer.
  const uses: ColourUse[] = [];
  if (el.children.length > 0 || (text && kind !== 'text')) {
    const all = [el, ...Array.from(el.querySelectorAll('*'))].slice(
      0,
      MAX_LAYERS
    );
    for (const e of all) {
      const c = e === el ? cs : win.getComputedStyle(e);
      if (c.display === 'none' || c.visibility === 'hidden') continue;
      const val = (prop: string) => valueOf(prop, c, colourText);
      const at = (rowId: string, value: InspectValue) =>
        uses.push({ el: e, rowId, value });
      if (e.namespaceURI === SVG) {
        if (!SVG_PAINTS.test(e.localName)) continue;
        // A shape painted as its parent is (an icon's paths) is the
        // parent's colour, not one more.
        const parent =
          e.localName === 'svg' || !e.parentElement
            ? undefined
            : win.getComputedStyle(e.parentElement);
        for (const [prop, rowId] of [
          ['fill', 'icon-fill'],
          ['stroke', 'icon-stroke'],
        ]) {
          const raw = c.getPropertyValue(prop).trim();
          if (raw === 'none' || isTransparent(raw)) continue;
          if (parent && parent.getPropertyValue(prop).trim() === raw) continue;
          at(rowId, val(prop));
        }
        continue;
      }
      if (!isTransparent(c.backgroundColor)) {
        at('fill', val('background-color'));
      }
      if (holdsText(e)) at('color', val('color'));
      const elLook = (prop: string) => c.getPropertyValue(prop).trim();
      for (const r of borderRows((prop) => val(prop), elLook)) {
        if (r.snap === 'color') at(r.id, r.value);
      }
    }
  }
  const colours = uses.some((u) => u.el !== el || u.rowId === 'color')
    ? groupColours(uses)
    : [];

  return { label: labelOf(el), kind, sections, colours };
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

// Hidden from sight: display none, or polished's hideVisually (the
// Toggle's checkbox for screen readers: absolute, 1px, clipped).
const isHidden = (cs: CSSStyleDeclaration) =>
  cs.display === 'none' ||
  (cs.position === 'absolute' &&
    (/^rect\(0/.test(cs.clip) || (cs.width === '1px' && cs.height === '1px')));

// What a story selects first: the outer element of the component, through
// wrappers that draw nothing and hold a single element that shows.
export const defaultTarget = (doc: Document): Element | null => {
  const box = doc.querySelector(BOX);
  let el = box?.firstElementChild ?? null;
  const win = doc.defaultView;
  const shown = (e: Element) =>
    [...e.children].filter((c) => !win || !isHidden(win.getComputedStyle(c)));
  while (el && shown(el).length === 1 && win) {
    const cs = win.getComputedStyle(el);
    const draws =
      !isTransparent(cs.backgroundColor) ||
      parseFloat(cs.borderTopWidth) > 0 ||
      (!!cs.boxShadow && cs.boxShadow !== 'none');
    if (draws) break;
    el = shown(el)[0];
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
