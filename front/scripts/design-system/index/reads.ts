/*
 * What an interpolated value reads: the data flow of the code index, by the
 * rules of the trace plan (§M1, rules 1 to 9). Static analysis only: nothing
 * is executed, and anything the rules do not cover reads as `unknown` with
 * its source text, never as a guess.
 *
 * 1. A function (arrow, function expression, function declaration): the read
 *    of what it returns. An expression body is read as is; a block body is
 *    read from its `return`s, composed through `if`/`else` as `cond` and
 *    `switch` as `switch` (fall-through and `break` followed). Declarations
 *    are allowed; any other statement (a loop, an assignment, a call for its
 *    effect) makes the whole function `unknown`. A function used as a style
 *    value is called with the props, so its first parameter, whatever its
 *    name, is the props: `props.x` is `prop x`, `props.theme.a` is `theme`,
 *    and so are destructured parameters (`({ a, theme })`).
 * 2. An identifier follows its Babel binding: a const initialiser (any scope,
 *    destructuring included) is read in its place, with a cycle guard and the
 *    const recorded in `consts`; an import from styleUtils is a `const` read
 *    (colors, bo, fontSizes, stylingConsts, viewportWidths, values from
 *    values.ts) or the template it exports; another import is the template
 *    it names when it is an indexed tagged template, else `unknown`.
 * 3. Member chains on the props, the theme, the styleUtils objects and
 *    same-file const object literals (spreads followed, later keys win).
 * 4. `||` `&&` `??` are `or` `and` `nullish` (chains flattened); `a ? b : c`
 *    is `cond`; `===` `!==` `!` are `eq` `neq` `not`. Loose equality is not
 *    read.
 * 5. Template literals and string `+` are `concat`; a string that is
 *    `var(--gv-…)` is a `token`, one that contains one is a `concat` of
 *    literal and token parts.
 * 6. lodash `get(OBJ, \`${KEY}.field\`)` or `get(OBJ, [KEY, 'field'])`, OBJ an
 *    object literal in scope, is a `map`: the table holds the read of
 *    OBJ[key].field for every key whose entry has the field after its
 *    spreads. `get` with a static path is the member chain it walks.
 * 7. A call to a same-file function is a `call` whose `returns` is the read
 *    of the function (rule 1) with its first parameter bound to the first
 *    argument. Any other call is a `call` with its arguments only.
 * 8. A css`` in a function is a `template` read; an untagged template
 *    literal (or a non-empty string) a style function returns into a
 *    statement hole of its template (`${(props) => getButtonStyle(props)}`)
 *    becomes a template of kind string, read as `template`.
 * 9. Anything else is `unknown`.
 *
 * In the flatten position (a style template's interpolation and what its
 * functions return), `false`, `null` and `undefined` read as the literal ''
 * that styled-components makes of them; elsewhere they are `unknown`.
 */
import { NodePath } from '@babel/traverse';

import { LegacyValues, lookup } from '../scan/values';

import { ConstHop, ConstSource, Loc, Read, TemplateKind } from './schema';

/** What an imported name is, as far as the index is concerned. */
export type ImportMeaning =
  | { kind: 'const'; source: ConstSource }
  | { kind: 'template'; id: string; template: TemplateKind; tag?: string }
  | { kind: 'helper'; name: 'media' | 'isRtl' }
  | { kind: 'other' };

/** The file-level services the reads need. */
export type ReadScope = {
  source: string;
  values: LegacyValues;
  /** The Loc of a node. */
  loc: (node: any) => Loc;
  /** The Loc of [from, to) of a string literal's or quasi's cooked text. */
  textLoc: (node: any, from: number, to: number) => Loc;
  /** What an import of `imported` from `spec` is. */
  importOf: (spec: string, imported: string) => ImportMeaning;
  /** In styleUtils.ts itself: a top-level const that is a const source. */
  localSource?: (binding: any) => ConstSource | undefined;
  /** The id of an indexed tagged template (css, styled, a helper call site). */
  taggedId: (node: any) => string | undefined;
  /** Registers a string template (rule 8) and gives its id. */
  stringTemplate: (path: NodePath) => string;
};

/** A parameter's value: a path into the props, or another read. */
export type Bound = { props: string[] } | { read: Read };
/** Parameter bindings, keyed by the binding's identifier node. */
export type Env = Map<object, Bound>;

/** Where a read starts: its parameters, and whether flatten receives it. */
export type ReadAt = {
  env?: Env;
  /** The value goes to styled-components' flatten (a style template's hole). */
  out?: boolean;
  /** The hole stands as a statement of its own (see cssDecls.ts). */
  stmt?: boolean;
};

// env: parameter bindings; out: flatten receives the value; stmt: into a
// statement hole; fn: returned by a style function (where rule 8 applies);
// brk: what a `break` in the current switch continues with.
type St = {
  env: Env;
  out: boolean;
  stmt: boolean;
  fn: boolean;
  brk?: () => Read;
};

const CONST_SOURCES: ConstSource[] = [
  'colors',
  'bo',
  'fontSizes',
  'stylingConsts',
  'viewportWidths',
];
export const isConstSource = (name: string): name is ConstSource =>
  (CONST_SOURCES as string[]).includes(name);

const WRAPPERS = new Set([
  'ParenthesizedExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
  'TSTypeAssertion',
  'TSInstantiationExpression',
]);

