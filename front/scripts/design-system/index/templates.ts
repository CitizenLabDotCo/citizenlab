/*
 * The style templates of one source file: every styled, css, global and
 * keyframes template, every call site of the styleUtils helpers (media.*``,
 * isRtl``), and every untagged template literal a style function returns
 * into CSS (kind string, such as getButtonStyle's at Button/index.tsx:400).
 * For each: its cooked quasis, its CSS declarations (cssDecls.ts) and, for
 * each interpolation, its shape and what it reads (reads.ts).
 *
 * Tags are recognised from imports of 'styled-components' only, by Babel
 * binding (an alias or a shadowing local is followed): its default `styled`
 * (`styled.x`, `styled(X)`, chained .attrs() and .withConfig(), TS type
 * arguments), `css`, `createGlobalStyle` and `keyframes`. The helpers are
 * `media` and `isRtl` imported from styleUtils. Any other tagged template is
 * an unknown tag.
 */
import traverseModule, { NodePath } from '@babel/traverse';

import { parseSource } from '../scan/findings';
import { LegacyValues, STYLE_UTILS_FILE } from '../scan/values';

import { declsOf, Locate } from './cssDecls';
import { Lines, rawOffsets } from './loc';
import {
  constInit,
  importRef,
  ImportMeaning,
  isConstSource,
  readOf,
  ReadAt,
  ReadScope,
  staticValue,
  templateEnv,
  unwrap,
} from './reads';
import { Expr, Read, Template, TemplateKind } from './schema';

// Interop: @babel/traverse is CJS with a `default` property under some loaders.
const traverse: typeof traverseModule =
  (traverseModule as unknown as { default?: typeof traverseModule }).default ??
  traverseModule;

/** A styleUtils helper: its wrapper template and the at-rules it adds. */
export type HelperInfo = { wrapper: string; atRules: string[] };

/** A tagged template a module exports (directly or through a const). */
export type ExportedTemplate = { id: string; kind: TemplateKind; tag?: string };

/** What the index knows of styleUtils.ts before reading any other file. */
export type StyleUtilsIndex = {
  /** 'media.phone', 'media.tablet', 'media.smallDesktop', 'media.desktop', 'isRtl' */
  helpers: Record<string, HelperInfo>;
  /** Its exported tagged templates by name ('focusRing', 'defaultInputStyle'). */
  exports: Record<string, ExportedTemplate>;
};

export type IndexContext = {
  values: LegacyValues;
  styleUtils: StyleUtilsIndex;
  /**
   * The file and export name an import names, after barrels (the scan's
   * Resolver). Without it, styleUtils imports are told by their specifier.
   */
  resolveImport?: (
    file: string,
    spec: string,
    imported: string
  ) => { file: string; name: string } | undefined;
  /** A tagged template another file exports (exportsOf). */
  exportedTemplate?: (
    file: string,
    name: string
  ) => ExportedTemplate | undefined;
};

export type UnknownTag = {
  file: string;
  line: number;
  col: number;
  tag: string;
};
export type FileIndex = { templates: Template[]; unknownTags: UnknownTag[] };

export const HELPERS = [
  'media.phone',
  'media.tablet',
  'media.smallDesktop',
  'media.desktop',
  'isRtl',
];
const MEDIA = ['phone', 'tablet', 'smallDesktop', 'desktop'];
const STYLE_UTILS_SPEC = /(^|\/)styleUtils$/;
const LIBRARY = '@citizenlab/cl2-component-library';

const WRAPPER_TYPES = new Set([
  'ParenthesizedExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
  'TSTypeAssertion',
  'TSInstantiationExpression',
]);
const unwrapNode = (n: any) => {
  while (WRAPPER_TYPES.has(n.type)) n = n.expression;
  return n;
};

/** What an identifier in a tag refers to. */
type TagRef = { sc?: string; helper?: 'media' | 'isRtl' };
type Classified = { kind: TemplateKind; tag?: string } | { unknown: string };

