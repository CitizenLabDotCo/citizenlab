// Parses the CSS text a componentStyle produced the way styled-components
// 5.3.9 hands it to stylis 3 (@emotion/stylis 0.8.5), keeping for every
// character the piece it came from: a quasi of an indexed template or what
// one of its expressions produced. Its rules come out in stylis's order (a
// block's own declarations, then its nested blocks), so the CSSOM rules
// styled-components inserted line up with them. Selectors and conditions
// stay as stylis writes them; the trace compares them only through the
// frame's canonicaliser.
import { splitSelectors } from './cascade';
import type { Decl, Piece, Span, Template } from './types';

export type ParsedDecl = {
  // Lowercase; a custom property as written.
  prop: string;
  value: string;
  important: boolean;
  propOrigins: Span[];
  valueOrigins: Span[];
  // Where the property starts in the parsed text (document order).
  at: number;
};

export type ParsedRule = {
  selector: string;
  atRules: string[];
  decls: ParsedDecl[];
};

// styled-components' own pass before stylis (`ie=/^\s*\/\/.*$/gm`, in
// `m(e,s,i,a)`): whole-line comments.
const LINE_COMMENT = /^\s*\/\/.*$/gm;

// Grouping at-rules: their content is rules under the current selector.
// A layer adds nothing the CSSOM walk records (cascade.ts).
const GROUPING = new Set([
  'media',
  'supports',
  'document',
  '-moz-document',
  'container',
  'scope',
  'starting-style',
  'layer',
]);

// `ae=[":","[",".","#"]`
const SELF_FOLLOWERS = [':', '[', '.', '#'];

// The self-reference plugin 5.3.9 adds to stylis (inside `ce`): in a
// block's first selector, `.name` anywhere but at the start becomes the
// component id, unless it is at the start followed by `:[.#`, or the
// selector repeats `.name` (`&&`).
const selfReference = (selector: string, name: string, componentId: string) => {
  const self = `.${name}`;
  if (!(selector.lastIndexOf(self) > 0)) return selector;
  const each = new RegExp(`\\${self}\\b`, 'g');
  const twice = new RegExp(`(\\${self}\\b){2,}`);
  return selector.replace(each, (m: string, offset: number, s: string) =>
    (offset === 0 && SELF_FOLLOWERS.indexOf(s[self.length]) !== -1) ||
    twice.test(s)
      ? m
      : `.${componentId}`
  );
};

// stylis 3 nesting: each child selector, for each parent, with `&` as the
// parent and a descendant combinator when it has none.
export const compose = (parents: string[], children: string[]): string[] => {
  const out: string[] = [];
  for (const c of children) {
    for (const p of parents) {
      out.push(c.includes('&') ? c.replace(/&/g, p) : `${p} ${c}`);
    }
  }
  return out;
};

const isSpace = (c: string | undefined) =>
  c === ' ' || c === '\n' || c === '\t' || c === '\r' || c === '\f';