/** The path without parentheses and TS-only wrappers. */
export const unwrap = (p: NodePath): NodePath => {
  let q = p;
  while (WRAPPERS.has(q.node.type)) q = q.get('expression') as NodePath;
  return q;
};

const isFunction = (p: NodePath) =>
  p.isArrowFunctionExpression() ||
  p.isFunctionExpression() ||
  p.isFunctionDeclaration();

// Read budget per top-level read: a guard against branch blow-up.
const BUDGET = 20000;

class TooLarge extends Error {}

// A statement rule 1 does not read: the whole function is unknown.
class Unsupported extends Error {
  constructor(readonly at: NodePath) {
    super(at.node.type);
  }
}

const TOKEN = /var\(--gv-[A-Za-z0-9_-]+\)/g;
const HAS_TOKEN = /var\(--gv-[A-Za-z0-9_-]+\)/;
const WHOLE_TOKEN = /^var\((--gv-[A-Za-z0-9_-]+)\)$/;

/** The source of an import binding: its spec and imported name. */
export const importRef = (
  binding: any
): { spec: string; imported: string } | undefined => {
  if (binding?.kind !== 'module') return undefined;
  const decl = binding.path.parentPath?.node;
  if (decl?.type !== 'ImportDeclaration') return undefined;
  const sp = binding.path.node;
  const imported =
    sp.type === 'ImportDefaultSpecifier'
      ? 'default'
      : sp.type === 'ImportNamespaceSpecifier'
      ? '*'
      : sp.imported.name ?? sp.imported.value;
  return { spec: decl.source.value, imported };
};

/** The initialiser path of a const binding declared `const x = init`. */
export const constInit = (binding: any): NodePath | undefined => {
  const d = binding?.path;
  if (binding?.kind !== 'const' || !d?.isVariableDeclarator()) return undefined;
  if (d.node.id.type !== 'Identifier' || !d.node.init) return undefined;
  return d.get('init') as NodePath;
};

/**
 * For a const declared through a destructuring pattern (`const { a: { b } }
 * = init`): the init and the keys from it to the binding. Patterns with a
 * default, a rest or a computed key read as undefined.
 */
const patternInit = (
  binding: any
): { init: NodePath; keys: string[] } | undefined => {
  const d = binding?.path;
  if (binding?.kind !== 'const' || !d?.isVariableDeclarator() || !d.node.init) {
    return undefined;
  }
  const keys = patternKeys(d.node.id, binding.identifier);
  return keys ? { init: d.get('init') as NodePath, keys } : undefined;
};

const patternKeys = (pattern: any, target: any): string[] | undefined => {
  if (pattern === target) return [];
  if (pattern.type !== 'ObjectPattern') return undefined;
  for (const prop of pattern.properties) {
    if (prop.type !== 'ObjectProperty' || prop.computed) continue;
    const key =
      prop.key.type === 'Identifier' ? prop.key.name : String(prop.key.value);
    const rest = patternKeys(prop.value, target);
    if (rest) return [key, ...rest];
  }
  return undefined;
};

const withHops = (r: Read, hops: ConstHop[]): Read =>
  hops.length ? { ...r, consts: [...hops, ...(r.consts ?? [])] } : r;

/** The static string a read always gives, if it has one. */
export const staticValue = (r: Read): string | undefined => {
  switch (r.k) {
    case 'literal':
      return r.value;
    case 'token':
      return `var(${r.name})`;
    case 'const':
      return r.value;
    case 'concat': {
      let out = '';
      for (const part of r.parts) {
        const v = staticValue(part);
        if (v === undefined) return undefined;
        out += v;
      }
      return out;
    }
    default:
      return undefined;
  }
};

/**
 * Whether a read can be evaluated from the props and theme alone: no
 * `unknown` reachable, no call without `returns`, no const without a value.
 */
export const isKnown = (r: Read): boolean => {
  switch (r.k) {
    case 'unknown':
      return false;
    case 'const':
      return r.value !== undefined;
    case 'call':
      return r.returns !== undefined && isKnown(r.returns);
    case 'or':
    case 'and':
    case 'nullish':
      return r.items.every(isKnown);
    case 'cond':
      return isKnown(r.test) && isKnown(r.then) && isKnown(r.else);
    case 'switch':
      return (
        isKnown(r.on) &&
        r.cases.every((c) => isKnown(c.then)) &&
        (r.default === undefined || isKnown(r.default))
      );
    case 'eq':
    case 'neq':
    case 'not':
      return isKnown(r.left) && (r.right === undefined || isKnown(r.right));
    case 'concat':
      return r.parts.every(isKnown);
    case 'map':
      return isKnown(r.key) && Object.values(r.table).every(isKnown);
    default:
      return true;
  }
};

// An object literal's entries after its spreads: later keys win. An entry
// set before a spread the reads cannot follow is `uncertain`, and so is the
// object as a whole (`open`: it may hold keys it does not list).
type Entry = { value?: NodePath; hops: ConstHop[]; uncertain?: NodePath };
type Entries = { map: Map<string, Entry>; open: boolean; at: NodePath };

class Reader {
  private stack = new Set<object>();
  private count = 0;

  constructor(private s: ReadScope) {}

  // -------------------------------------------------------------------------
  // Leaves