const classify = (
  tagNode: any,
  refOf: (id: any) => TagRef,
  text: (n: any) => string
): Classified => {
  const t = unwrapNode(tagNode);
  let base = t;
  while (
    base.type === 'CallExpression' &&
    base.callee.type === 'MemberExpression' &&
    !base.callee.computed &&
    base.callee.property.type === 'Identifier' &&
    (base.callee.property.name === 'attrs' ||
      base.callee.property.name === 'withConfig')
  ) {
    base = unwrapNode(base.callee.object);
  }
  if (
    base.type === 'MemberExpression' &&
    !base.computed &&
    base.object.type === 'Identifier' &&
    base.property.type === 'Identifier'
  ) {
    const r = refOf(base.object);
    if (r.sc === 'default') return { kind: 'styled', tag: base.property.name };
    if (
      r.helper === 'media' &&
      base === t &&
      MEDIA.includes(base.property.name)
    ) {
      return { kind: 'css', tag: `media.${base.property.name}` };
    }
  }
  if (
    base.type === 'CallExpression' &&
    base.callee.type === 'Identifier' &&
    base.arguments.length === 1 &&
    refOf(base.callee).sc === 'default'
  ) {
    const a = base.arguments[0];
    return {
      kind: 'styled',
      tag: a.type === 'StringLiteral' ? a.value : text(a),
    };
  }
  if (t.type === 'Identifier') {
    const r = refOf(t);
    if (r.sc === 'css') return { kind: 'css' };
    if (r.sc === 'createGlobalStyle') return { kind: 'global' };
    if (r.sc === 'keyframes') return { kind: 'keyframes' };
    if (r.helper === 'isRtl') return { kind: 'css', tag: 'isRtl' };
  }
  return { unknown: text(tagNode) };
};

const isHelperSpec = (spec: string) =>
  STYLE_UTILS_SPEC.test(spec) || spec === LIBRARY;

// The name of a function: its declaration, the const it is bound to, or
// `object.key` for a property of a const object (media.phone).
const functionName = (fn: NodePath | null): string | undefined => {
  if (!fn) return undefined;
  if (fn.isFunctionDeclaration()) return fn.node.id?.name;
  let q: NodePath = fn;
  while (q.parentPath && WRAPPER_TYPES.has(q.parentPath.node.type))
    q = q.parentPath;
  const parent = q.parentPath;
  if (parent?.isVariableDeclarator() && parent.node.id.type === 'Identifier') {
    return parent.node.id.name;
  }
  if (parent?.isObjectProperty() && !parent.node.computed) {
    const key: any = parent.node.key;
    const k = key.type === 'Identifier' ? key.name : String(key.value);
    const obj = parent.parentPath;
    const decl = obj?.parentPath;
    if (decl?.isVariableDeclarator() && decl.node.id.type === 'Identifier') {
      return `${decl.node.id.name}.${k}`;
    }
    return k;
  }
  return undefined;
};

// A tagged template's name: the const it is bound to, or the function that
// returns it directly (an arrow's body or a return statement).
const nameOf = (p: NodePath): string | undefined => {
  let q = p;
  while (q.parentPath && WRAPPER_TYPES.has(q.parentPath.node.type))
    q = q.parentPath;
  const parent = q.parentPath;
  if (
    parent?.isVariableDeclarator() &&
    q.key === 'init' &&
    parent.node.id.type === 'Identifier'
  ) {
    return parent.node.id.name;
  }
  if (parent?.isArrowFunctionExpression() && q.key === 'body') {
    return functionName(parent);
  }
  if (parent?.isReturnStatement())
    return functionName(parent.getFunctionParent());
  return undefined;
};

const STMT_HOLE = /^\$\{(\d+)\}$/;

/**
 * The index of one file. Pure: the source and the context in, the templates
 * (sorted by position) and the unknown tags out. Throws only on a syntax
 * error.
 */
