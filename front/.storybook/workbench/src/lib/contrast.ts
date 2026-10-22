// Colour contrast (WCAG 2.x) and the resolver that turns the token CSS into
// concrete values per mode, with the session's overrides applied the way the
// browser applies them (an override on the root replaces the definition in
// both modes, and every var() that reads it follows).
import type { Mode } from '@ds/tokens/tokens';

import { parseColour } from './overrides';

type Rgba = [number, number, number, number];

// ---------------------------------------------------------------- WCAG

const channel = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};

const luminance = ([r, g, b]: Rgba) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

// `top` drawn over an opaque `bottom`.
const over = (top: Rgba, bottom: Rgba): Rgba => {
  const a = top[3];
  return [
    top[0] * a + bottom[0] * (1 - a),
    top[1] * a + bottom[1] * (1 - a),
    top[2] * a + bottom[2] * (1 - a),
    1,
  ];
};

const WHITE: Rgba = [255, 255, 255, 1];

// Contrast ratio of text `fg` on `bg` (hex or rgb()/rgba()). A translucent
// background is drawn over white, translucent text over the background.
// Truncated to two decimals, so 4.499 reads 4.49 and fails 4.5. NaN when a
// colour cannot be read.
export const ratio = (fg: string, bg: string): number => {
  const f = parseColour(fg);
  const b = parseColour(bg);
  if (!f || !b) return NaN;
  const back = b[3] < 1 ? over(b, WHITE) : b;
  const front = f[3] < 1 ? over(f, back) : f;
  const [l1, l2] = [luminance(front), luminance(back)];
  const r = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return Math.floor(r * 100 + 1e-9) / 100;
};

// WCAG 2.2 levels: AA 4.5 (3 for large text), AAA 7 (4.5 for large text).
export const passes = (r: number, { large }: { large: boolean }) => ({
  aa: r >= (large ? 3 : 4.5),
  aaa: r >= (large ? 4.5 : 7),
});

// ---------------------------------------------------------------- token CSS

export type ModeDefs = Record<Mode, Record<string, string>>;

const declarations = (block: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/(--gv-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim();
  }
  return out;
};

const blockOf = (css: string, selector: string): string => {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) return '';
  const end = css.indexOf('}', start);
  return css.slice(start, end === -1 ? undefined : end);
};

// The raw definitions of tokens.css: `:root` is today, and redesign is today
// with the `[data-gv-mode="redesign"]` block on top.
export const parseTokenCss = (css: string): ModeDefs => {
  const today = declarations(blockOf(css, ':root'));
  const redesign = {
    ...today,
    ...declarations(blockOf(css, '[data-gv-mode="redesign"]')),
  };
  return { today, redesign };
};

// Index of the `)` that closes the `(` at `open`, or -1.
const closing = (s: string, open: number) => {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '(') depth++;
    if (s[i] === ')' && --depth === 0) return i;
  }
  return -1;
};

// Replaces every var() with its value in `defs` (or its fallback when the
// token is not defined). A cycle or a missing token without fallback gives
// an empty string, as the browser's "invalid at computed time".
const substitute = (
  value: string,
  defs: Record<string, string>,
  seen: string[]
): string => {
  let out = '';
  let i = 0;
  for (;;) {
    const at = value.indexOf('var(', i);
    if (at === -1) return out + value.slice(i);
    const end = closing(value, at + 3);
    if (end === -1) return out + value.slice(i);
    out += value.slice(i, at);
    const inner = value.slice(at + 4, end);
    const comma = inner.indexOf(',');
    const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma === -1 ? undefined : inner.slice(comma + 1).trim();
    if (name in defs && !seen.includes(name)) {
      out += substitute(defs[name], defs, [...seen, name]);
    } else if (fallback !== undefined) {
      out += substitute(fallback, defs, seen);
    }
    i = end + 1;
  }
};