  private text(p: NodePath): string {
    const t = this.s.source
      .slice(p.node.start ?? 0, p.node.end ?? 0)
      .replace(/\s+/g, ' ');
    return t.length > 160 ? `${t.slice(0, 160)} ...` : t;
  }

  unknown(p: NodePath, why?: string): Read {
    return {
      k: 'unknown',
      text: why ? `${this.text(p)} (${why})` : this.text(p),
      loc: this.s.loc(p.node),
    };
  }

  private hop(binding: any): ConstHop {
    return {
      name: binding.identifier.name,
      loc: this.s.loc(binding.identifier),
    };
  }

  // A string: a token, a concat of literal and token parts, or a literal.
  private textRead(value: string, node: any): Read {
    const loc = this.s.loc(node);
    const whole = WHOLE_TOKEN.exec(value);
    if (whole) return { k: 'token', name: whole[1], loc };
    if (!HAS_TOKEN.test(value)) return { k: 'literal', value, loc };
    return { k: 'concat', parts: this.textParts(value, node), loc };
  }

  private textParts(value: string, node: any): Read[] {
    const parts: Read[] = [];
    let last = 0;
    for (const m of value.matchAll(TOKEN)) {
      const at = m.index ?? 0;
      if (at > last) {
        parts.push({
          k: 'literal',
          value: value.slice(last, at),
          loc: this.s.textLoc(node, last, at),
        });
      }
      parts.push({
        k: 'token',
        name: m[0].slice(4, -1),
        loc: this.s.textLoc(node, at, at + m[0].length),
      });
      last = at + m[0].length;
    }
    if (last < value.length) {
      parts.push({
        k: 'literal',
        value: value.slice(last),
        loc: this.s.textLoc(node, last, value.length),
      });
    }
    return parts;
  }

  private propsRead(path: string[], at: NodePath): Read {
    const loc = this.s.loc(at.node);
    if (path[0] === 'theme') {
      const themePath = path.slice(1);
      const value = themePath.length
        ? lookup(this.s.values.theme, themePath)
        : undefined;
      return value === undefined
        ? { k: 'theme', path: themePath, loc }
        : { k: 'theme', path: themePath, value, loc };
    }
    if (path.length === 1) return { k: 'prop', name: path[0], loc };
    return this.unknown(at, path.length ? 'nested prop' : 'the props object');
  }

  private constRead(source: ConstSource, path: string[], at: NodePath): Read {
    const { values } = this.s;
    let value: string | undefined;
    if (path.length) {
      if (source === 'colors') value = lookup(values.colors, path);
      else if (source === 'bo') value = lookup(values.bo, path);
      else if (source === 'viewportWidths') {
        value = lookup(values.viewportWidths, path);
      } else if (source === 'fontSizes') {
        value = lookup(values.theme, ['fontSizes', ...path]);
      } else if (values.defs[`stylingConsts.${path.join('.')}`]) {
        // stylingConsts is spread last into the theme: its own keys only.
        value = lookup(values.theme, path);
      }
    }
    const loc = this.s.loc(at.node);
    return value === undefined
      ? { k: 'const', source, path, loc }
      : { k: 'const', source, path, value, loc };
  }

  // -------------------------------------------------------------------------
  // Expressions

  read(p: NodePath, st: St): Read {
    if (++this.count > BUDGET) throw new TooLarge();
    if (WRAPPERS.has(p.node.type)) {
      return this.read(p.get('expression') as NodePath, st);
    }
    const node: any = p.node;
    const value: St = { env: st.env, out: false, stmt: false, fn: false };
    switch (node.type) {
      case 'StringLiteral':
        if (st.fn && st.out && st.stmt && node.value !== '') {
          return {
            k: 'template',
            id: this.s.stringTemplate(p),
            loc: this.s.loc(node),
          };
        }
        return this.textRead(node.value, node);
      case 'NumericLiteral':
        return {
          k: 'literal',
          value: String(node.value),
          loc: this.s.loc(node),
        };
      case 'BooleanLiteral':
      case 'NullLiteral':
        return this.falsish(p, st);
      case 'TemplateLiteral':
        return this.templateLiteral(p, st);
      case 'Identifier':
        return this.identifier(p, st);
      case 'MemberExpression':
      case 'OptionalMemberExpression':
        return this.member(p, st);
      case 'LogicalExpression':
        return this.logical(p, st);
      case 'ConditionalExpression':
        return {
          k: 'cond',
          test: this.read(p.get('test') as NodePath, value),
          then: this.read(p.get('consequent') as NodePath, st),
          else: this.read(p.get('alternate') as NodePath, st),
          loc: this.s.loc(node),
        };
      case 'UnaryExpression':
        if (node.operator === '!') {
          return {
            k: 'not',
            left: this.read(p.get('argument') as NodePath, value),
            loc: this.s.loc(node),
          };
        }
        if (node.operator === '-' && node.argument.type === 'NumericLiteral') {
          return {
            k: 'literal',
            value: String(-node.argument.value),
            loc: this.s.loc(node),
          };
        }
        return this.unknown(p);
      case 'BinaryExpression':
        return this.binary(p, st);
      case 'CallExpression':
        return this.call(p, st);
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
        // flatten calls a function it receives with the props.
        return st.out ? this.styleFunction(p, st) : this.unknown(p, 'function');
      case 'TaggedTemplateExpression': {
        const id = this.s.taggedId(node);
        return id
          ? { k: 'template', id, loc: this.s.loc(node) }
          : this.unknown(p, 'tagged template');
      }
      default:
        return this.unknown(p);
    }
  }

