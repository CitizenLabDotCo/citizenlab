/*
 * The CSS declarations of a style template, from its cooked quasis alone,
 * with each interpolation as a hole `${n}`. A small parser in the manner of
 * stylis 3 (what styled-components 5 runs on the joined text):
 *
 * - `/* *\/` comments are dropped outside strings, and `//` line comments
 *   outside strings and parentheses (so `url(//cdn)` stays), as stylis 3 does;
 * - blocks open on `{` and close on `}`, declarations end on `;` (a lone `;`
 *   is skipped), all outside strings and parentheses;
 * - the property is the text before the first `:` at depth 0, the value the
 *   rest, without a trailing `!important`;
 * - selectors and at-rules are kept as a nesting path, as written (holes as
 *   `${n}`, whitespace collapsed); `&` is not resolved here.
 *
 * A hole that stands as a statement of its own (only whitespace before it in
 * the statement, and nothing but an optional `;` after it on its line) is a
 * declaration with `prop: '${n}'` and no value: its CSS is only known at run
 * time (a mixin, a nested css`` or a conditional declaration such as
 * Button/index.tsx:424). Any other declaration whose property contains a hole
 * keeps it in `prop` the same way. That is the flag.
 */
import { Lines } from './loc';
import { Decl, Loc } from './schema';

/** A place in a template: an offset in cooked quasi k, or the edge of hole n. */
export type Place =
  | { quasi: number; offset: number }
  | { hole: number; end: boolean };

/** Maps a range of the template (from, to) to a source Loc. */
export type Locate = (from: Place, to: Place) => Loc;

const MARK = '\u0000';
const HOLE_RE = /\u0000(\d+)\u0000/g;

type Joined = {
  text: string;
  quasiStart: number[];
  holeStart: number[];
  holeEnd: number[];
};

const join = (quasis: string[]): Joined => {
  const j: Joined = { text: '', quasiStart: [], holeStart: [], holeEnd: [] };
  quasis.forEach((q, k) => {
    j.quasiStart.push(j.text.length);
    j.text += q;
    if (k < quasis.length - 1) {
      j.holeStart.push(j.text.length);
      j.text += `${MARK}${k}${MARK}`;
      j.holeEnd.push(j.text.length);
    }
  });
  return j;
};

// The place of joined offset i: a start, or (end = true) an exclusive end.
const placeOf = (j: Joined, i: number, end: boolean): Place => {
  for (let n = 0; n < j.holeStart.length; n++) {
    if (end ? i === j.holeEnd[n] : i === j.holeStart[n]) {
      return { hole: n, end };
    }
    if (i > j.holeStart[n] && i < j.holeEnd[n]) return { hole: n, end };
  }
  let k = 0;
  while (k + 1 < j.quasiStart.length && j.quasiStart[k + 1] <= i) k++;
  return { quasi: k, offset: i - j.quasiStart[k] };
};

/**
 * The default Locate: positions in the template's text as written with
 * `${n}` for each hole, from offset 0 (for tests and callers without a file).
 */
export const textLocate = (quasis: string[]): Locate => {
  const starts: number[] = [];
  const holes: [number, number][] = [];
  let text = '';
  quasis.forEach((q, k) => {
    starts.push(text.length);
    text += q;
    if (k < quasis.length - 1) {
      const at = text.length;
      text += `\${${k}}`;
      holes.push([at, text.length]);
    }
  });
  const lines = new Lines(text);
  const offset = (p: Place) =>
    'hole' in p ? holes[p.hole][p.end ? 1 : 0] : starts[p.quasi] + p.offset;
  return (from, to) => lines.loc(offset(from), offset(to));
};

/** `text` with comments replaced by spaces (newlines kept), same length. */
export const blankComments = (text: string): string => {
  const out = text.split('');
  const blank = (from: number, to: number) => {
    for (let i = from; i < to; i++) if (out[i] !== '\n') out[i] = ' ';
  };
  let quote = '';
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === '/' && text[i + 1] === '*') {
      const close = text.indexOf('*/', i + 2);
      const end = close < 0 ? text.length : close + 2;
      blank(i, end);
      i = end - 1;
    } else if (c === '/' && text[i + 1] === '/' && depth === 0) {
      const nl = text.indexOf('\n', i);
      const end = nl < 0 ? text.length : nl;
      blank(i, end);
      i = end - 1;
    } else if (c === '(') depth++;
    else if (c === ')' && depth > 0) depth--;
  }
  return out.join('');
};

