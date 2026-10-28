/*
 * files.json (the gallery's per-file counts): for every file with templates,
 * its templates, its declarations, and its DESIGN declarations by how their
 * value is traced. index.ts writes it from designCounts() below.
 *
 * A design declaration is one whose property (lowercased, as cssDecls.ts
 * gives it) is
 * - a colour: color, background, background-color, fill, stroke,
 *   border-color, border-*-color, outline-color, text-decoration-color;
 * - a space: padding*, margin*, gap, row-gap, column-gap (inset and
 *   top/right/bottom/left are not);
 * - a radius: border-radius, border-*-radius;
 * - type: font-size, font-weight, font-family, line-height, letter-spacing;
 * - a shadow: box-shadow;
 * - a border width: border-width, border-*-width;
 * - or a shorthand that holds one of these: border, border-top,
 *   border-right, border-bottom, border-left, outline, font, background.
 * A property with a hole is matched as written: `border-${0}-color` is a
 * colour, a lone `${0}` (a mixin, a conditional declaration) is none.
 *
 * Each design declaration gets one class:
 * 1. `token` when the static text of its value contains `var(--gv-`;
 * 2. otherwise, collect the leaves of the read of every expression in its
 *    value, recursively through or/and/nullish, the branches of cond and
 *    switch, the parts of concat, the entries of a map's table and the
 *    `returns` of a call (a `template` read, a call without `returns` and
 *    any other read count as unknown leaves); add `literal` when the value
 *    has no expression (static text only), and `unknown` when the property
 *    has a hole. The class is the first present in the order token (a token
 *    leaf) > legacy (a theme or const leaf) > literal > prop > unknown.
 */
import { Decl, DesignCounts, Read, Template } from './schema';

type DesignClass = keyof DesignCounts;
const ORDER: DesignClass[] = ['token', 'legacy', 'literal', 'prop', 'unknown'];

const DESIGN = [
  /^(color|background|background-color|fill|stroke|border-color|outline-color|text-decoration-color)$/,
  /^border-.+-color$/,
  /^(padding|margin)(-.+)?$/,
  /^(gap|row-gap|column-gap)$/,
  /^border-radius$/,
  /^border-.+-radius$/,
  /^(font-size|font-weight|font-family|line-height|letter-spacing)$/,
  /^box-shadow$/,
  /^border-width$/,
  /^border-.+-width$/,
  /^(border|border-top|border-right|border-bottom|border-left|outline|font|background)$/,
];

export const isDesignProp = (prop: string) =>
  DESIGN.some((re) => re.test(prop));

const leaves = (r: Read, out: Set<DesignClass>) => {
  switch (r.k) {
    case 'token':
      out.add('token');
      return;
    case 'theme':
    case 'const':
      out.add('legacy');
      return;
    case 'literal':
      out.add('literal');
      return;
    case 'prop':
      out.add('prop');
      return;
    case 'or':
    case 'and':
    case 'nullish':
      r.items.forEach((i) => leaves(i, out));
      return;
    case 'cond':
      leaves(r.then, out);
      leaves(r.else, out);
      return;
    case 'switch':
      r.cases.forEach((c) => leaves(c.then, out));
      if (r.default) leaves(r.default, out);
      return;
    case 'concat':
      r.parts.forEach((p) => leaves(p, out));
      return;
    case 'map':
      Object.values(r.table).forEach((t) => leaves(t, out));
      return;
    case 'call':
      if (r.returns) leaves(r.returns, out);
      else out.add('unknown');
      return;
    default:
      out.add('unknown');
  }
};

/** The class of a design declaration of `t`; undefined for any other. */
export const designClass = (d: Decl, t: Template): DesignClass | undefined => {
  if (!isDesignProp(d.prop)) return undefined;
  const text = d.value.filter((v) => typeof v === 'string').join('');
  if (text.includes('var(--gv-')) return 'token';
  const found = new Set<DesignClass>();
  const holes = d.value.filter((v): v is number => typeof v === 'number');
  holes.forEach((n) => leaves(t.exprs[n].read, found));
  if (holes.length === 0) found.add('literal');
  if (d.prop.includes('${')) found.add('unknown');
  return ORDER.find((c) => found.has(c)) ?? 'unknown';
};

/** The counts of one file's templates. */
export const designCounts = (
  templates: Template[]
): { templates: number; decls: number; design: DesignCounts } => {
  const design: DesignCounts = {
    token: 0,
    legacy: 0,
    literal: 0,
    prop: 0,
    unknown: 0,
  };
  let decls = 0;
  templates.forEach((t) =>
    t.decls.forEach((d) => {
      decls++;
      const c = designClass(d, t);
      if (c) design[c]++;
    })
  );
  return { templates: templates.length, decls, design };
};