  // false / null / undefined: flatten drops them to ''; elsewhere unknown.
  private falsish(p: NodePath, st: St): Read {
    const node: any = p.node;
    if (st.out && !(node.type === 'BooleanLiteral' && node.value)) {
      return { k: 'literal', value: '', loc: this.s.loc(node) };
    }
    if (st.out) return { k: 'literal', value: 'true', loc: this.s.loc(node) };
    return this.unknown(p);
  }

  private templateLiteral(p: NodePath, st: St): Read {
    const node: any = p.node;
    if (st.fn && st.out && st.stmt) {
      return {
        k: 'template',
        id: this.s.stringTemplate(p),
        loc: this.s.loc(node),
      };
    }
    const exprs = p.get('expressions') as NodePath[];
    if (exprs.length === 0) {
      return this.textRead(node.quasis[0].value.cooked ?? '', node.quasis[0]);
    }
    const value: St = { env: st.env, out: false, stmt: false, fn: false };
    const parts: Read[] = [];
    node.quasis.forEach((q: any, k: number) => {
      const cooked: string = q.value.cooked ?? '';
      if (cooked) {
        parts.push(
          ...(HAS_TOKEN.test(cooked)
            ? this.textParts(cooked, q)
            : [{ k: 'literal' as const, value: cooked, loc: this.s.loc(q) }])
        );
      }
      if (k < exprs.length) parts.push(this.read(exprs[k], value));
    });
    return { k: 'concat', parts, loc: this.s.loc(node) };
  }

  private logical(p: NodePath, st: St): Read {
    const op = (p.node as any).operator;
    const items: NodePath[] = [];
    const collect = (q: NodePath) => {
      const u = unwrap(q);
      if (u.isLogicalExpression() && u.node.operator === op) {
        collect(u.get('left'));
        collect(u.get('right'));
      } else items.push(q);
    };
    collect(p);
    return {
      k: op === '||' ? 'or' : op === '&&' ? 'and' : 'nullish',
      items: items.map((q) => this.read(q, st)),
      loc: this.s.loc(p.node),
    };
  }

  private binary(p: NodePath, st: St): Read {
    const node: any = p.node;
    const value: St = { env: st.env, out: false, stmt: false, fn: false };
    if (node.operator === '===' || node.operator === '!==') {
      return {
        k: node.operator === '===' ? 'eq' : 'neq',
        left: this.read(p.get('left') as NodePath, value),
        right: this.read(p.get('right') as NodePath, value),
        loc: this.s.loc(node),
      };
    }
    // String `+`: one operand is a string, so it concatenates.
    if (node.operator === '+' && isStringy(node)) {
      const parts: Read[] = [];
      const collect = (q: NodePath) => {
        const u = unwrap(q);
        if (
          u.isBinaryExpression() &&
          u.node.operator === '+' &&
          isStringy(u.node)
        ) {
          collect(u.get('left') as NodePath);
          collect(u.get('right') as NodePath);
        } else parts.push(this.read(q, value));
      };
      collect(p);
      return { k: 'concat', parts, loc: this.s.loc(node) };
    }
    return this.unknown(p);
  }

  // -------------------------------------------------------------------------
  // Bindings and member chains

  private identifier(p: NodePath, st: St): Read {
    const name = (p.node as any).name;
    const b = p.scope.getBinding(name);
    if (!b) {
      return name === 'undefined'
        ? this.falsish(p, st)
        : this.unknown(p, 'global');
    }
    const bound = st.env.get(b.identifier);
    if (bound)
      return 'props' in bound ? this.propsRead(bound.props, p) : bound.read;
    if (b.kind === 'param') return this.unknown(p, 'parameter');
    if (b.kind === 'module') return this.imported(p, b, []);
    const source = this.s.localSource?.(b);
    if (source) return this.constRead(source, [], p);
    if (b.path.isFunctionDeclaration()) {
      return st.out
        ? this.styleFunction(b.path, st)
        : this.unknown(p, 'function');
    }
    const init = constInit(b);
    if (init) {
      if (isFunction(unwrap(init))) {
        return st.out
          ? withHops(this.styleFunction(unwrap(init), st), [this.hop(b)])
          : this.unknown(p, 'function');
      }
      return this.follow(b, init, st);
    }
    const pattern = patternInit(b);
    if (pattern)
      return this.guarded(b, () =>
        this.chainRead(pattern.init, pattern.keys, p, st)
      );
    return this.unknown(p);
  }

  private guarded(b: any, f: () => Read): Read {
    const key = b.identifier;
    if (this.stack.has(key)) return this.unknown(b.path, 'cycle');
    this.stack.add(key);
    try {
      return withHops(f(), [this.hop(b)]);
    } finally {
      this.stack.delete(key);
    }
  }

  private follow(b: any, init: NodePath, st: St): Read {
    return this.guarded(b, () => this.read(init, st));
  }

  private imported(at: NodePath, b: any, keys: string[]): Read {
    const ref = importRef(b);
    if (!ref) return this.unknown(at);
    const m = this.s.importOf(ref.spec, ref.imported);
    if (m.kind === 'const') return this.constRead(m.source, keys, at);
    if (m.kind === 'template' && keys.length === 0) {
      return { k: 'template', id: m.id, loc: this.s.loc(at.node) };
    }
    return this.unknown(at, `import from '${ref.spec}'`);
  }

