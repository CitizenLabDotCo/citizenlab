/*
 * What the legacy style reads render with the default theme, read statically
 * (never executed) from app/component-library/utils/styleUtils.ts: its
 * `colors`, `fontSizes`, `bo`, `stylingConsts` and `viewportWidths` objects,
 * and the theme getTheme() builds from them without a tenant. A legacy finding
 * carries the value its chain reaches here (see findings.ts). Every value also
 * has its definition place: the object property that wrote it, through
 * spreads (`defs`, used by the code index).
 */
import { parse } from '@babel/parser';
import traverseModule, { NodePath } from '@babel/traverse';

// Interop: @babel/traverse is CJS with a `default` property under some loaders.
const traverse: typeof traverseModule =
  (traverseModule as unknown as { default?: typeof traverseModule }).default ??
  traverseModule;

/** A static value: a string (a number as its decimal string), or a map. */
export type StaticValue = string | StaticMap;
export type StaticMap = { [key: string]: StaticValue };

/** Where a static value is written: the object property that set it. */
export type ValueDef = { file: string; line: number; col: number };

/**
 * `theme` mirrors getTheme() without a tenant: stylingConsts, fontSizes and
 * the colours that are not the tenant's (fontFamily and the tenant's style
 * depend on the city, so they have no value). `colors`, `bo` and
 * `viewportWidths` are the objects the component library exports.
 *
 * `defs` maps the dotted path of every value returned to the property that
 * wrote it, following spreads: 'theme.borderRadius' is stylingConsts'
 * `borderRadius` (getTheme spreads stylingConsts last), 'bo.borderRadius'
 * bo's own. Paths start with the map ('theme.', 'colors.', 'bo.',
 * 'viewportWidths.') or with the object read on its own ('fontSizes.',
 * 'stylingConsts.'). Lines are 1-based, columns 0-based.
 */
export type LegacyValues = {
  theme: StaticMap;
  colors: StaticMap;
  bo: StaticMap;
  viewportWidths: StaticMap;
  defs: Record<string, ValueDef>;
};

/** The file legacyValues reads, from front/. */
export const STYLE_UTILS_FILE = 'app/component-library/utils/styleUtils.ts';

// While evaluating, a value that is not static is UNKNOWN, so later keys and
// spreads override it as they would at run time; the maps returned leave it
// out. An object that may hold keys it does not list (after a spread of an
// unknown object, or a computed key) is `open`. `places` holds, per map, the
// source position of the property that wrote each key.
const UNKNOWN = Symbol('unknown');
type Value = string | typeof UNKNOWN | ValueMap;
type ValueMap = { [key: string]: Value };
type Place = { line: number; col: number };
type Ctx = {
  seen: Set<object>;
  open: WeakSet<ValueMap>;
  places: WeakMap<ValueMap, Map<string, Place>>;
};

const isMap = (v: Value): v is ValueMap => typeof v === 'object';

const placesOf = (map: ValueMap, ctx: Ctx): Map<string, Place> => {
  let p = ctx.places.get(map);
  if (!p) {
    p = new Map();
    ctx.places.set(map, p);
  }
  return p;
};

// `{ ...out, ...v }` in place. An unknown or open `v` may set any key, so no
// earlier key is certain after it.
const spread = (out: ValueMap, v: Value, ctx: Ctx) => {
  if (!isMap(v) || ctx.open.has(v)) {
    for (const key of Object.keys(out)) out[key] = UNKNOWN;
    placesOf(out, ctx).clear();
    ctx.open.add(out);
  }
  if (isMap(v)) {
    Object.assign(out, v);
    const from = placesOf(v, ctx);
    const to = placesOf(out, ctx);
    Object.keys(v).forEach((key) => {
      const place = from.get(key);
      if (place) to.set(key, place);
      else to.delete(key);
    });
  }
};

// The initialiser of `const name = ...` (or a never reassigned let/var) seen
// from `path`; undefined for anything else (imports, parameters, patterns).
const constInit = (path: NodePath, name: string): NodePath | undefined => {
  const binding = path.scope.getBinding(name);
  const decl = binding?.path;
  if (
    !binding?.constant ||
    !decl?.isVariableDeclarator() ||
    decl.node.id.type !== 'Identifier' ||
    !decl.node.init
  ) {
    return undefined;
  }
  return decl.get('init') as NodePath;
};

// The key of a non-computed property (`a`, `'a'`, `1`); undefined otherwise.
const keyOf = (prop: NodePath): string | undefined => {
  if (!prop.isObjectProperty() && !prop.isObjectMethod()) return undefined;
  const { key, computed } = prop.node;
  if (computed) return undefined;
  if (key.type === 'Identifier') return key.name;
  if (key.type === 'StringLiteral' || key.type === 'NumericLiteral') {
    return String(key.value);
  }
  return undefined;
};

const WRAPPERS = new Set([
  'ParenthesizedExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
  'TSTypeAssertion',
]);

/**
 * The static value of an expression. Object literals, spreads of constant
 * objects, constants, members of constant objects and templates of those are
 * followed here (Babel's evaluate() stops at spreads and members); anything
 * else is Babel's evaluate(), kept when confident and a string or a number.
 * `ctx.seen` breaks reference cycles.
 */