const splitArgs = (s: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const c of s) {
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (c === ',' && depth === 0) {
      parts.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  parts.push(cur.trim());
  return parts;
};

const toRgbaString = ([r, g, b, a]: Rgba) => {
  const n = (x: number) => Math.round(x);
  return a >= 1
    ? `rgb(${n(r)}, ${n(g)}, ${n(b)})`
    : `rgba(${n(r)}, ${n(g)}, ${n(b)}, ${Math.round(a * 1000) / 1000})`;
};

const readColour = (value: string): Rgba | null => {
  const v = value.trim();
  if (/^transparent$/i.test(v)) return [0, 0, 0, 0];
  const mix = /^color-mix\(\s*in\s+[a-z]+\s*,(.*)\)$/i.exec(v);
  if (!mix) return parseColour(v);
  const args = splitArgs(mix[1]);
  if (args.length !== 2) return null;
  const parts = args.map((a) => {
    const m = /^(.*?)(?:\s+(\d+(?:\.\d+)?)%)?$/.exec(a.trim());
    return { colour: readColour(m?.[1] ?? ''), pct: m?.[2] };
  });
  if (!parts[0].colour || !parts[1].colour) return null;
  let p1 = parts[0].pct === undefined ? undefined : Number(parts[0].pct) / 100;
  let p2 = parts[1].pct === undefined ? undefined : Number(parts[1].pct) / 100;
  if (p1 === undefined && p2 === undefined) p1 = p2 = 0.5;
  if (p1 === undefined) p1 = 1 - (p2 as number);
  if (p2 === undefined) p2 = 1 - p1;
  const sum = p1 + p2;
  if (sum <= 0) return null;
  const [a, b] = [parts[0].colour, parts[1].colour];
  const [w1, w2] = [p1 / sum, p2 / sum];
  // Premultiplied sRGB interpolation, so mixing with transparent keeps the
  // colour and scales its alpha (exact for that case, close for others).
  const alpha = a[3] * w1 + b[3] * w2;
  const mixC = (i: number) =>
    alpha === 0 ? 0 : (a[i] * a[3] * w1 + b[i] * b[3] * w2) / alpha;
  const scale = Math.min(1, sum);
  return [mixC(0), mixC(1), mixC(2), alpha * scale];
};

// A concrete colour for contrast maths: color-mix() and transparent become
// rgb()/rgba(), anything already readable is returned as is, else null.
export const toConcreteColour = (value: string): string | null => {
  if (parseColour(value)) return value.trim();
  const rgba = readColour(value);
  return rgba ? toRgbaString(rgba) : null;
};

export type Resolved = Record<Mode, Record<string, string>>;

// Every token's value per mode with var() chains followed, tenant slots
// taking their default fallbacks, and `overrides` replacing definitions.
export const resolveTokens = (
  defs: ModeDefs,
  overrides: Record<string, string | undefined> = {}
): Resolved => {
  const one = (mode: Mode) => {
    const merged: Record<string, string> = { ...defs[mode] };
    for (const [k, v] of Object.entries(overrides)) {
      if (typeof v === 'string') merged[k] = v;
    }
    const out: Record<string, string> = {};
    for (const name of Object.keys(merged)) {
      out[name] = substitute(merged[name], merged, [name]);
    }
    return out;
  };
  return { today: one('today'), redesign: one('redesign') };
};

// ---------------------------------------------------------------- pairs

export type PairCheck = {
  ratio: number;
  aa: boolean;
  aaLarge: boolean;
  // Ratio without the session's overrides, for comparison.
  baseRatio: number;
  // An override made a pair that passed fail (normal or large text).
  broken: boolean;
};

export const checkPair = (
  text: string,
  background: string,
  base: Record<string, string>,
  current: Record<string, string>
): PairCheck => {
  const r = (values: Record<string, string>) => {
    const fg = toConcreteColour(values[text] ?? '');
    const bg = toConcreteColour(values[background] ?? '');
    return fg && bg ? ratio(fg, bg) : NaN;
  };
  const now = r(current);
  const before = r(base);
  const n = passes(now, { large: false });
  const l = passes(now, { large: true });
  const bn = passes(before, { large: false });
  const bl = passes(before, { large: true });
  return {
    ratio: now,
    aa: n.aa,
    aaLarge: l.aa,
    baseRatio: before,
    broken: (bn.aa && !n.aa) || (bl.aa && !l.aa),
  };
};