  // `a.b['c']`: the base and the static keys, or undefined.
  private chain(p: NodePath): { base: NodePath; keys: string[] } | undefined {
    const keys: string[] = [];
    let q = unwrap(p);
    while (q.isMemberExpression() || q.isOptionalMemberExpression()) {
      const node: any = q.node;
      let key: string | undefined;
      if (!node.computed && node.property.type === 'Identifier') {
        key = node.property.name;
      } else if (node.computed && node.property.type === 'StringLiteral') {
        key = node.property.value;
      } else if (node.computed && node.property.type === 'NumericLiteral') {
        key = String(node.property.value);
      }
      if (key === undefined) return undefined;
      keys.unshift(key);
      q = unwrap(q.get('object') as NodePath);
    }
    return { base: q, keys };
  }

  private member(p: NodePath, st: St): Read {
    const c = this.chain(p);
    if (!c) return this.unknown(p, 'computed member');
    return this.chainRead(c.base, c.keys, p, st);
  }

  // The path into the props an expression stands for, if it is one.
  private propsPath(p: NodePath, st: St): string[] | undefined {
    const u = unwrap(p);
    if (u.isIdentifier()) {
      const b = u.scope.getBinding(u.node.name);
      if (!b) return undefined;
      const bound = st.env.get(b.identifier);
      if (bound) return 'props' in bound ? bound.props : undefined;
      const init = constInit(b);
      const pattern = init ? { init, keys: [] } : patternInit(b);
      if (!pattern || this.stack.has(b.identifier)) return undefined;
      this.stack.add(b.identifier);
      try {
        const base = this.propsPath(pattern.init, st);
        return base && [...base, ...pattern.keys];
      } finally {
        this.stack.delete(b.identifier);
      }
    }
    if (u.isMemberExpression() || u.isOptionalMemberExpression()) {
      const c = this.chain(u);
      if (!c || c.keys.length === 0) return undefined;
      const base = this.propsPath(c.base, st);
      return base && [...base, ...c.keys];
    }
    return undefined;
  }

  // `base.k1.k2…` (keys may be []), read at `at`.
  private chainRead(
    base: NodePath,
    keys: string[],
    at: NodePath,
    st: St
  ): Read {
    if (keys.length === 0) return this.read(base, st);
    const props = this.propsPath(base, st);
    if (props) return this.propsRead([...props, ...keys], at);
    const u = unwrap(base);
    if (u.isIdentifier()) {
      const b = u.scope.getBinding(u.node.name);
      if (!b) return this.unknown(at, 'global');
      if (b.kind === 'module') return this.imported(at, b, keys);
      const source = this.s.localSource?.(b);
      if (source) return this.constRead(source, keys, at);
      if (b.kind === 'param') return this.unknown(at, 'parameter');
    }
    const obj = this.entries(base, st, true);
    if (!obj) return this.unknown(at);
    return this.entryRead(obj, keys, at, st);
  }

  private entryRead(obj: Entries, keys: string[], at: NodePath, st: St): Read {
    const e = obj.map.get(keys[0]);
    if (!e) return this.unknown(at, obj.open ? 'open object' : 'no such key');
    if (!e.value) return this.unknown(e.uncertain ?? at, 'may be overridden');
    if (keys.length === 1) return withHops(this.read(e.value, st), e.hops);
    const inner = this.entries(e.value, st, true);
    if (!inner) return this.unknown(at);
    return this.entryRead(
      {
        ...inner,
        map: new Map(
          [...inner.map].map(([k, v]) => [
            k,
            { ...v, hops: [...e.hops, ...v.hops] },
          ])
        ),
      },
      keys.slice(1),
      at,
      st
    );
  }

  /**
   * The entries of the object literal `p` stands for (through consts, any
   * scope), or undefined. With `hop`, a const followed is recorded on each
   * entry.
   */
  private entries(p: NodePath, st: St, hop: boolean): Entries | undefined {
    const u = unwrap(p);
    if (u.isIdentifier()) {
      const b = u.scope.getBinding(u.node.name);
      const init = constInit(b);
      if (!b || !init || this.stack.has(b.identifier)) return undefined;
      this.stack.add(b.identifier);
      try {
        const inner = this.entries(init, st, true);
        if (!inner || !hop) return inner;
        const h = this.hop(b);
        return {
          ...inner,
          map: new Map(
            [...inner.map].map(([k, v]) => [k, { ...v, hops: [h, ...v.hops] }])
          ),
        };
      } finally {
        this.stack.delete(b.identifier);
      }
    }
    if (!u.isObjectExpression()) return undefined;
    const map = new Map<string, Entry>();
    let open = false;
    const unsettle = (at: NodePath) => {
      [...map.keys()].forEach((k) => map.set(k, { hops: [], uncertain: at }));
      open = true;
    };
    (u.get('properties') as NodePath[]).forEach((prop) => {
      const node: any = prop.node;
      if (prop.isSpreadElement()) {
        const inner = this.entries(prop.get('argument'), st, true);
        if (!inner) unsettle(prop);
        else {
          if (inner.open) unsettle(prop);
          inner.map.forEach((v, k) => map.set(k, v));
        }
        return;
      }
      if (node.computed) {
        unsettle(prop);
        return;
      }
      const key =
        node.key.type === 'Identifier'
          ? node.key.name
          : node.key.type === 'StringLiteral' ||
            node.key.type === 'NumericLiteral'
          ? String(node.key.value)
          : undefined;
      if (key === undefined) unsettle(prop);
      else if (prop.isObjectProperty()) {
        map.set(key, { value: prop.get('value') as NodePath, hops: [] });
      } else map.set(key, { hops: [], uncertain: prop });
    });
    return { map, open, at: u };
  }

