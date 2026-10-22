// Token overrides of the workbench session: snapping, the share-link codec
// and the hook that keeps them in state, localStorage and the URL hash.
//
// Share links come from untrusted sources, so everything read from the hash
// or localStorage goes through `validateOverrides`. Any bad entry rejects the
// whole payload: the result is no overrides plus a reason the shell shows.
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Mode, TokenName } from '@ds/tokens/tokens';

import type { TokenMeta } from './data';

export type Overrides = Partial<Record<TokenName, string>>;

export type SnapResult = {
  value: string;
  // The value sits on the scale or palette (the input may have been moved).
  snapped: boolean;
  // No scale or palette value is close enough; the edit is kept as typed and
  // flagged.
  custom: boolean;
  // The scale or palette token the value now equals.
  to?: TokenName;
};

// ---------------------------------------------------------------- colour

type Rgba = [number, number, number, number];
type Lab = [number, number, number];

// Largest CIELAB distance (Delta E 1976) at which a colour still snaps to
// the palette. Around 2 is a just noticeable difference; 6 catches the
// near-misses of a colour picker without merging distinct palette steps.
export const SNAP_DELTA_E = 6;

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB =
  /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,/]+([\d.]+)(%?))?\s*\)$/i;

export const parseColour = (input: string): Rgba | null => {
  const value = input.trim();
  const hex = HEX.exec(value);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const rgb = RGB.exec(value);
  if (rgb) {
    const [r, g, b] = [rgb[1], rgb[2], rgb[3]].map(Number);
    if (r > 255 || g > 255 || b > 255) return null;
    let a = rgb[4] === undefined ? 1 : Number(rgb[4]);
    if (rgb[5] === '%') a /= 100;
    if (!(a >= 0 && a <= 1)) return null;
    return [r, g, b, a];
  }
  return null;
};

// sRGB (D65) to CIELAB.
export const toLab = ([r, g, b]: Rgba | Lab): Lab => {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const x = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
  const y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B;
  const z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / 1.08883;
  const f = (t: number) =>
    t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t) / 116 + 16 / 116;
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};

export const deltaE76 = (a: Lab, b: Lab) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

type Swatch = { name: TokenName; value: string; lab: Lab };

// Every literal opaque colour of the token set in a mode: the tier-1
// primitives first, then tier-2 colours that carry their own literal value
// (for example --gv-text-heading-strong, #1E1E1E, which has no primitive).
export const palette = (meta: TokenMeta[], mode: Mode = 'today'): Swatch[] =>
  meta
    .filter((t) => t.category === 'color')
    .sort((a, b) => a.tier - b.tier)
    .flatMap((t) => {
      const rgba = parseColour(t.values[mode]);
      if (!rgba || rgba[3] !== 1) return [];
      return [
        { name: t.name as TokenName, value: t.values[mode], lab: toLab(rgba) },
      ];
    });

// The nearest swatch, or null when the closest one is further than
// `threshold`. Ties keep the earlier swatch (tier 1 wins).
export const nearestColour = (
  value: string,
  swatches: Swatch[],
  threshold = SNAP_DELTA_E
): { swatch: Swatch; distance: number } | null => {
  const rgba = parseColour(value);
  if (!rgba || rgba[3] !== 1) return null;
  const lab = toLab(rgba);
  let best: { swatch: Swatch; distance: number } | null = null;
  for (const swatch of swatches) {
    const distance = deltaE76(lab, swatch.lab);
    if (!best || distance < best.distance) best = { swatch, distance };
  }
  return best && best.distance <= threshold ? best : null;
};

// ---------------------------------------------------------------- snapping

const PX = /^(\d+(?:\.\d+)?)(px)?$/;

const toPx = (value: string): number | null => {
  const m = PX.exec(value.trim());
  if (!m) return null;
  // A bare number is only a length when it is 0.
  if (!m[2] && Number(m[1]) !== 0) return null;
  return Number(m[1]);
};

const SCALED = ['space', 'radius'];

