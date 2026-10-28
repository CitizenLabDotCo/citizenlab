// A token where the code does colour maths on the value. polished's colour
// functions parse their colour argument and throw on a var() ("Couldn't
// parse the color string"), so writing a token there breaks the component:
// the primary Button's fill (Button/index.tsx:146) is darkened at line 283
// for its hover, so var(--gv-color-tenant-primary) at line 146 would throw.
import { readEval, Context } from './readEval';
import type { Read, Template } from './types';

// polished's functions that read a colour.
export const COLOUR_FNS = new Set([
  'adjustHue',
  'complement',
  'darken',
  'desaturate',
  'getContrast',
  'getLuminance',
  'grayscale',
  'invert',
  'lighten',
  'meetsContrastGuidelines',
  'mix',
  'opacify',
  'parseToHsl',
  'parseToRgb',
  'readableColor',
  'rgba',
  'saturate',
  'setHue',
  'setLightness',
  'setSaturation',
  'shade',
  'tint',
  'toColorString',
  'transparentize',
]);

type Call = Extract<Read, { k: 'call' }>;

export type Code = { file: string; start: number; end: number };

export type ColourMath = { callee: string; line: number };

// 'polished.darken' -> 'darken'
const isColourFn = (callee: string) =>
  COLOUR_FNS.has(callee.slice(callee.lastIndexOf('.') + 1));

const visit = (r: unknown, fn: (n: Read) => void) => {
  if (!r || typeof r !== 'object') return;
  const n = r as Read;
  if (typeof n.k === 'string' && n.loc) fn(n);
  for (const v of Object.values(r)) {
    if (v && typeof v === 'object') visit(v, fn);
  }
};

const isAt = (n: Read, c: { start: number; end: number }) =>
  n.loc.start === c.start && n.loc.end === c.end;

// The colour calls of `read` with the code in their arguments.
const callsOn = (read: Read, c: Code): Call[] => {
  const out: Call[] = [];
  visit(read, (n) => {
    if (n.k !== 'call' || !isColourFn(n.callee)) return;
    let hit = false;
    visit(n.args, (a) => {
      if (isAt(a, c)) hit = true;
    });
    if (hit) out.push(n);
  });
  return out;
};

const said = (n: Call): ColourMath => ({
  callee: n.callee,
  line: n.loc.line,
});

// The read with every colour call off the code as the colour it returns: a
// non-empty string, so an `||` stops at it as it does when the code runs.
const opaque = (r: unknown, c: Code): unknown => {
  if (Array.isArray(r)) return r.map((x) => opaque(x, c));
  if (!r || typeof r !== 'object') return r;
  const n = r as Read;
  if (n.k === 'call' && isColourFn(n.callee) && !callsOn(n, c).length) {
    return { k: 'literal', value: '#000000', loc: n.loc };
  }
  return Object.fromEntries(
    Object.entries(r).map(([k, v]) => [k, opaque(v, c)])
  );
};

/**
 * The colour call a token at the code would break, or undefined. In `own`
 * (the owner's templates, which run with `context`) a call counts when this
 * render reaches it, or may: the read stops at it, or at something it can't
 * evaluate before it. In `others` (the file's other templates, whose context
 * is not known here) every call counts.
 */
export const colourMathOn = (
  c: Code,
  own: Template[],
  others: Template[],
  context: Context
): ColourMath | undefined => {
  const mine = (ts: Template[]) => ts.filter((t) => t.file === c.file);
  let unsure: Call | undefined;
  for (const t of mine(own)) {
    for (const e of t.exprs) {
      const calls = callsOn(e.read, c);
      if (!calls.length) continue;
      const r = readEval(opaque(e.read, c) as Read, context);
      if (r.ok) continue;
      const at = r.at;
      const hit = calls.find((n) => isAt(n, at.loc));
      if (hit) return said(hit);
      unsure ??= calls[0];
    }
  }
  if (unsure) return said(unsure);
  for (const t of mine(others)) {
    for (const e of t.exprs) {
      const [n] = callsOn(e.read, c);
      if (n) return said(n);
    }
  }
  return undefined;
};

export const colourMathWords = (m: ColourMath) =>
  `${m.callee} at line ${m.line} works out another colour from it`;