  // -------------------------------------------------------------------------
  // Calls

  private call(p: NodePath, st: St): Read {
    const node: any = p.node;
    const callee = p.get('callee') as NodePath;
    const args = p.get('arguments') as NodePath[];
    const value: St = { env: st.env, out: false, stmt: false, fn: false };

    if (args.length === 2 && this.isLodashGet(callee)) {
      const r = this.lodashGet(p, args[0], args[1], st);
      if (r) return r;
    }

    const argReads = () =>
      args.map((a) =>
        a.isSpreadElement() ? this.unknown(a, 'spread') : this.read(a, value)
      );
    const fn = this.sameFileFunction(callee);
    if (fn) {
      const reads = argReads();
      const env: Env = new Map(st.env);
      const first = args[0];
      if (first && !first.isSpreadElement()) {
        const props = this.propsPath(first, st);
        bindParam(fn.path, props ? { props } : { read: reads[0] }, env);
      }
      return {
        k: 'call',
        callee: fn.name,
        args: reads,
        returns: this.body(fn.path, { ...st, env, brk: undefined }),
        loc: this.s.loc(node),
      };
    }
    return {
      k: 'call',
      callee: this.text(callee),
      args: argReads(),
      loc: this.s.loc(node),
    };
  }

  private isLodashGet(callee: NodePath): boolean {
    const u = unwrap(callee);
    if (!u.isIdentifier()) return false;
    const ref = importRef(u.scope.getBinding(u.node.name));
    if (!ref) return false;
    if (ref.spec === 'lodash' || ref.spec === 'lodash-es') {
      return ref.imported === 'get';
    }
    return (
      (ref.spec === 'lodash/get' || ref.spec === 'lodash-es/get') &&
      ref.imported === 'default'
    );
  }

  // lodash get: a map (rule 6), or the member chain of a static path.
  private lodashGet(
    p: NodePath,
    obj: NodePath,
    path: NodePath,
    st: St
  ): Read | undefined {
    const u: any = unwrap(path).node;
    let staticKeys: string[] | undefined;
    if (u.type === 'StringLiteral') staticKeys = u.value.split('.');
    else if (
      u.type === 'ArrayExpression' &&
      u.elements.every((e: any) => e?.type === 'StringLiteral')
    ) {
      staticKeys = u.elements.map((e: any) => e.value);
    }
    if (staticKeys) {
      if (staticKeys.some((k) => k === '' || /[[\]]/.test(k))) return undefined;
      return this.chainRead(obj, staticKeys, p, st);
    }
    // `${KEY}.field`
    if (
      u.type === 'TemplateLiteral' &&
      u.expressions.length === 1 &&
      u.quasis[0].value.cooked === '' &&
      /^\.[^.[\]]+$/.test(u.quasis[1].value.cooked ?? '')
    ) {
      const key = (unwrap(path).get('expressions') as NodePath[])[0];
      return this.mapRead(p, obj, key, u.quasis[1].value.cooked.slice(1), st);
    }
    // [KEY, 'field']
    if (
      u.type === 'ArrayExpression' &&
      u.elements.length === 2 &&
      u.elements[0] &&
      u.elements[0].type !== 'SpreadElement' &&
      u.elements[1]?.type === 'StringLiteral'
    ) {
      const key = (unwrap(path).get('elements') as NodePath[])[0];
      return this.mapRead(p, obj, key, u.elements[1].value, st);
    }
    return undefined;
  }

  private mapRead(
    p: NodePath,
    objPath: NodePath,
    keyPath: NodePath,
    field: string,
    st: St
  ): Read {
    const obj = this.entries(objPath, st, false);
    if (!obj) return this.unknown(p, 'not an object literal');
    if (obj.open) return this.unknown(p, 'open object');
    const table: Record<string, Read> = {};
    obj.map.forEach((e, key) => {
      if (!e.value) {
        table[key] = this.unknown(e.uncertain ?? objPath, 'may be overridden');
        return;
      }
      const entry = this.entries(e.value, st, true);
      if (!entry) {
        table[key] = this.unknown(e.value, 'not an object literal');
        return;
      }
      const f = entry.map.get(field);
      if (!f) {
        // Absent: undefined at run time, unless the entry may hold it.
        if (entry.open) table[key] = this.unknown(e.value, 'open object');
        return;
      }
      if (!f.value) {
        table[key] = this.unknown(f.uncertain ?? e.value, 'may be overridden');
        return;
      }
      table[key] = withHops(this.read(f.value, st), [...e.hops, ...f.hops]);
    });
    return {
      k: 'map',
      key: this.read(keyPath, {
        env: st.env,
        out: false,
        stmt: false,
        fn: false,
      }),
      field,
      table,
      loc: this.s.loc(p.node),
    };
  }

