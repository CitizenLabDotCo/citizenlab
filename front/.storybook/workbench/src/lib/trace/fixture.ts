// Test fixture: the index's view of Button/index.tsx (the Container
// template, the string template getButtonStyle returns, the reads of their
// expressions, their declarations) built from the real file with Babel, so
// the tests run on the code's own text and positions. A small stand-in for
// npm run ds:index, covering the JavaScript these two templates use; the
// tests never import the indexer (scripts/design-system/index/).
import { readFileSync } from 'fs';
import { join } from 'path';

import { parse } from '@babel/parser';

import { splitSelectors } from './cascade';
import type { Canonicaliser } from './canonical';
import { fnv1a32 } from './hash';
import { ComponentStyle, Fiber, styledFibers, styledTypeOf } from './internals';
import { createIndexClient, IndexClient } from './indexClient';
import type {
  Decl,
  DefPlace,
  Expr,
  IndexMeta,
  IndexStyles,
  Loc,
  Read,
  Template,
} from './types';

export const FRONT = join(__dirname, '../../../../..');
export const BUTTON = 'app/component-library/components/Button/index.tsx';
export const STYLE_UTILS = 'app/component-library/utils/styleUtils.ts';
export const COMMIT = 'fixture';

export const sourceOf = (file: string) =>
  readFileSync(join(FRONT, file), 'utf8');

// ------------------------------------------------------------ positions

export const lineTable = (src: string) => {
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === '\n') starts.push(i + 1);
  const at = (offset: number) => {
    let line = starts.length - 1;
    while (starts[line] > offset) line--;
    return { line: line + 1, col: offset - starts[line] };
  };
  return (start: number, end: number): Loc => {
    const a = at(start);
    const b = at(end);
    return {
      start,
      end,
      line: a.line,
      col: a.col,
      endLine: b.line,
      endCol: b.col,
    };
  };
};

// ------------------------------------------------------------ reads

/* eslint-disable @typescript-eslint/no-explicit-any */
type Node = any;

const CONST_SOURCES = [
  'colors',
  'bo',
  'fontSizes',
  'stylingConsts',
  'viewportWidths',
];

type Scope = {
  src: string;
  loc: (n: Node) => Loc;
  // Top-level consts and functions of the file.
  top: Map<string, Node>;
  // The function's own consts.
  local: Map<string, Node>;
  values: Record<string, unknown>;
  templateId: (lit: Node) => string;
  // Reading a style template's own function: what it returns is a string
  // template (getButtonStyle's), not a value.
  style?: boolean;
};

const memberPath = (n: Node): string[] | undefined => {
  if (n.type === 'Identifier') return [n.name];
  if (n.type === 'MemberExpression' && !n.computed) {
    const head = memberPath(n.object);
    return head && [...head, n.property.name];
  }
  return undefined;
};

const unwrap = (n: Node): Node =>
  n.type === 'TSAsExpression' || n.type === 'TSNonNullExpression'
    ? unwrap(n.expression)
    : n;

// An object literal's entries after its spreads, later keys winning, each
// with the consts its spreads went through.
const entriesOf = (
  obj: Node,
  s: Scope,
  hops: { name: string; loc: Loc }[] = []
): Map<string, { node: Node; hops: { name: string; loc: Loc }[] }> => {
  const out = new Map<
    string,
    { node: Node; hops: { name: string; loc: Loc }[] }
  >();
  for (const p of obj.properties) {
    if (p.type === 'SpreadElement') {
      const d = s.top.get(p.argument.name);
      const inner = entriesOf(d.init, s, [
        ...hops,
        { name: d.id.name, loc: s.loc(d.id) },
      ]);
      for (const [k, v] of inner) out.set(k, v);
    } else {
      const key =
        p.key.type === 'Identifier' ? p.key.name : String(p.key.value);
      out.set(key, { node: p.value, hops });
    }
  }
  return out;
};

const withConsts = (r: Read, hops: { name: string; loc: Loc }[]): Read =>
  hops.length ? ({ ...r, consts: [...hops, ...(r.consts ?? [])] } as Read) : r;