// Holes as `${n}`, whitespace collapsed.
const render = (s: string) =>
  s.replace(HOLE_RE, '${$1}').replace(/\s+/g, ' ').trim();

// The index of the first `:` at depth 0 outside strings, or -1.
const colonAt = (s: string): number => {
  let quote = '';
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')' && depth > 0) depth--;
    else if (c === ':' && depth === 0) return i;
  }
  return -1;
};

// Static text and hole indexes in order, always starting and ending with text.
const valueParts = (s: string): (string | number)[] => {
  const out: (string | number)[] = [];
  let last = 0;
  s.replace(HOLE_RE, (m, n: string, at: number) => {
    out.push(s.slice(last, at), Number(n));
    last = at + m.length;
    return m;
  });
  out.push(s.slice(last));
  return out;
};

// After a hole ending at j: the offset past `[ \t]*;?[ \t]*` when the line
// ends there, else -1.
const restOfLine = (s: string, j: number): number => {
  let k = j;
  while (s[k] === ' ' || s[k] === '\t') k++;
  if (s[k] === ';') {
    k++;
    while (s[k] === ' ' || s[k] === '\t') k++;
  }
  return k >= s.length || s[k] === '\n' || s[k] === '\r' ? k : -1;
};

/**
 * The declarations of a template, in source order. `locate` maps template
 * places to source Locs (default: textLocate).
 */
export const declsOf = (
  quasis: string[],
  locate: Locate = textLocate(quasis)
): Decl[] => {
  // A quasi holding the marker itself cannot be told from a hole.
  if (quasis.some((q) => q.includes(MARK))) return [];
  const j = join(quasis);
  const s = blankComments(j.text);
  const decls: Decl[] = [];
  const selectors: string[] = [];
  const atRules: string[] = [];
  const stack: ('selector' | 'atRule')[] = [];

  const push = (
    prop: string,
    value: (string | number)[],
    from: number,
    to: number,
    important = false
  ) =>
    decls.push({
      prop,
      selectors: [...selectors],
      atRules: [...atRules],
      loc: locate(placeOf(j, from, false), placeOf(j, to, true)),
      value,
      important,
    });

  const flush = (a: number, b: number) => {
    const raw = s.slice(a, b);
    const body = raw.trim();
    // Empty (a lone `;`), or an at-rule statement such as @import.
    if (!body || body[0] === '@') return;
    const from = a + (raw.length - raw.trimStart().length);
    const to = a + raw.trimEnd().length;
    const colon = colonAt(body);
    if (colon < 0) {
      // Text with no property: only kept when a hole may make it CSS.
      if (body.includes(MARK)) push(render(body), [], from, to);
      return;
    }
    const prop = render(body.slice(0, colon));
    if (!prop) return;
    let value = body.slice(colon + 1);
    const important = /!\s*important\s*$/i.test(value);
    if (important) value = value.replace(/!\s*important\s*$/i, '');
    push(
      prop.startsWith('--') ? prop : prop.toLowerCase(),
      valueParts(value.trim()),
      from,
      to,
      important
    );
  };

  let start = 0;
  let quote = '';
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === '(') depth++;
    else if (c === ')' && depth > 0) depth--;
    if (depth > 0) continue;
    if (c === MARK) {
      const close = s.indexOf(MARK, i + 1);
      if (s.slice(start, i).trim() === '') {
        const after = restOfLine(s, close + 1);
        if (after >= 0) {
          push(`\${${s.slice(i + 1, close)}}`, [], i, close + 1);
          start = after;
          i = after - 1;
          continue;
        }
      }
      i = close;
    } else if (c === '{') {
      const header = render(s.slice(start, i));
      if (header.startsWith('@')) {
        atRules.push(header);
        stack.push('atRule');
      } else {
        selectors.push(header);
        stack.push('selector');
      }
      start = i + 1;
    } else if (c === ';') {
      flush(start, i);
      start = i + 1;
    } else if (c === '}') {
      flush(start, i);
      const top = stack.pop();
      if (top === 'atRule') atRules.pop();
      else if (top === 'selector') selectors.pop();
      start = i + 1;
    }
  }
  flush(start, s.length);
  return decls;
};