  private sameFileFunction(
    callee: NodePath
  ): { path: NodePath; name: string } | undefined {
    const u = unwrap(callee);
    if (!u.isIdentifier()) return undefined;
    const b = u.scope.getBinding(u.node.name);
    if (!b) return undefined;
    if (b.path.isFunctionDeclaration()) {
      return { path: b.path, name: u.node.name };
    }
    const init = constInit(b);
    if (init && isFunction(unwrap(init))) {
      return { path: unwrap(init), name: u.node.name };
    }
    return undefined;
  }

  // -------------------------------------------------------------------------
  // Function bodies (rule 1)

  /** A function flatten calls: its first parameter is the props. */
  styleFunction(fn: NodePath, st: St): Read {
    const env: Env = new Map(st.env);
    bindParam(fn, { props: [] }, env);
    return this.body(fn, { env, out: st.out, stmt: st.stmt, fn: true });
  }

  private body(fn: NodePath, st: St): Read {
    if (this.stack.has(fn.node)) return this.unknown(fn, 'recursive');
    this.stack.add(fn.node);
    try {
      const body = fn.get('body') as NodePath;
      if (!body.isBlockStatement()) return this.read(body, st);
      try {
        return this.seq(body.get('body'), st, () =>
          this.unknown(body, 'returns undefined')
        );
      } catch (e) {
        if (!(e instanceof Unsupported)) throw e;
        const line = e.at.node.loc?.start.line;
        return this.unknown(fn, `${e.at.node.type} at line ${line}`);
      }
    } finally {
      this.stack.delete(fn.node);
    }
  }

  private seq(stmts: NodePath[], st: St, after: () => Read): Read {
    for (let i = 0; i < stmts.length; i++) {
      const s = stmts[i];
      const rest = () => this.seq(stmts.slice(i + 1), st, after);
      if (s.isReturnStatement()) {
        return s.node.argument
          ? this.read(s.get('argument') as NodePath, st)
          : this.falsish(s, st);
      }
      if (s.isIfStatement()) {
        return {
          k: 'cond',
          test: this.read(s.get('test'), {
            env: st.env,
            out: false,
            stmt: false,
            fn: false,
          }),
          then: this.branch(s.get('consequent'), st, rest),
          else: s.node.alternate
            ? this.branch(s.get('alternate') as NodePath, st, rest)
            : rest(),
          loc: this.s.loc(s.node),
        };
      }
      if (s.isSwitchStatement()) return this.switchRead(s, st, rest);
      if (s.isBlockStatement()) return this.seq(s.get('body'), st, rest);
      if (s.isBreakStatement() && !s.node.label && st.brk) return st.brk();
      if (
        s.isVariableDeclaration() ||
        s.isFunctionDeclaration() ||
        s.isEmptyStatement() ||
        s.isTSTypeAliasDeclaration() ||
        s.isTSInterfaceDeclaration()
      ) {
        continue;
      }
      throw new Unsupported(s);
    }
    return after();
  }

  private branch(s: NodePath, st: St, rest: () => Read): Read {
    return s.isBlockStatement()
      ? this.seq(s.get('body'), st, rest)
      : this.seq([s], st, rest);
  }

  private switchRead(s: NodePath, st: St, rest: () => Read): Read {
    const node: any = s.node;
    const cases = s.get('cases') as NodePath[];
    const inner: St = { ...st, brk: rest };
    const from = (i: number) =>
      cases.slice(i).flatMap((c) => c.get('consequent') as NodePath[]);
    const out: { value: string; then: Read }[] = [];
    const seen = new Set<string>();
    let def: Read | undefined;
    cases.forEach((c, i) => {
      const test: any = (c.node as any).test;
      if (!test) {
        def = this.seq(from(i), inner, rest);
        return;
      }
      let v: string | undefined;
      if (test.type === 'StringLiteral' || test.type === 'NumericLiteral') {
        v = String(test.value);
      } else if (
        test.type === 'TemplateLiteral' &&
        test.expressions.length === 0
      ) {
        v = test.quasis[0].value.cooked;
      }
      if (v === undefined) throw new Unsupported(c);
      // A repeated case never matches: the first one does.
      if (seen.has(v)) return;
      seen.add(v);
      out.push({ value: v, then: this.seq(from(i), inner, rest) });
    });
    return {
      k: 'switch',
      on: this.read(s.get('discriminant') as NodePath, {
        env: st.env,
        out: false,
        stmt: false,
        fn: false,
      }),
      cases: out,
      default: def ?? rest(),
      loc: this.s.loc(node),
    };
  }
}

// `'a' + x`, `x + \`b\``, or a `+` chain with one.
const isStringy = (node: any): boolean => {
  while (WRAPPERS.has(node.type)) node = node.expression;
  if (node.type === 'StringLiteral' || node.type === 'TemplateLiteral')
    return true;
  return (
    node.type === 'BinaryExpression' &&
    node.operator === '+' &&
    (isStringy(node.left) || isStringy(node.right))
  );
};

/** Binds a function's first parameter (a name or an object pattern). */
export const bindParam = (fn: NodePath, bound: Bound, env: Env) => {
  const params = fn.get('params') as NodePath[];
  if (params.length) bindPattern(params[0].node, bound, env);
};