const returnsOf = (body: Node, s: Scope): Read => {
  const block = (stmts: Node[]): Read | undefined => {
    for (const st of stmts) {
      const r = stmt(st);
      if (r) return r;
    }
    return undefined;
  };
  const stmt = (st: Node): Read | undefined => {
    switch (st.type) {
      case 'ReturnStatement':
        return readOf(st.argument, s, !!s.style);
      case 'BlockStatement':
        return block(st.body);
      case 'IfStatement': {
        const then = stmt(st.consequent) as Read;
        const other = st.alternate
          ? (stmt(st.alternate) as Read)
          : ({ k: 'literal', value: '', loc: s.loc(st) } as Read);
        return {
          k: 'cond',
          test: readOf(st.test, s),
          then,
          else: other,
          loc: s.loc(st),
        };
      }
      case 'SwitchStatement': {
        const cases: { value: string; then: Read }[] = [];
        let fallback: Read | undefined;
        for (const c of st.cases) {
          const r = block(c.consequent) as Read;
          if (c.test) cases.push({ value: String(c.test.value), then: r });
          else fallback = r;
        }
        return {
          k: 'switch',
          on: readOf(st.discriminant, s),
          cases,
          ...(fallback ? { default: fallback } : {}),
          loc: s.loc(st),
        };
      }
      case 'VariableDeclaration':
        for (const d of st.declarations) s.local.set(d.id.name, d);
        return undefined;
      default:
        return undefined;
    }
  };
  return block(
    body.type === 'BlockStatement'
      ? body.body
      : [{ type: 'ReturnStatement', argument: body }]
  ) as Read;
};