const evaluate = (path: NodePath, ctx: Ctx): Value => {
  if (WRAPPERS.has(path.node.type)) {
    return evaluate(path.get('expression') as NodePath, ctx);
  }

  if (path.isObjectExpression()) {
    const out: ValueMap = {};
    path.get('properties').forEach((prop) => {
      if (prop.isSpreadElement()) {
        spread(out, evaluate(prop.get('argument'), ctx), ctx);
        return;
      }
      const key = keyOf(prop);
      // A computed key may be any key.
      if (key === undefined) spread(out, UNKNOWN, ctx);
      else if (prop.isObjectProperty()) {
        out[key] = evaluate(prop.get('value') as NodePath, ctx);
        const start = prop.node.loc?.start;
        if (start) {
          placesOf(out, ctx).set(key, { line: start.line, col: start.column });
        }
      } else {
        out[key] = UNKNOWN;
        placesOf(out, ctx).delete(key);
      }
    });
    return out;
  }

  if (path.isIdentifier()) {
    const init = constInit(path, path.node.name);
    if (init) {
      if (ctx.seen.has(init.node)) return UNKNOWN;
      ctx.seen.add(init.node);
      const v = evaluate(init, ctx);
      ctx.seen.delete(init.node);
      return v;
    }
  }

  if (path.isMemberExpression()) {
    const object = evaluate(path.get('object'), ctx);
    if (isMap(object)) {
      const property = path.get('property') as NodePath;
      const key = path.node.computed
        ? evaluate(property, ctx)
        : property.isIdentifier()
        ? property.node.name
        : UNKNOWN;
      return typeof key === 'string' &&
        Object.prototype.hasOwnProperty.call(object, key)
        ? object[key]
        : UNKNOWN;
    }
  }

  if (path.isTemplateLiteral()) {
    const { quasis } = path.node;
    const expressions = path.get('expressions') as NodePath[];
    let out = '';
    for (let i = 0; i < quasis.length; i++) {
      const cooked = quasis[i].value.cooked;
      const v = i < expressions.length ? evaluate(expressions[i], ctx) : '';
      if (cooked == null || typeof v !== 'string') return UNKNOWN;
      out += cooked + v;
    }
    return out;
  }

  const r = path.evaluate();
  if (r.confident && typeof r.value === 'string') return r.value;
  if (r.confident && typeof r.value === 'number' && Number.isFinite(r.value)) {
    return String(r.value);
  }
  return UNKNOWN;
};

// The known part of a map, at any depth.
const known = (map: ValueMap): StaticMap => {
  const out: StaticMap = {};
  Object.entries(map).forEach(([key, v]) => {
    if (typeof v === 'string') out[key] = v;
    else if (isMap(v)) out[key] = known(v);
  });
  return out;
};

// The definition place of every known value of `map`, at any depth, under
// `prefix` + its dotted path.
const placesFor = (
  map: ValueMap,
  prefix: string,
  file: string,
  ctx: Ctx,
  out: Record<string, ValueDef>
) => {
  const places = placesOf(map, ctx);
  Object.entries(map).forEach(([key, v]) => {
    const place = places.get(key);
    if (typeof v === 'string' && place) {
      out[`${prefix}${key}`] = { file, line: place.line, col: place.col };
    } else if (isMap(v)) placesFor(v, `${prefix}${key}.`, file, ctx, out);
  });
};

/**
 * The value maps, from the source of styleUtils.ts. Throws when it does not
 * parse; an object it lacks or that is not an object literal reads as {}.
 * `file` is the path `defs` carry.
 */
export const legacyValues = (
  source: string,
  file: string = STYLE_UTILS_FILE
): LegacyValues => {
  const ast = parse(source, { sourceType: 'module', plugins: ['typescript'] });
  let program!: NodePath;
  traverse(ast, {
    Program(p) {
      program = p;
      p.stop();
    },
  });
  const ctx: Ctx = {
    seen: new Set(),
    open: new WeakSet(),
    places: new WeakMap(),
  };
  const named = (name: string): ValueMap => {
    const init = constInit(program, name);
    const v = init ? evaluate(init, ctx) : UNKNOWN;
    return isMap(v) ? v : {};
  };
  const colors = named('colors');
  const fontSizes = named('fontSizes');
  const stylingConsts = named('stylingConsts');
  const bo = named('bo');
  const viewportWidths = named('viewportWidths');
  // getTheme() sets the tenant colours per city, and spreads stylingConsts
  // last, so its keys win.
  const themeColors: ValueMap = Object.fromEntries(
    Object.entries(colors).filter(([key]) => !key.startsWith('tenant'))
  );
  // The filtered copy keeps the colours' places.
  Object.keys(themeColors).forEach((key) => {
    const place = placesOf(colors, ctx).get(key);
    if (place) placesOf(themeColors, ctx).set(key, place);
  });
  const theme: ValueMap = { colors: themeColors, fontSizes };
  spread(theme, stylingConsts, ctx);

  const defs: Record<string, ValueDef> = {};
  placesFor(theme, 'theme.', file, ctx, defs);
  placesFor(colors, 'colors.', file, ctx, defs);
  placesFor(bo, 'bo.', file, ctx, defs);
  placesFor(viewportWidths, 'viewportWidths.', file, ctx, defs);
  placesFor(fontSizes, 'fontSizes.', file, ctx, defs);
  placesFor(stylingConsts, 'stylingConsts.', file, ctx, defs);
  return {
    theme: known(theme),
    colors: known(colors),
    bo: known(bo),
    viewportWidths: known(viewportWidths),
    defs: Object.fromEntries(
      Object.keys(defs)
        .sort()
        .map((key) => [key, defs[key]])
    ),
  };
};

/**
 * The string at the end of `links` in `map`, or undefined: a missing key, a
 * map (not a value) or a link past a value.
 */
export const lookup = (map: StaticMap, links: string[]): string | undefined => {
  let v: StaticValue = map;
  for (const key of links) {
    if (
      typeof v !== 'object' ||
      !Object.prototype.hasOwnProperty.call(v, key)
    ) {
      return undefined;
    }
    v = v[key];
  }
  return typeof v === 'string' ? v : undefined;
};