export const indexFile = (
  file: string,
  source: string,
  ctx: IndexContext,
  ast: any = parseSource(file, source)
): FileIndex => {
  const lines = new Lines(source);
  const loc = (n: any) => lines.loc(n.start, n.end);
  const text = (n: any) => source.slice(n.start, n.end);
  const isStyleUtils = file === STYLE_UTILS_FILE;

  let program: NodePath | undefined;
  const tagged: NodePath[] = [];
  traverse(ast, {
    Program(p) {
      program = p;
    },
    TaggedTemplateExpression(p) {
      tagged.push(p);
    },
  });

  const meanings = new Map<string, ImportMeaning>();
  const importOf = (spec: string, imported: string): ImportMeaning => {
    const key = `${spec}\u0000${imported}`;
    let m = meanings.get(key);
    if (!m) {
      m = meaningOf(file, spec, imported, ctx);
      meanings.set(key, m);
    }
    return m;
  };

  // In styleUtils.ts itself, its own top-level objects and helpers.
  const topLevelConst = (b: any) =>
    isStyleUtils &&
    b?.kind === 'const' &&
    b.scope.path === program &&
    constInit(b) !== undefined;

  const refAt =
    (scope: any) =>
    (id: any): TagRef => {
      const b = scope.getBinding(id.name);
      const ref = importRef(b);
      if (ref?.spec === 'styled-components') return { sc: ref.imported };
      if (ref) {
        const m = importOf(ref.spec, ref.imported);
        return m.kind === 'helper' ? { helper: m.name } : {};
      }
      if (topLevelConst(b) && (id.name === 'media' || id.name === 'isRtl')) {
        return { helper: id.name };
      }
      return {};
    };

  const templates: Template[] = [];
  const byNode = new Map<any, Template>();
  const styleNodes = new Set<any>();
  const unknownTags: UnknownTag[] = [];
  const pending: { t: Template; path: NodePath; style: boolean }[] = [];

  // Source offsets of a quasi's cooked text.
  const rawOf = (node: any): { start: number; offsets: number[] } =>
    node.type === 'TemplateElement'
      ? { start: node.start, offsets: rawOffsets(node.value.raw) }
      : {
          start: node.start + 1,
          offsets: rawOffsets(
            (node.extra?.raw ?? JSON.stringify(node.value)).slice(1, -1)
          ),
        };

  const make = (
    kind: TemplateKind,
    lit: any,
    tag: string | undefined,
    name: string | undefined
  ): Template => {
    const l = loc(lit);
    const isTemplate = lit.type === 'TemplateLiteral';
    const quasiNodes: any[] = isTemplate ? lit.quasis : [lit];
    const exprNodes: any[] = isTemplate ? lit.expressions : [];
    const raws = quasiNodes.map(rawOf);
    const offset = (place: any): number =>
      'hole' in place
        ? place.end
          ? exprNodes[place.hole].end
          : exprNodes[place.hole].start
        : raws[place.quasi].start +
          raws[place.quasi].offsets[
            Math.min(place.offset, raws[place.quasi].offsets.length - 1)
          ];
    const locate: Locate = (from, to) => lines.loc(offset(from), offset(to));
    const quasis: string[] = isTemplate
      ? lit.quasis.map((q: any) => q.value.cooked ?? '')
      : [lit.value];
    const helper =
      tag && HELPERS.includes(tag) ? ctx.styleUtils.helpers[tag] : undefined;
    const decls = declsOf(quasis, locate).map((d) =>
      helper ? { ...d, atRules: [...helper.atRules, ...d.atRules] } : d
    );
    const t: Template = {
      id: `${file}:${l.line}:${l.col}`,
      file,
      loc: l,
      kind,
      ...(tag !== undefined && { tag }),
      ...(name !== undefined && { name }),
      quasis,
      exprs: [],
      decls,
    };
    templates.push(t);
    return t;
  };

  tagged.forEach((p) => {
    const node: any = p.node;
    const c = classify(node.tag, refAt(p.scope), text);
    if ('unknown' in c) {
      const at = lines.at(node.start);
      unknownTags.push({ file, line: at.line, col: at.col, tag: c.unknown });
      return;
    }
    const t = make(c.kind, node.quasi, c.tag, nameOf(p));
    byNode.set(node, t);
    styleNodes.add(node);
    pending.push({ t, path: p.get('quasi') as NodePath, style: true });
  });

  const scope: ReadScope = {
    source,
    values: ctx.values,
    loc,
    textLoc: (node, from, to) => {
      const r = rawOf(node);
      return lines.loc(r.start + r.offsets[from], r.start + r.offsets[to]);
    },
    importOf,
    localSource: (b) =>
      topLevelConst(b) && isConstSource(b.identifier.name)
        ? b.identifier.name
        : undefined,
    taggedId: (node) =>
      styleNodes.has(node) ? byNode.get(node)?.id : undefined,
    stringTemplate: (path) => {
      const known = byNode.get(path.node);
      if (known) return known.id;
      const t = make(
        'string',
        path.node,
        undefined,
        functionName(path.getFunctionParent())
      );
      byNode.set(path.node, t);
      pending.push({ t, path, style: false });
      return t.id;
    },
  };

  const isStyle = (node: any) => styleNodes.has(node);
  while (pending.length) {
    const { t, path, style } = pending.shift() as (typeof pending)[number];
    const env = templateEnv(path, isStyle);
    const stmt = new Set(
      t.decls
        .filter((d) => d.value.length === 0 && STMT_HOLE.test(d.prop))
        .map((d) => Number(STMT_HOLE.exec(d.prop)?.[1]))
    );
    const exprPaths = path.isTemplateLiteral()
      ? (path.get('expressions') as NodePath[])
      : [];
    t.exprs = exprPaths.map((e, n) =>
      exprOf(e, { env, out: style, stmt: stmt.has(n) })
    );
  }

  // The shape of an interpolation: what it is to styled-components' flatten.
  function exprOf(e: NodePath, at: ReadAt): Expr {
    const read: Read = readOf(e, scope, at);
    const base = { loc: loc(e.node), text: text(e.node) };
    const target = targetOf(e);
    if (target.fn) return { ...base, shape: 'fn', read };
    const tpl = target.tagged ? byNode.get(target.tagged) : undefined;
    const m = target.meaning;
    const kind = tpl
      ? tpl.kind
      : m?.kind === 'template'
      ? m.template
      : undefined;
    const id = tpl ? tpl.id : m?.kind === 'template' ? m.id : undefined;
    const tag = tpl ? tpl.tag : m?.kind === 'template' ? m.tag : undefined;
    if (id && tag && HELPERS.includes(tag)) {
      const wrapper = ctx.styleUtils.helpers[tag]?.wrapper;
      return {
        ...base,
        shape: 'helper',
        ...(wrapper && { wrapper }),
        slot: id,
        read,
      };
    }
    if (id && kind === 'css') return { ...base, shape: 'css', css: id, read };
    if (id && kind === 'styled') {
      return { ...base, shape: 'component', component: id, read };
    }
    if (!id) {
      const value = staticValue(read);
      if (value !== undefined) return { ...base, shape: 'value', value, read };
    }
    return { ...base, shape: 'unknown', read };
  }

  // What an interpolation is, through consts: a function, a tagged template
  // of this file, or an import.
  function targetOf(e: NodePath): {
    fn?: boolean;
    tagged?: any;
    meaning?: ImportMeaning;
  } {
    let q = unwrap(e);
    const seen = new Set<any>();
    for (;;) {
      if (q.isArrowFunctionExpression() || q.isFunctionExpression())
        return { fn: true };
      if (q.isTaggedTemplateExpression()) return { tagged: q.node };
      if (!q.isIdentifier()) return {};
      const b: any = q.scope.getBinding(q.node.name);
      if (!b || seen.has(b)) return {};
      seen.add(b);
      if (b.path.isFunctionDeclaration()) return { fn: true };
      const ref = importRef(b);
      if (ref) return { meaning: importOf(ref.spec, ref.imported) };
      const init = constInit(b);
      if (!init || scope.localSource?.(b)) return {};
      q = unwrap(init);
    }
  }

  templates.sort((a, b) => a.loc.start - b.loc.start);
  return { templates, unknownTags };
};