export const readOf = (node: Node, s: Scope, returned = false): Read => {
  const n = unwrap(node);
  const loc = s.loc(n);
  const text = s.src.slice(n.start, n.end);
  switch (n.type) {
    case 'StringLiteral':
      return { k: 'literal', value: n.value, loc };
    case 'NumericLiteral':
      return { k: 'literal', value: String(n.value), loc };
    case 'TemplateLiteral': {
      if (returned) return { k: 'template', id: s.templateId(n), loc };
      if (n.expressions.length === 0) {
        return {
          k: 'literal',
          value: n.quasis[0].value.cooked,
          loc: s.loc(n.quasis[0]),
        };
      }
      const parts: Read[] = [];
      n.quasis.forEach((q: Node, k: number) => {
        if (q.value.cooked) {
          parts.push({ k: 'literal', value: q.value.cooked, loc: s.loc(q) });
        }
        if (k < n.expressions.length) parts.push(readOf(n.expressions[k], s));
      });
      return { k: 'concat', parts, loc };
    }
    case 'Identifier': {
      const d = s.local.get(n.name);
      if (d) {
        return withConsts(readOf(d.init, s), [
          { name: n.name, loc: s.loc(d.id) },
        ]);
      }
      return { k: 'unknown', text, loc };
    }
    case 'MemberExpression': {
      const path = memberPath(n);
      if (path?.[0] === 'props') {
        if (path[1] !== 'theme') return { k: 'prop', name: path[1], loc };
        // The index's static value: the default theme's (getTheme(null)).
        let v: unknown = (s.values.getTheme as (x: null) => unknown)(null);
        for (const key of path.slice(2))
          v = (v as Record<string, unknown>)?.[key];
        return {
          k: 'theme',
          path: path.slice(2),
          ...(v !== undefined && typeof v !== 'object'
            ? { value: String(v) }
            : {}),
          loc,
        };
      }
      if (path && CONST_SOURCES.includes(path[0])) {
        let v: unknown = s.values[path[0]];
        for (const key of path.slice(1))
          v = (v as Record<string, unknown>)?.[key];
        return {
          k: 'const',
          source: path[0] as 'bo',
          path: path.slice(1),
          ...(v !== undefined && typeof v !== 'object'
            ? { value: String(v) }
            : {}),
          loc,
        };
      }
      return { k: 'unknown', text, loc };
    }
    case 'LogicalExpression': {
      const k =
        n.operator === '||' ? 'or' : n.operator === '&&' ? 'and' : 'nullish';
      const items: Read[] = [];
      const flat = (x: Node) => {
        const u = unwrap(x);
        if (u.type === 'LogicalExpression' && u.operator === n.operator) {
          flat(u.left);
          flat(u.right);
        } else items.push(readOf(u, s));
      };
      flat(n);
      return { k, items, loc };
    }
    case 'ConditionalExpression':
      return {
        k: 'cond',
        test: readOf(n.test, s),
        then: readOf(n.consequent, s),
        else: readOf(n.alternate, s),
        loc,
      };
    case 'UnaryExpression':
      return n.operator === '!'
        ? { k: 'not', left: readOf(n.argument, s), loc }
        : { k: 'unknown', text, loc };
    case 'BinaryExpression':
      return n.operator === '===' || n.operator === '!=='
        ? {
            k: n.operator === '===' ? 'eq' : 'neq',
            left: readOf(n.left, s),
            right: readOf(n.right, s),
            loc,
          }
        : { k: 'unknown', text, loc };
    case 'CallExpression': {
      const callee =
        n.callee.type === 'Identifier' ? n.callee.name : text.split('(')[0];
      const [a, b] = n.arguments;
      if (
        callee === 'get' &&
        b?.type === 'TemplateLiteral' &&
        a.type === 'Identifier'
      ) {
        const d = s.local.get(a.name);
        const field = b.quasis[1].value.cooked.replace(/^\./, '');
        const table: Record<string, Read> = {};
        for (const p of d.init.properties) {
          const key =
            p.key.type === 'Identifier' ? p.key.name : String(p.key.value);
          const entry = entriesOf(p.value, s).get(field);
          if (entry) table[key] = withConsts(readOf(entry.node, s), entry.hops);
        }
        return {
          k: 'map',
          key: readOf(b.expressions[0], s),
          field,
          table,
          loc,
        };
      }
      if (callee === 'get' && b?.type === 'StringLiteral') {
        const inner = readOf(a, s);
        if (inner.k === 'theme')
          return { k: 'theme', path: [...inner.path, b.value], loc };
      }
      const fn = s.top.get(callee);
      if (fn && fn.type === 'FunctionDeclaration') {
        const inner: Scope = { ...s, local: new Map(), style: s.style };
        return {
          k: 'call',
          callee,
          args: [],
          returns: returnsOf(fn.body, inner),
          loc,
        };
      }
      // The indexer's argReads: what each argument reads.
      return {
        k: 'call',
        callee,
        args: n.arguments.map((x: any) => readOf(x, s)),
        loc,
      };
    }
    case 'ArrowFunctionExpression': {
      const inner: Scope = { ...s, local: new Map(), style: true };
      return n.body.type === 'BlockStatement'
        ? returnsOf(n.body, inner)
        : readOf(n.body, inner);
    }
    default:
      return { k: 'unknown', text, loc };
  }
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// ------------------------------------------------------------ templates

// The declarations of a template, found in its quasis with the holes as
// `\0n\0` by a plain scan (not cssParse): `prop: value;` outside comments.
const declsOf = (
  quasis: string[],
  quasiStart: number[],
  loc: (a: number, b: number) => Loc
): Decl[] => {
  let text = '';
  const place: [number, number][] = [];
  quasis.forEach((q, k) => {
    for (let j = 0; j < q.length; j++) place.push([k, j]);
    text += q;
    if (k < quasis.length - 1) {
      const hole = `\u0000${k}\u0000`;
      for (let j = 0; j < hole.length; j++) place.push([-1, 0]);
      text += hole;
    }
  });
  const blank = (m: string) => m.replace(/[^\n]/g, ' ');
  const clean = text
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/\/\/[^\n]*/g, blank);
  const out: Decl[] = [];
  const re =
    /(^|[;{}\s])([a-z-]+)\s*:\s*([^;{}]*?)\s*(!important)?\s*(?=[;}])/g;
  for (const m of clean.matchAll(re)) {
    const at = m.index + m[1].length;
    const [k, j] = place[at];
    const value = m[3]
      .split(/\u0000(\d+)\u0000/)
      .map((v, i) => (i % 2 ? Number(v) : v));
    out.push({
      prop: m[2],
      selectors: [],
      atRules: [],
      loc: loc(quasiStart[k] + j, quasiStart[k] + j + m[2].length),
      value,
      important: !!m[4],
    });
  }
  return out;
};