export const parseCss = (
  pieces: Piece[],
  name: string,
  componentId: string
): ParsedRule[] => {
  const joined = pieces.map((p) => p.text).join('');
  const pieceAt = new Int32Array(joined.length);
  const offsetAt = new Int32Array(joined.length);
  let pos = 0;
  pieces.forEach((p, n) => {
    for (let j = 0; j < p.text.length; j++, pos++) {
      pieceAt[pos] = n;
      offsetAt[pos] = p.at + j;
    }
  });

  // 1. styled-components' whole-line comments.
  const keep = new Uint8Array(joined.length).fill(1);
  for (const m of joined.matchAll(LINE_COMMENT)) {
    for (let j = m.index; j < m.index + m[0].length; j++) keep[j] = 0;
  }
  const kept: number[] = [];
  for (let j = 0; j < joined.length; j++) if (keep[j]) kept.push(j);

  // 2. stylis's comments: `/* */` and `//` outside strings and outside
  // parentheses (url(http://...), calc(1px /* x */ + 2px) keep theirs).
  let text = '';
  const src: number[] = [];
  const push = (n: number) => {
    text += joined[kept[n]];
    src.push(kept[n]);
  };
  let quote = '';
  let depth = 0;
  for (let n = 0; n < kept.length; n++) {
    const c = joined[kept[n]];
    const next = joined[kept[n + 1]];
    if (quote) {
      push(n);
      if (c === '\\' && n + 1 < kept.length) push(++n);
      else if (c === quote) quote = '';
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')') depth = Math.max(0, depth - 1);
    else if (depth === 0 && c === '/' && next === '*') {
      n += 2;
      while (
        n < kept.length &&
        !(joined[kept[n]] === '*' && joined[kept[n + 1]] === '/')
      )
        n++;
      n++;
      continue;
    } else if (depth === 0 && c === '/' && next === '/') {
      while (n + 1 < kept.length && joined[kept[n + 1]] !== '\n') n++;
      continue;
    }
    push(n);
  }

  // Characters [a, b) of the parsed text as runs of one origin each.
  const spansOf = (a: number, b: number): Span[] => {
    const out: Span[] = [];
    for (let j = a; j < b; j++) {
      const piece = pieces[pieceAt[src[j]]];
      const origin = piece.origin;
      if (!origin) continue;
      const off = offsetAt[src[j]];
      const last = out[out.length - 1];
      if (last && last.origin === origin && last.to === off) last.to = off + 1;
      else out.push({ origin, from: off, to: off + 1 });
    }
    return out;
  };

  const pushDecl = (from: number, to: number, decls: ParsedDecl[]) => {
    let a = from;
    let b = to;
    while (a < b && isSpace(text[a])) a++;
    while (b > a && isSpace(text[b - 1])) b--;
    if (a >= b) return;
    let colon = -1;
    let q = '';
    let d = 0;
    for (let i = a; i < b && colon < 0; i++) {
      const c = text[i];
      if (q) {
        if (c === '\\') i++;
        else if (c === q) q = '';
      } else if (c === '"' || c === "'") q = c;
      else if (c === '(') d++;
      else if (c === ')') d = Math.max(0, d - 1);
      else if (c === ':' && d === 0) colon = i;
    }
    // A segment with no colon: stylis writes it through and the browser
    // drops it, so it is no declaration.
    if (colon < 0) return;
    let pb = colon;
    while (pb > a && isSpace(text[pb - 1])) pb--;
    if (pb === a) return;
    let va = colon + 1;
    let vb = b;
    while (va < vb && isSpace(text[va])) va++;
    const bang = /!\s*important$/i.exec(text.slice(va, vb));
    if (bang) {
      vb = va + bang.index;
      while (vb > va && isSpace(text[vb - 1])) vb--;
    }
    const prop = text.slice(a, pb);
    decls.push({
      prop: prop.startsWith('--') ? prop : prop.toLowerCase(),
      value: text.slice(va, vb),
      important: !!bang,
      propOrigins: spansOf(a, pb),
      valueOrigins: spansOf(va, vb),
      at: a,
    });
  };

  const parseBlock = (
    from: number,
    selectors: string[],
    atRules: string[],
    emit: boolean,
    out: ParsedRule[]
  ): number => {
    const decls: ParsedDecl[] = [];
    const nested: ParsedRule[] = [];
    const finish = () => {
      if (emit && decls.length) {
        const [first, ...rest] = selectors;
        out.push({
          selector: [selfReference(first, name, componentId), ...rest].join(
            ','
          ),
          atRules,
          decls,
        });
      }
      out.push(...nested);
    };
    let start = from;
    let q = '';
    let d = 0;
    for (let i = from; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '\\') i++;
        else if (c === q) q = '';
        continue;
      }
      if (c === '"' || c === "'") q = c;
      else if (c === '(') d++;
      else if (c === ')') d = Math.max(0, d - 1);
      else if (d > 0) continue;
      else if (c === ';') {
        pushDecl(start, i, decls);
        start = i + 1;
      } else if (c === '{') {
        const prelude = text.slice(start, i).replace(/\s+/g, ' ').trim();
        if (prelude.startsWith('@')) {
          const at = /^@([-\w]+)/.exec(prelude)?.[1]?.toLowerCase() ?? '';
          const grouping = GROUPING.has(at);
          i = parseBlock(
            i + 1,
            selectors,
            grouping && at !== 'layer' ? [...atRules, prelude] : atRules,
            emit && grouping,
            nested
          );
        } else {
          i = parseBlock(
            i + 1,
            compose(selectors, splitSelectors(prelude)),
            atRules,
            emit,
            nested
          );
        }
        start = i + 1;
      } else if (c === '}') {
        pushDecl(start, i, decls);
        finish();
        return i;
      }
    }
    pushDecl(start, text.length, decls);
    finish();
    return text.length;
  };

  const out: ParsedRule[] = [];
  parseBlock(0, [`.${name}`], [], true, out);
  return out;
};

// ------------------------------------------------------------ index decls

// The quasis of a template with its holes as `\0<n>\0`, each character
// carrying its own place: quasi k at offset j, or hole n.
const holePieces = (t: Template): Piece[] => {
  const out: Piece[] = [];
  t.quasis.forEach((q, k) => {
    out.push({
      text: q,
      origin: { kind: 'quasi', template: t, k, path: [] },
      at: 0,
    });
    if (k < t.exprs.length) {
      const hole = `\u0000${k}\u0000`;
      out.push({
        text: hole,
        origin: { kind: 'expr', template: t, k, value: hole, path: [] },
        at: 0,
      });
    }
  });
  return out;
};

const HOLE = /\u0000(\d+)\u0000/g;

const holesOf = (s: string) => [...s.matchAll(HOLE)].map((m) => Number(m[1]));

const declCache = new WeakMap<Template, Map<string, Decl>>();

// The index Decl whose property starts at offset `at` of quasi `k`: the
// template's own text is parsed as above, its declarations taken in
// document order and paired with the index's by property name, in order.
// A pair counts only when both list the same expressions in the value; a
// property whose counts differ pairs nothing.
export const indexDeclAt = (
  t: Template,
  k: number,
  at: number
): Decl | undefined => {
  let byPlace = declCache.get(t);
  if (!byPlace) {
    byPlace = new Map();
    const parsed = parseCss(holePieces(t), 'self', 'self')
      .flatMap((r) => r.decls)
      .sort((x, y) => x.at - y.at);
    const norm = (p: string) => p.replace(HOLE, (_m, n: string) => `\${${n}}`);
    const props = new Set(parsed.map((d) => norm(d.prop)));
    for (const prop of props) {
      const mine = parsed.filter((d) => norm(d.prop) === prop);
      const theirs = t.decls.filter((d) => d.prop === prop);
      if (mine.length !== theirs.length) continue;
      mine.forEach((d, i) => {
        const start = d.propOrigins[0];
        const holes = theirs[i].value.filter(
          (v): v is number => typeof v === 'number'
        );
        if (
          start?.origin.kind !== 'quasi' ||
          holes.join(',') !== holesOf(d.value).join(',')
        ) {
          return;
        }
        byPlace?.set(`${start.origin.k}:${start.from}`, theirs[i]);
      });
    }
    declCache.set(t, byPlace);
  }
  return byPlace.get(`${k}:${at}`);
};