// What an import is to the index (see ImportMeaning).
const meaningOf = (
  file: string,
  spec: string,
  imported: string,
  ctx: IndexContext
): ImportMeaning => {
  const target = ctx.resolveImport?.(file, spec, imported);
  const fromStyleUtils = target
    ? target.file === STYLE_UTILS_FILE
    : isHelperSpec(spec);
  const name = target?.name ?? imported;
  if (fromStyleUtils) {
    if (isConstSource(name)) return { kind: 'const', source: name };
    if (name === 'media' || name === 'isRtl') return { kind: 'helper', name };
    const e = ctx.styleUtils.exports[name];
    if (e) return { kind: 'template', id: e.id, template: e.kind, tag: e.tag };
    return { kind: 'other' };
  }
  if (target) {
    const e = ctx.exportedTemplate?.(target.file, target.name);
    if (e) return { kind: 'template', id: e.id, template: e.kind, tag: e.tag };
  }
  return { kind: 'other' };
};

/** templatesOf(file, source, ctx): the templates of a file, by position. */
export const templatesOf = (
  file: string,
  source: string,
  ctx: IndexContext
): Template[] => indexFile(file, source, ctx).templates;

/**
 * The tagged templates a module exports, by exported name ('default' for a
 * default export): `export const X = styled.div```, `const X = css```
 * with `export { X }` or `export default X`. Read from the top level only,
 * with no other file; the ids are the ones indexFile gives.
 */