// Moves an edited value onto the token system: space and radius to the
// nearest tier-1 step of their category, colours to the nearest palette
// colour within SNAP_DELTA_E. Other categories pass through untouched.
export const snap = (
  name: TokenName,
  value: string,
  meta: TokenMeta[],
  mode: Mode = 'today'
): SnapResult => {
  const token = meta.find((t) => t.name === name);
  const typed = value.trim();
  if (!token) return { value: typed, snapped: false, custom: true };

  if (SCALED.includes(token.category)) {
    const px = toPx(typed);
    const steps = meta
      .filter((t) => t.category === token.category && t.tier === 1)
      .map((t) => ({
        name: t.name as TokenName,
        value: t.values[mode],
        px: toPx(t.values[mode]),
      }))
      .filter((s): s is typeof s & { px: number } => s.px !== null);
    if (px === null || steps.length === 0) {
      return { value: typed, snapped: false, custom: true };
    }
    let best = steps[0];
    for (const s of steps) {
      if (Math.abs(s.px - px) < Math.abs(best.px - px)) best = s;
    }
    return { value: best.value, snapped: true, custom: false, to: best.name };
  }

  if (token.category === 'color') {
    const hit = nearestColour(typed, palette(meta, mode));
    if (!hit) return { value: typed, snapped: false, custom: true };
    return {
      value: hit.swatch.value,
      snapped: true,
      custom: false,
      to: hit.swatch.name,
    };
  }

  return { value: typed, snapped: false, custom: false };
};

// ---------------------------------------------------------------- codec

// Caps on what a share link may carry.
export const MAX_PAYLOAD_BYTES = 8 * 1024;
export const MAX_VALUE_LENGTH = 64;

// Second guard, after the allowlist below: fragments that could load a
// resource or break out of a declaration. A backslash is refused because CSS
// escapes (`u\72l(`) would hide the other fragments.
const FORBIDDEN = [
  /url\(/i,
  /image-set/i,
  /image\(/i,
  /cross-fade/i,
  /src\(/i,
  /expression/i,
  /;/,
  /\}/,
  /</,
  /\\/,
  /\/\*/,
  /!/,
];
// Printable ASCII only.
const PRINTABLE = /^[\x20-\x7e]*$/;

// ---------------------------------------------------------------- allowlist

// What a value may look like, by the token's `type` in tokens.meta.json.
type ValueKind =
  | 'colour'
  | 'length'
  | 'number'
  | 'time'
  | 'shadow'
  | 'border'
  | 'family';

const LENGTH = /^(0|-?\d+(\.\d+)?(px|rem|em|%))$/;
const NUMBER = /^\d+(\.\d+)?$/;
const TIME = /^\d+(\.\d+)?(ms|s)$/;
const HEX_COLOUR = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
// rgb()/rgba()/hsl()/hsla() with numeric arguments only.
const FN_COLOUR = /^(rgba?|hsla?)\(\s*(-?[\d.]+(%|deg)?[\s,/]*){3,4}\)$/i;
const NAMED_COLOUR = /^(transparent|currentcolor)$/i;
const COLOR_MIX = /^color-mix\(\s*in\s+(srgb|oklch|oklab|hsl)\s*,(.*)\)$/i;
const FAMILY_NAME = /^([A-Za-z0-9 -]+|'[A-Za-z0-9 -]+'|"[A-Za-z0-9 -]+")$/;
const BORDER_STYLE = /^(none|solid|dashed|dotted|double)$/i;
const VAR = /^var\(\s*(--gv-[a-z0-9-]+)\s*(?:,(.*))?\)$/;

// Splits at `sep` outside parentheses.
const splitTop = (value: string, sep: RegExp): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const c of value) {
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (depth < 0) return [];
    if (depth === 0 && sep.test(c)) {
      parts.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  if (depth !== 0) return [];
  parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
};

const isColour = (v: string): boolean => {
  if (HEX_COLOUR.test(v) || FN_COLOUR.test(v) || NAMED_COLOUR.test(v)) {
    return true;
  }
  const mix = COLOR_MIX.exec(v);
  if (!mix) return false;
  const args = splitTop(mix[2], /,/);
  return (
    args.length === 2 &&
    args.every((a) => {
      const [colour, pct, ...rest] = splitTop(a, /\s/);
      return (
        rest.length === 0 &&
        isColour(colour) &&
        (pct === undefined || /^\d+(\.\d+)?%$/.test(pct))
      );
    })
  );
};

// A comma list of layers, each made of lengths, colours and keywords.
const isLayers = (v: string, keyword: RegExp, layers: boolean): boolean => {
  if (/^none$/i.test(v)) return true;
  const list = layers ? splitTop(v, /,/) : [v];
  return (
    list.length > 0 &&
    list.every((layer) => {
      const parts = splitTop(layer, /\s/);
      return (
        parts.length > 0 &&
        parts.every((p) => LENGTH.test(p) || isColour(p) || keyword.test(p))
      );
    })
  );
};

const KIND_TESTS: Record<ValueKind, (v: string) => boolean> = {
  colour: isColour,
  length: (v) => LENGTH.test(v),
  number: (v) => NUMBER.test(v),
  time: (v) => TIME.test(v),
  shadow: (v) => isLayers(v, /^inset$/i, true),
  border: (v) => isLayers(v, BORDER_STYLE, false),
  family: (v) => {
    const names = v.split(',').map((n) => n.trim());
    return names.length > 0 && names.every((n) => FAMILY_NAME.test(n));
  },
};

const KIND_BY_TYPE: Record<string, ValueKind> = {
  color: 'colour',
  dimension: 'length',
  number: 'number',
  duration: 'time',
  shadow: 'shadow',
  border: 'border',
  fontFamily: 'family',
};

const KIND_BY_CATEGORY: Record<string, ValueKind> = {
  color: 'colour',
  space: 'length',
  radius: 'length',
  shadow: 'shadow',
  motion: 'time',
};

export const kindOf = (t: TokenMeta): ValueKind | undefined =>
  (t.type && KIND_BY_TYPE[t.type]) || KIND_BY_CATEGORY[t.category];

// True when `value` is a plain value of the token's kind, or a var() of a
// --gv- token with an optional fallback that itself passes.
export const isAllowedValue = (
  t: TokenMeta,
  value: string,
  depth = 0
): boolean => {
  const v = value.trim();
  if (!v || depth > 2) return false;
  const ref = VAR.exec(v);
  if (ref) {
    return ref[2] === undefined || isAllowedValue(t, ref[2], depth + 1);
  }
  const kind = kindOf(t);
  return !!kind && KIND_TESTS[kind](v);
};

const toBase64Url = (text: string) => {
  // UTF-8 bytes as a binary string, then base64url without padding.
  const bytes = encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16))
  );
  return btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (payload: string) => {
  const binary = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return decodeURIComponent(
    [...binary]
      .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
  );
};

