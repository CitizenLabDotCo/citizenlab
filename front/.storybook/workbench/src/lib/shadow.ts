// A box-shadow value as the layers Figma's shadow editor shows: offset,
// blur, spread, a colour and its opacity, inner or drop. Only what those
// fields can say parses: px (or bare 0) lengths and one literal colour per
// layer. Anything else (var(), rem, a named colour) reads as null and the
// value stays a text field.
import { parseColour } from './overrides';

export type ShadowLayer = {
  inset: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  // #rrggbb, lower case.
  color: string;
  // Opacity, 0 to 100.
  alpha: number;
};

const LENGTH = /^(-?(?:\d+\.?\d*|\.\d+))(px)?$/i;

// Splits at `sep` outside parentheses; null when they do not balance.
const splitTop = (value: string, sep: RegExp): string[] | null => {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const c of value) {
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (depth < 0) return null;
    if (depth === 0 && sep.test(c)) {
      parts.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  if (depth !== 0) return null;
  parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
};

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0');

// Opacity to one decimal of a percent: 0.06 is 6, 0.125 is 12.5.
const percent = (a: number) => Math.round(a * 1000) / 10;

const parseLayer = (text: string): ShadowLayer | null => {
  const parts = splitTop(text, /\s/);
  if (!parts) return null;
  let inset = false;
  let color: string | undefined;
  // A keyword or colour came after the first length.
  let split = false;
  const lengths: number[] = [];
  for (const p of parts) {
    if (/^inset$/i.test(p)) {
      if (inset) return null;
      inset = true;
      split = lengths.length > 0;
      continue;
    }
    const length = LENGTH.exec(p);
    if (length) {
      // A bare number other than 0 is not a CSS length.
      if (!length[2] && Number(length[1]) !== 0) return null;
      // The lengths of a layer come in one run.
      if (split) return null;
      lengths.push(Number(length[1]));
      continue;
    }
    if (color !== undefined) return null;
    color = p;
    split = lengths.length > 0;
  }
  if (lengths.length < 2 || lengths.length > 4 || color === undefined) {
    return null;
  }
  const rgba = parseColour(color);
  if (!rgba) return null;
  const [x, y, blur = 0, spread = 0] = lengths;
  if (blur < 0) return null;
  return {
    inset,
    x,
    y,
    blur,
    spread,
    color: `#${rgba.slice(0, 3).map(hex2).join('')}`,
    alpha: percent(rgba[3]),
  };
};

// The layers of a box-shadow, `none` as no layer; null when a layer has
// something the fields cannot show.
export const parseShadow = (value: string): ShadowLayer[] | null => {
  const v = value.trim();
  if (/^none$/i.test(v)) return [];
  const layers = splitTop(v, /,/);
  if (!layers || !layers.length) return null;
  const out: ShadowLayer[] = [];
  for (const l of layers) {
    const layer = parseLayer(l);
    if (!layer) return null;
    out.push(layer);
  }
  return out;
};

// 0 goes bare, as in the token sources, so several layers stay short.
const px = (n: number) => {
  const v = Number(n.toFixed(2));
  return v === 0 ? '0' : `${v}px`;
};

// The colour as the token sources write it: hex when opaque, rgba() else.
export const formatColour = (color: string, alpha: number): string => {
  const rgba = parseColour(color);
  if (!rgba) return color;
  const a = Math.min(100, Math.max(0, alpha));
  if (a >= 100) return `#${rgba.slice(0, 3).map(hex2).join('')}`;
  const [r, g, b] = rgba.slice(0, 3).map(Math.round);
  return `rgba(${r},${g},${b},${Number((a / 100).toFixed(3))})`;
};

export const formatLayer = (l: ShadowLayer): string =>
  [
    l.inset ? 'inset' : '',
    px(l.x),
    px(l.y),
    px(Math.max(0, l.blur)),
    px(l.spread),
    formatColour(l.color, l.alpha),
  ]
    .filter(Boolean)
    .join(' ');

export const formatShadow = (layers: ShadowLayer[]): string =>
  layers.length ? layers.map(formatLayer).join(', ') : 'none';

// What "Add shadow" puts under the last layer: Figma's default drop shadow.
export const NEW_LAYER: ShadowLayer = {
  inset: false,
  x: 0,
  y: 4,
  blur: 4,
  spread: 0,
  color: '#000000',
  alpha: 25,
};