export type ButtonFixture = {
  src: string;
  container: Template;
  string: Template;
  templates: Template[];
  meta: IndexMeta;
  client: (extra?: { styles?: IndexStyles }) => IndexClient;
};

export const buttonFixture = (
  values: Record<string, unknown>
): ButtonFixture => {
  const src = sourceOf(BUTTON);
  const ast = parse(src, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
  const lines = lineTable(src);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const loc = (n: any) => lines(n.start, n.end);
  const top = new Map<string, any>();
  for (const st of ast.program.body as any[]) {
    const decl = st.type === 'ExportNamedDeclaration' ? st.declaration : st;
    if (decl?.type === 'VariableDeclaration') {
      for (const d of decl.declarations) top.set(d.id.name, d);
    } else if (decl?.type === 'FunctionDeclaration')
      top.set(decl.id.name, decl);
  }
  const idOf = (lit: any) => `${BUTTON}:${loc(lit).line}:${loc(lit).col}`;
  const scope = (): Scope => ({
    src,
    loc,
    top,
    local: new Map(),
    values,
    templateId: idOf,
  });

  const make = (
    lit: any,
    kind: Template['kind'],
    name: string,
    exprOf: (e: any, s: Scope) => Partial<Expr>,
    s: Scope
  ): Template => {
    const quasis: string[] = lit.quasis.map((q: any) => q.value.cooked);
    lit.quasis.forEach((q: any) => {
      if (q.value.raw !== q.value.cooked)
        throw new Error('escapes in the fixture');
    });
    const exprs: Expr[] = lit.expressions.map((e: any) => ({
      loc: loc(e),
      text: src.slice(e.start, e.end),
      shape: 'unknown',
      read: readOf(e, s),
      ...exprOf(e, s),
    }));
    return {
      id: idOf(lit),
      file: BUTTON,
      loc: loc(lit),
      kind,
      name,
      quasis,
      exprs,
      decls: declsOf(
        quasis,
        lit.quasis.map((q: any) => q.start),
        lines
      ),
    };
  };

  // getButtonStyle's `return \`...\`` (line 400).
  const fn = top.get('getButtonStyle');
  const fnScope = scope();
  const body = fn.body.body as any[];
  for (const st of body) {
    if (st.type === 'VariableDeclaration') {
      for (const d of st.declarations) fnScope.local.set(d.id.name, d);
    }
  }
  const ret = body.find((st) => st.type === 'ReturnStatement').argument;
  const string = make(ret, 'string', 'getButtonStyle', () => ({}), fnScope);

  // `const Container = styled(Box)<ButtonContainerProps>\`...\`` (line 548).
  const quasi = top.get('Container').init.quasi;
  const container = make(
    quasi,
    'styled',
    'Container',
    (e) =>
      e.type === 'ArrowFunctionExpression'
        ? { shape: 'fn' }
        : { shape: 'component', component: e.name },
    scope()
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const utils = sourceOf(STYLE_UTILS);
  const ulines = lineTable(utils);
  const defAt = (object: string, key: string): DefPlace => {
    const from = utils.indexOf(`export const ${object} = {`);
    const at = utils.indexOf(`${key}:`, from);
    const l = ulines(at, at);
    return { file: STYLE_UTILS, line: l.line, col: l.col };
  };
  const meta: IndexMeta = {
    version: 1,
    commit: COMMIT,
    files: 1,
    templates: 2,
    decls: container.decls.length + string.decls.length,
    exprs: container.exprs.length + string.exprs.length,
    exprsKnown: 0,
    unknownTags: 0,
    themeDefs: {
      borderRadius: defAt('stylingConsts', 'borderRadius'),
      'fontSizes.base': defAt('fontSizes', 'base'),
    },
    constDefs: {
      'bo.borderRadius': defAt('bo', 'borderRadius'),
      'fontSizes.base': defAt('fontSizes', 'base'),
    },
  };

  const templates = [container, string];
  const lookup: Record<string, string[]> = {};
  for (const t of templates) {
    for (const q of t.quasis) {
      const h = fnv1a32(q);
      lookup[h] = [...new Set([...(lookup[h] ?? []), t.id])];
    }
  }
  const files: Record<string, string> = {
    'meta.json': JSON.stringify(meta),
    'lookup.json': JSON.stringify(lookup),
    [`files/${fnv1a32(BUTTON)}.json`]: JSON.stringify({
      file: BUTTON,
      templates,
    }),
  };
  const client = (extra: { styles?: IndexStyles } = {}) =>
    createIndexClient({
      base: 'index/',
      sourceUrl: (commit, file) => `src/${commit}/${file}`,
      fetch: async (url) => {
        const text = url.startsWith('src/fixture/')
          ? sourceOf(url.slice('src/fixture/'.length))
          : url === 'index/styles.json' && extra.styles
          ? JSON.stringify(extra.styles)
          : files[url.slice('index/'.length)];
        return { ok: text !== undefined, text: async () => text as string };
      },
    });
  return { src, container, string, templates, meta, client };
};

// ------------------------------------------------------------ jsdom

// A canonicaliser for jsdom, which has no replaceSync: selectors and
// conditions with their whitespace normalised, the box shorthands expanded
// by the spec's positions, every other declaration its own longhand. The
// browser's own canonicaliser (canonical.ts) is checked in a real browser.
const SIDES = ['top', 'right', 'bottom', 'left'];
const BOXES: Record<string, string[]> = {
  padding: SIDES.map((x) => `padding-${x}`),
  margin: SIDES.map((x) => `margin-${x}`),
  inset: SIDES,
  'border-width': SIDES.map((x) => `border-${x}-width`),
  'border-style': SIDES.map((x) => `border-${x}-style`),
  'border-color': SIDES.map((x) => `border-${x}-color`),
  'border-radius': [
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
  ],
};
const AT = [
  [0, 0, 0, 0],
  [0, 1, 0, 1],
  [0, 1, 2, 1],
  [0, 1, 2, 3],
];

export const jsdomCanon: Canonicaliser = {
  selector: (text) =>
    splitSelectors(text)
      .map((p) =>
        p
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/\s*([>+~])\s*/g, ' $1 ')
      )
      .join(', '),
  atRule: (text) => text.trim().replace(/\s+/g, ' '),
  longhands: (prop, value) => {
    const v = value.trim();
    const box = BOXES[prop];
    if (!box) return new Map([[prop, v]]);
    if (v.includes('var(')) return new Map(box.map((l) => [l, '']));
    const parts = v.split(/\s+/);
    if (parts.length > 4) return undefined;
    return new Map(box.map((l, i) => [l, parts[AT[parts.length - 1][i]]]));
  },
  value: (_prop, value) => value.trim(),
};

// jsdom leaves a sheet's ownerNode unset: point each at its <style>.
export const linkSheets = (doc: Document) => {
  for (const el of Array.from(doc.querySelectorAll('style'))) {
    const sheet = (el as HTMLStyleElement).sheet;
    if (sheet && !sheet.ownerNode) {
      Object.defineProperty(sheet, 'ownerNode', {
        value: el,
        configurable: true,
      });
    }
  }
};

export const stubMatchMedia = (win: Window) => {
  Object.defineProperty(win, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({ matches: false, media: query }),
  });
};

// The real Button rendered with the app's providers. Call it at a test
// file's top level: the testing library registers its hooks on require.
export const buttonRenderer = () => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const React = require('react');
  const {
    render,
  } = require(`${FRONT}/app/component-library/utils/testUtils/rtl`);
  const Button =
    require(`${FRONT}/app/component-library/components/Button`).default;
  /* eslint-enable @typescript-eslint/no-var-requires */
  return (props: Record<string, unknown> = {}) => {
    const { container } = render(React.createElement(Button, props, 'Label'));
    const button = container.querySelector('button') as HTMLButtonElement;
    const div = button.parentElement as HTMLElement;
    const fiber = styledFibers(div).find(
      (f) => styledTypeOf(f)?.componentStyle.rules.length === 11
    ) as Fiber;
    const style = styledTypeOf(fiber)?.componentStyle as ComponentStyle;
    const textId = (style.rules[9] as string).slice(1);
    const label = button.querySelector(`.${textId}`) as HTMLElement;
    return { container, button, div, fiber, style, label };
  };
};