export const encodeOverrides = (o: Overrides): string =>
  toBase64Url(JSON.stringify(o));

export type ParseResult = { overrides: Overrides; error?: string };

// Checks an already decoded value (from a share link or localStorage).
export const validateOverrides = (
  input: unknown,
  meta: TokenMeta[]
): ParseResult => {
  const fail = (error: string): ParseResult => ({ overrides: {}, error });
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return fail('the edits are not a list of tokens');
  }
  const known = new Map(meta.map((t) => [t.name, t]));
  const overrides: Overrides = {};
  for (const [key, value] of Object.entries(input)) {
    const token = key.startsWith('--gv-') ? known.get(key) : undefined;
    if (!token) return fail(`unknown token ${key.slice(0, 40)}`);
    if (typeof value !== 'string') return fail(`${key} is not text`);
    if (value.length > MAX_VALUE_LENGTH) return fail(`${key} is too long`);
    if (
      !PRINTABLE.test(value) ||
      FORBIDDEN.some((re) => re.test(value)) ||
      !isAllowedValue(token, value)
    ) {
      return fail(`${key} has a value that is not allowed`);
    }
    overrides[key as TokenName] = value;
  }
  return { overrides };
};

// The overrides payload of a hash: the `o` parameter after `?`
// (`#/components/x?o=...`). Any other hash (a route, an anchor) has none.
export const payloadOfHash = (hash: string): string | null => {
  const q = hash.indexOf('?');
  if (q === -1) return null;
  return new URLSearchParams(hash.slice(q + 1)).get('o') || null;
};