const bindPattern = (pattern: any, bound: Bound, env: Env) => {
  if (pattern.type === 'Identifier') {
    env.set(pattern, bound);
    return;
  }
  // Destructuring only takes keys of the props; defaults and rests are not
  // read (they leave the name unbound).
  if (pattern.type !== 'ObjectPattern' || !('props' in bound)) return;
  pattern.properties.forEach((prop: any) => {
    if (prop.type !== 'ObjectProperty' || prop.computed) return;
    const key =
      prop.key.type === 'Identifier' ? prop.key.name : String(prop.key.value);
    bindPattern(prop.value, { props: [...bound.props, key] }, env);
  });
};

/**
 * What expression `p` (a template's interpolation, or any expression in its
 * file) reads. Never throws: a read over its budget is `unknown`.
 */
export const readOf = (
  p: NodePath,
  scope: ReadScope,
  at: ReadAt = {}
): Read => {
  const reader = new Reader(scope);
  const st: St = {
    env: at.env ?? new Map(),
    out: !!at.out,
    stmt: !!at.stmt,
    fn: false,
  };
  try {
    return reader.read(p, st);
  } catch (e) {
    if (e instanceof TooLarge) return reader.unknown(p, 'too large to read');
    throw e;
  }
};

/**
 * The parameter bindings a template's own interpolations see: the first
 * parameter of every enclosing function that is a style function (one that
 * flatten calls with the props). Other parameters stay unbound (unknown).
 */
export const templateEnv = (
  p: NodePath,
  isStyleTemplate: (node: any) => boolean
): Env => {
  const env: Env = new Map();
  const memo = new Map<object, boolean>();
  let f = p.getFunctionParent();
  while (f) {
    if (isStyleFunction(f, isStyleTemplate, memo))
      bindParam(f, { props: [] }, env);
    f = f.parentPath?.getFunctionParent() ?? null;
  }
  return env;
};

// Climbs from an expression through the places that pass its value on as
// the value of the enclosing expression: parentheses, TS wrappers, the
// branches of `?:`, the operands of `||` `&&` `??`.
export const valueParent = (p: NodePath): NodePath => {
  let q = p;
  for (;;) {
    const parent = q.parentPath;
    if (!parent) return q;
    if (WRAPPERS.has(parent.node.type) || parent.isLogicalExpression())
      q = parent;
    else if (parent.isConditionalExpression() && q.key !== 'test') q = parent;
    else return q;
  }
};

/** Whether expression `p` is an interpolation of a style template. */
const isStyleHole = (p: NodePath, isStyleTemplate: (node: any) => boolean) => {
  const v = valueParent(p);
  return (
    v.parentPath?.isTemplateLiteral() === true &&
    v.listKey === 'expressions' &&
    v.parentPath.parentPath?.isTaggedTemplateExpression() === true &&
    isStyleTemplate(v.parentPath.parentPath.node)
  );
};

/**
 * Whether flatten calls `fn` with the props: it is (or is returned by) an
 * interpolation of a style template, or it is a same-file, not exported
 * function every reference of which is such an interpolation or a call
 * passing the props of a style function on as the first argument.
 */
const isStyleFunction = (
  fn: NodePath,
  isStyleTemplate: (node: any) => boolean,
  memo: Map<object, boolean>
): boolean => {
  if (memo.has(fn.node)) return memo.get(fn.node) as boolean;
  memo.set(fn.node, false); // a cycle is not proof
  let result = false;
  const parent = fn.parentPath;
  let binding: any;
  if (fn.isFunctionDeclaration() && fn.node.id) {
    binding = fn.scope.parent?.getBinding(fn.node.id.name);
  } else if (
    parent?.isVariableDeclarator() &&
    parent.node.id.type === 'Identifier'
  ) {
    binding = parent.scope.getBinding(parent.node.id.name);
  }
  if (!binding) {
    // Inline: a hole of a style template, or returned by a style function.
    const v = valueParent(fn);
    if (isStyleHole(fn, isStyleTemplate)) result = true;
    else if (v.parentPath?.isArrowFunctionExpression() && v.key === 'body') {
      result = isStyleFunction(v.parentPath, isStyleTemplate, memo);
    } else if (v.parentPath?.isReturnStatement()) {
      const g = v.parentPath.getFunctionParent();
      result = !!g && isStyleFunction(g, isStyleTemplate, memo);
    }
  } else {
    const exported =
      binding.path.parentPath?.parentPath?.isExportNamedDeclaration() ||
      binding.path.parentPath?.isExportNamedDeclaration() ||
      binding.path.parentPath?.isExportDefaultDeclaration() ||
      binding.referencePaths.some(
        (r: NodePath) =>
          r.parentPath?.isExportSpecifier() ||
          r.parentPath?.isExportDefaultDeclaration()
      );
    result =
      !exported &&
      binding.referencePaths.length > 0 &&
      binding.referencePaths.every((r: NodePath) => {
        if (isStyleHole(r, isStyleTemplate)) return true;
        const call = r.parentPath;
        if (!call?.isCallExpression() || r.key !== 'callee') return false;
        const first: any = call.node.arguments[0];
        if (first?.type !== 'Identifier') return false;
        const g = call.getFunctionParent();
        const p0: any = g?.node.params[0];
        const b = call.scope.getBinding(first.name);
        return (
          !!g &&
          p0?.type === 'Identifier' &&
          b?.identifier === p0 &&
          isStyleFunction(g, isStyleTemplate, memo)
        );
      });
  }
  memo.set(fn.node, result);
  return result;
};