export const exportsOf = (
  file: string,
  ast: any,
  source: string
): Record<string, ExportedTemplate> => {
  const imports = new Map<string, { spec: string; imported: string }>();
  const body: any[] = ast.program.body;
  body.forEach((n) => {
    if (n.type !== 'ImportDeclaration') return;
    n.specifiers.forEach((sp: any) => {
      const imported =
        sp.type === 'ImportDefaultSpecifier'
          ? 'default'
          : sp.type === 'ImportNamespaceSpecifier'
          ? '*'
          : sp.imported.name ?? sp.imported.value;
      imports.set(sp.local.name, { spec: n.source.value, imported });
    });
  });
  const isStyleUtils = file === STYLE_UTILS_FILE;
  const refOf = (id: any): TagRef => {
    const r = imports.get(id.name);
    if (!r) {
      return isStyleUtils && (id.name === 'media' || id.name === 'isRtl')
        ? { helper: id.name }
        : {};
    }
    if (r.spec === 'styled-components') return { sc: r.imported };
    if (
      isHelperSpec(r.spec) &&
      (r.imported === 'media' || r.imported === 'isRtl')
    ) {
      return { helper: r.imported };
    }
    return {};
  };
  const text = (n: any) => source.slice(n.start, n.end);
  const templateOf = (init: any): ExportedTemplate | undefined => {
    const u = unwrapNode(init);
    if (u.type !== 'TaggedTemplateExpression') return undefined;
    const c = classify(u.tag, refOf, text);
    if ('unknown' in c) return undefined;
    const at = u.quasi.loc.start;
    return {
      id: `${file}:${at.line}:${at.column}`,
      kind: c.kind,
      ...(c.tag !== undefined && { tag: c.tag }),
    };
  };

  const local = new Map<string, ExportedTemplate>();
  const out: Record<string, ExportedTemplate> = {};
  const later: [string, string][] = []; // [exported, local]
  body.forEach((n) => {
    const decl = n.type === 'ExportNamedDeclaration' ? n.declaration : n;
    if (decl?.type === 'VariableDeclaration') {
      decl.declarations.forEach((d: any) => {
        if (d.id.type !== 'Identifier' || !d.init) return;
        const t = templateOf(d.init);
        if (!t) return;
        local.set(d.id.name, t);
        if (n.type === 'ExportNamedDeclaration') out[d.id.name] = t;
      });
    }
    if (n.type === 'ExportDefaultDeclaration') {
      if (n.declaration.type === 'Identifier') {
        later.push(['default', n.declaration.name]);
      } else {
        const t = templateOf(n.declaration);
        if (t) out.default = t;
      }
    }
    if (n.type === 'ExportNamedDeclaration' && !n.source) {
      (n.specifiers ?? []).forEach((sp: any) => {
        if (sp.type !== 'ExportSpecifier' || n.exportKind === 'type') return;
        later.push([sp.exported.name ?? sp.exported.value, sp.local.name]);
      });
    }
  });
  later.forEach(([exported, name]) => {
    const t = local.get(name);
    if (t) out[exported] = t;
  });
  return out;
};

/**
 * What every other file needs from styleUtils.ts: the helpers' wrapper
 * templates (with the at-rule a media wrapper puts around its slot, its
 * static holes filled in: '@media (max-width: 769px)') and its exported
 * tagged templates.
 */
export const styleUtilsOf = (
  source: string,
  values: LegacyValues
): StyleUtilsIndex => {
  const ast = parseSource(STYLE_UTILS_FILE, source);
  const { templates } = indexFile(
    STYLE_UTILS_FILE,
    source,
    { values, styleUtils: { helpers: {}, exports: {} } },
    ast
  );
  const helpers: Record<string, HelperInfo> = {};
  HELPERS.forEach((name) => {
    const t = templates.find(
      (x) => x.kind === 'css' && x.name === name && x.tag === undefined
    );
    if (!t) return;
    const slot = t.decls.find(
      (d) => d.value.length === 0 && STMT_HOLE.test(d.prop)
    );
    helpers[name] = {
      wrapper: t.id,
      atRules: (slot?.atRules ?? []).map((a) =>
        a.replace(/\$\{(\d+)\}/g, (m, n) => {
          const e = t.exprs[Number(n)];
          return e?.shape === 'value' && e.value !== undefined ? e.value : m;
        })
      ),
    };
  });
  return { helpers, exports: exportsOf(STYLE_UTILS_FILE, ast, source) };
};