export const parseOverridesResult = (
  hash: string,
  meta: TokenMeta[]
): ParseResult => {
  const payload = payloadOfHash(hash);
  if (!payload) return { overrides: {} };
  // base64 grows by 4/3; anything longer cannot decode under the cap.
  if (payload.length > Math.ceil((MAX_PAYLOAD_BYTES * 4) / 3) + 4) {
    return { overrides: {}, error: 'the link is too long' };
  }
  if (!/^[A-Za-z0-9_-]+$/.test(payload)) {
    return { overrides: {}, error: 'the link is damaged' };
  }
  let decoded: string;
  try {
    decoded = fromBase64Url(payload);
  } catch {
    return { overrides: {}, error: 'the link is damaged' };
  }
  if (decoded.length > MAX_PAYLOAD_BYTES) {
    return { overrides: {}, error: 'the link is too long' };
  }
  let json: unknown;
  try {
    json = JSON.parse(decoded);
  } catch {
    return { overrides: {}, error: 'the link is damaged' };
  }
  return validateOverrides(json, meta);
};

export const parseOverrides = (hash: string, meta: TokenMeta[]): Overrides =>
  parseOverridesResult(hash, meta).overrides;

// The hash with its `o` parameter set to the overrides (removed when empty).
export const withOverrides = (hash: string, o: Overrides): string => {
  const q = hash.indexOf('?');
  const path = q === -1 ? hash : hash.slice(0, q);
  const params = new URLSearchParams(q === -1 ? '' : hash.slice(q + 1));
  if (Object.keys(o).length) params.set('o', encodeOverrides(o));
  else params.delete('o');
  const query = params.toString();
  return query ? `${path}?${query}` : path;
};

// ---------------------------------------------------------------- hook

export const STORAGE_KEY = 'gv-overrides';

const readStorage = (meta: TokenMeta[]): ParseResult => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { overrides: {} };
    return validateOverrides(JSON.parse(raw), meta);
  } catch {
    return { overrides: {} };
  }
};

const writeStorage = (o: Overrides) => {
  try {
    if (Object.keys(o).length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage may be full or blocked; the hash still carries the edits.
  }
};

// A valid share link in the hash replaces the stored session. A link that
// fails validation changes nothing (the stored session stays) and sets
// `notice`. A tampered store is dropped quietly; it is this browser's own
// data.
const initial = (meta: TokenMeta[]): ParseResult => {
  const stored = readStorage(meta).overrides;
  if (!payloadOfHash(window.location.hash)) return { overrides: stored };
  const link = parseOverridesResult(window.location.hash, meta);
  return link.error ? { overrides: stored, error: link.error } : link;
};

const notApplied = (error: string) =>
  `This share link was not applied: ${error}.`;

export const useOverrides = (meta: TokenMeta[]) => {
  const [start] = useState(() => initial(meta));
  const [overrides, setOverrides] = useState<Overrides>(start.overrides);
  const [notice, setNotice] = useState(
    start.error ? notApplied(start.error) : undefined
  );
  const current = useRef(overrides);
  current.current = overrides;

  // State to storage and hash. replaceState does not fire hashchange.
  useEffect(() => {
    writeStorage(overrides);
    const hash = window.location.hash;
    const next = withOverrides(hash, overrides);
    if (next !== hash) window.history.replaceState(null, '', next || '#');
  }, [overrides]);

  // A pasted share link, or a navigation that dropped the parameter.
  useEffect(() => {
    const onChange = () => {
      const hash = window.location.hash;
      if (!payloadOfHash(hash)) {
        const next = withOverrides(hash, current.current);
        if (next !== hash) window.history.replaceState(null, '', next);
        return;
      }
      const result = parseOverridesResult(hash, meta);
      if (result.error) {
        // Keep the session; the storage effect puts it back in the hash.
        setNotice(notApplied(result.error));
        const next = withOverrides(hash, current.current);
        if (next !== hash) window.history.replaceState(null, '', next);
        return;
      }
      setNotice(undefined);
      if (
        encodeOverrides(result.overrides) !== encodeOverrides(current.current)
      ) {
        setOverrides(result.overrides);
      }
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [meta]);

  const setOverride = useCallback((name: TokenName, value: string) => {
    setOverrides((o) => ({ ...o, [name]: value }));
  }, []);

  const reset = useCallback((name?: TokenName) => {
    setOverrides((o) => {
      if (!name) return {};
      const next = { ...o };
      delete next[name];
      return next;
    });
  }, []);

  const dismissNotice = useCallback(() => setNotice(undefined), []);

  return { overrides, setOverride, reset, notice, dismissNotice };
};
