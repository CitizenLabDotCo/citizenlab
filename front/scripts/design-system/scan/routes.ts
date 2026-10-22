import fs from 'fs';
import path from 'path';

import { parseSource, ParsedFile } from './findings';
import { RouteRef } from './schema';

/*
 * Route mapping. The app's routes are TanStack `createRoute` calls spread over
 * `app/routes.tsx`, `app/containers/Admin/routes.tsx` and the per-area
 * `routes.tsx` files they import. The tree is read from `getParentRoute`
 * (the authoritative parent link), not from `addChildren`. A route's page is
 * what its `component` renders: `lazy(() => import(...))` targets, reached
 * directly or through a local component in the same file, plus static imports
 * of `containers/` or `modules/` files. A route's files are the transitive
 * import closure (static, re-export and dynamic imports) of its pages. The
 * closure never enters a route file, since route files import every page
 * (pages import them for link helpers).
 *
 * Module routes (`routes: { 'admin.tools': [...] }` in app/modules) are added
 * under the route that the area's factory hands to `parseModuleRoutes`, only
 * for the keys the route tree actually passes (`moduleRoutes['admin.tools']`).
 *
 * The root route (the App shell) is not a page: its files belong to no route
 * unless a page reaches them. Paths are joined with `/`, `$param` segments are
 * kept, the leading `$locale` segment is dropped (the shell prefixes `/en`).
 */

export const ROUTE_ROOTS = [
  'app/routes.tsx',
  'app/containers/Admin/routes.tsx',
];
const CODE_EXTS = ['.tsx', '.ts', '.jsx', '.js'];
const LIBRARY_ALIAS = '@citizenlab/cl2-component-library';

/** Scanned source: app code, without tests, stories, mocks and declarations. */
export const isScannedSource = (rel: string) =>
  /\.(tsx?|jsx?)$/.test(rel) &&
  !/\.d\.ts$/.test(rel) &&
  !/\.(test|spec|stories)\.[jt]sx?$/.test(rel) &&
  !/(^|\/)(__mocks__|__tests__)\//.test(rel);

const walkDir = (rootDir: string, rel: string, out: string[]) => {
  const entries = fs.readdirSync(path.join(rootDir, rel), {
    withFileTypes: true,
  });
  entries.forEach((e) => {
    if (e.name === 'node_modules' || e.name.startsWith('.')) return;
    const child = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walkDir(rootDir, child, out);
    else if (CODE_EXTS.some((x) => e.name.endsWith(x))) out.push(child);
  });
};

/** Every code file under app/ (tests included, for resolution), sorted. */
export const listCodeFiles = (rootDir: string): string[] => {
  const out: string[] = [];
  walkDir(rootDir, 'app', out);
  return out.sort();
};

export type ImportRef = {
  spec: string;
  line: number;
  dynamic: boolean;
  typeOnly: boolean;
  // Local name to imported name (`default`, `*` or the export name).
  names: { local: string; imported: string; typeOnly: boolean }[];
};

/** Plain recursive walk over a babel AST (faster than @babel/traverse). */
export const walk = (
  node: any,
  visit: (n: any, parent: any) => boolean | void,
  parent: any = null
) => {
  if (!node || typeof node.type !== 'string') return;
  if (visit(node, parent) === false) return;
  for (const key of Object.keys(node)) {
    if (
      key === 'loc' ||
      key === 'start' ||
      key === 'end' ||
      key === 'leadingComments' ||
      key === 'trailingComments' ||
      key === 'innerComments' ||
      key === 'extra'
    )
      continue;
    const v = node[key];
    if (Array.isArray(v)) v.forEach((c) => walk(c, visit, node));
    else if (v && typeof v.type === 'string') walk(v, visit, node);
  }
};

const isDynamicImport = (n: any) =>
  n.type === 'CallExpression' &&
  n.callee.type === 'Import' &&
  n.arguments[0]?.type === 'StringLiteral';

export const extractImports = (ast: ParsedFile): ImportRef[] => {
  const out: ImportRef[] = [];
  ast.program.body.forEach((n: any) => {
    if (n.type === 'ImportDeclaration') {
      const typeOnly = n.importKind === 'type';
      out.push({
        spec: n.source.value,
        line: n.loc.start.line,
        dynamic: false,
        typeOnly,
        names: n.specifiers.map((s: any) => ({
          local: s.local.name,
          imported:
            s.type === 'ImportDefaultSpecifier'
              ? 'default'
              : s.type === 'ImportNamespaceSpecifier'
              ? '*'
              : s.imported.name ?? s.imported.value,
          typeOnly: typeOnly || s.importKind === 'type',
        })),
      });
    } else if (
      (n.type === 'ExportNamedDeclaration' ||
        n.type === 'ExportAllDeclaration') &&
      n.source
    ) {
      out.push({
        spec: n.source.value,
        line: n.loc.start.line,
        dynamic: false,
        typeOnly: n.exportKind === 'type',
        names: [],
      });
    }
  });
  walk(ast.program, (n) => {
    if (isDynamicImport(n)) {
      out.push({
        spec: n.arguments[0].value,
        line: n.loc.start.line,
        dynamic: true,
        typeOnly: false,
        names: [],
      });
    }
  });
  return out;
};

/**
 * Resolves import specifiers the way the app's tsconfig does: relative to the
 * importing file, `@citizenlab/cl2-component-library` to app/component-library,
 * anything else against baseUrl `app/`. Bare packages (node_modules) and
 * non-code files resolve to undefined.
 */
export class Resolver {
  private files: Set<string>;
  private cache = new Map<string, string | undefined>();

  constructor(files: string[]) {
    this.files = new Set(files);
  }

  private probe(base: string): string | undefined {
    if (this.files.has(base)) return base;
    for (const ext of CODE_EXTS) {
      if (this.files.has(base + ext)) return base + ext;
    }
    for (const ext of CODE_EXTS) {
      if (this.files.has(`${base}/index${ext}`)) return `${base}/index${ext}`;
    }
    return undefined;
  }

  resolve(fromFile: string, spec: string): string | undefined {
    let base: string;
    if (spec.startsWith('.')) {
      base = path.posix.normalize(
        path.posix.join(path.posix.dirname(fromFile), spec)
      );
    } else if (spec === LIBRARY_ALIAS || spec.startsWith(`${LIBRARY_ALIAS}/`)) {
      base = `app/component-library${spec.slice(LIBRARY_ALIAS.length)}`;
    } else {
      base = `app/${spec}`;
    }
    if (this.cache.has(base)) return this.cache.get(base);
    const r = this.probe(base.replace(/\/$/, ''));
    this.cache.set(base, r);
    return r;
  }
}

/** Parses and caches files of one tree; shared by routes, usages and the CLI. */
export class SourceTree {
  readonly files: string[];
  readonly resolver: Resolver;
  private sources = new Map<string, string>();
  private asts = new Map<string, ParsedFile | null>();
  private imports = new Map<string, ImportRef[]>();
  readonly parseErrors = new Map<string, string>();

  constructor(readonly rootDir: string, files?: string[]) {
    this.files = files ?? listCodeFiles(rootDir);
    this.resolver = new Resolver(this.files);
  }

  source(rel: string): string {
    let s = this.sources.get(rel);
    if (s === undefined) {
      s = fs.readFileSync(path.join(this.rootDir, rel), 'utf8');
      this.sources.set(rel, s);
    }
    return s;
  }

  setSource(rel: string, source: string) {
    this.sources.set(rel, source);
    this.asts.delete(rel);
    this.imports.delete(rel);
  }

  /** The AST, or null when the file does not parse (recorded in parseErrors). */
  ast(rel: string): ParsedFile | null {
    if (!this.asts.has(rel)) {
      try {
        this.asts.set(rel, parseSource(rel, this.source(rel)));
      } catch (e: any) {
        this.parseErrors.set(rel, String(e?.message ?? e));
        this.asts.set(rel, null);
      }
    }
    return this.asts.get(rel) ?? null;
  }

  importsOf(rel: string): ImportRef[] {
    let r = this.imports.get(rel);
    if (!r) {
      const ast = this.ast(rel);
      r = ast ? extractImports(ast) : [];
      this.imports.set(rel, r);
    }
    return r;
  }

  /** Resolved app files this file depends on at runtime (no type imports). */
  depsOf(rel: string): string[] {
    const out: string[] = [];
    this.importsOf(rel).forEach((i) => {
      if (i.typeOnly) return;
      if (!i.dynamic && i.names.length > 0 && i.names.every((n) => n.typeOnly))
        return;
      const r = this.resolver.resolve(rel, i.spec);
      if (r) out.push(r);
    });
    return out;
  }

  /** Drop cached ASTs (keeps imports) to bound memory on the whole tree. */
  releaseAst(rel: string) {
    this.asts.delete(rel);
    this.sources.delete(rel);
  }
}

// ---------------------------------------------------------------------------
// Route files

type RouteDef = {
  id: string; // file#variable
  parent?: string; // id, resolved
  ownPath: string;
  entries: string[]; // page files
  root: boolean;
};

const isRouteFile = (rel: string) => /(^|\/)routes\.tsx?$/.test(rel);

const calleeName = (callee: any): string | undefined => {
  if (callee.type === 'Identifier') return callee.name;
  if (callee.type === 'MemberExpression' && !callee.computed)
    return callee.property.name;
  return undefined;
};

const normalizeSegment = (p: string) =>
  p
    .split('/')
    .filter((s) => s !== '')
    .map((s) => (s.startsWith(':') ? `$${s.slice(1)}` : s))
    .join('/');

const objProp = (obj: any, name: string) =>
  obj?.properties?.find(
    (p: any) =>
      p.type === 'ObjectProperty' &&
      !p.computed &&
      (p.key.name === name || p.key.value === name)
  )?.value;

type FileInfo = {
  file: string;
  strings: Map<string, Map<string, string>>; // enum / const object string members
  lazy: Map<string, string>; // local name -> resolved page file
  locals: Map<string, any>; // top-level non-route declarations by name
  imports: Map<string, { file?: string; imported: string }>;
  unresolvedLazy: string[]; // app-looking lazy specifiers with no file
};

const fileInfo = (tree: SourceTree, rel: string): FileInfo | undefined => {
  const ast = tree.ast(rel);
  if (!ast) return undefined;
  const info: FileInfo = {
    file: rel,
    strings: new Map(),
    lazy: new Map(),
    locals: new Map(),
    imports: new Map(),
    unresolvedLazy: [],
  };
  tree.importsOf(rel).forEach((i) => {
    if (i.dynamic) return;
    const file = tree.resolver.resolve(rel, i.spec);
    i.names.forEach((n) =>
      info.imports.set(n.local, { file, imported: n.imported })
    );
  });
  walk(ast.program, (n) => {
    if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier') {
      const init = n.init;
      if (
        init?.type === 'CallExpression' &&
        calleeName(init.callee) === 'lazy'
      ) {
        let spec: string | undefined;
        walk(init, (m) => {
          if (!spec && isDynamicImport(m)) spec = m.arguments[0].value;
        });
        const target = spec ? tree.resolver.resolve(rel, spec) : undefined;
        if (target) info.lazy.set(n.id.name, target);
        else if (spec && /^[./]|^(containers|components|modules)\//.test(spec))
          info.unresolvedLazy.push(spec);
        return false;
      }
      info.locals.set(n.id.name, init);
    }
    if (n.type === 'TSEnumDeclaration') {
      const members = new Map<string, string>();
      n.members.forEach((m: any) => {
        const key = m.id.name ?? m.id.value;
        if (m.initializer?.type === 'StringLiteral')
          members.set(key, m.initializer.value);
      });
      info.strings.set(n.id.name, members);
    }
    if (
      n.type === 'VariableDeclarator' &&
      n.id.type === 'Identifier' &&
      n.init?.type === 'ObjectExpression'
    ) {
      const members = new Map<string, string>();
      n.init.properties.forEach((p: any) => {
        if (p.type !== 'ObjectProperty' || p.computed) return;
        if (p.value.type === 'StringLiteral')
          members.set(p.key.name ?? p.key.value, p.value.value);
      });
      if (members.size) info.strings.set(n.id.name, members);
    }
    if (n.type === 'FunctionDeclaration' && n.id) {
      info.locals.set(n.id.name, n.body);
    }
    return undefined;
  });
  return info;
};

/** Page files a component expression renders. */
const entriesOf = (
  info: FileInfo,
  expr: any,
  isBoundary: (rel: string) => boolean,
  seen = new Set<string>()
): string[] => {
  const out = new Set<string>();
  const names = new Set<string>();
  walk(expr, (n, parent) => {
    if (n.type === 'JSXIdentifier' && parent?.type === 'JSXOpeningElement') {
      names.add(n.name);
    } else if (
      n.type === 'Identifier' &&
      !(parent?.type === 'MemberExpression' && parent.property === n) &&
      !(parent?.type === 'ObjectProperty' && parent.key === n)
    ) {
      names.add(n.name);
    }
  });
  names.forEach((name) => {
    if (seen.has(name)) return;
    seen.add(name);
    const lazy = info.lazy.get(name);
    if (lazy) {
      out.add(lazy);
      return;
    }
    const local = info.locals.get(name);
    if (local) {
      entriesOf(info, local, isBoundary, seen).forEach((e) => out.add(e));
      return;
    }
    const imp = info.imports.get(name);
    if (
      imp?.file &&
      /^app\/(containers|modules)\//.test(imp.file) &&
      !isBoundary(imp.file)
    ) {
      out.add(imp.file);
    }
  });
  return [...out].sort();
};

const collectRouteFiles = (tree: SourceTree): string[] => {
  const found = new Set<string>();
  const queue = ROUTE_ROOTS.filter((r) => tree.files.includes(r));
  while (queue.length) {
    const rel = queue.shift() as string;
    if (found.has(rel)) continue;
    found.add(rel);
    tree.depsOf(rel).forEach((d) => {
      if (isRouteFile(d) && !found.has(d)) queue.push(d);
    });
  }
  return [...found].sort();
};

/** A path option's string: literal, plain template, or enum/object member. */
const stringValue = (info: FileInfo, n: any): string | undefined => {
  if (!n) return undefined;
  if (n.type === 'StringLiteral') return n.value;
  if (n.type === 'TemplateLiteral' && n.expressions.length === 0)
    return n.quasis[0].value.cooked;
  if (
    n.type === 'MemberExpression' &&
    n.object.type === 'Identifier' &&
    (n.computed ? n.property.type === 'StringLiteral' : true)
  ) {
    const key = n.computed ? n.property.value : n.property.name;
    return info.strings.get(n.object.name)?.get(key);
  }
  return undefined;
};

const collectRouteDefs = (
  tree: SourceTree,
  routeFiles: string[],
  isBoundary: (rel: string) => boolean
) => {
  const defs = new Map<string, RouteDef>();
  // key -> parent route ids, from `factory(moduleRoutes['key'])` calls whose
  // factory hands its parameter to `parseModuleRoutes(param, someRoute)`.
  const moduleParents = new Map<string, string[]>();
  const moduleSinks = new Map<string, string>(); // file -> parent id
  const keyedCalls: { key: string; factoryFile: string }[] = [];
  const unresolvedPaths: string[] = [];
  const unresolvedImports: string[] = [];

  routeFiles.forEach((rel) => {
    const info = fileInfo(tree, rel);
    const ast = tree.ast(rel);
    if (!info || !ast) return;
    info.unresolvedLazy.forEach((spec) =>
      unresolvedImports.push(`${rel}: ${spec}`)
    );
    const resolveRef = (name: string): string | undefined => {
      if (info.locals.has(name)) return `${rel}#${name}`;
      const imp = info.imports.get(name);
      if (imp?.file) return `${imp.file}#${imp.imported}`;
      return undefined;
    };
    walk(ast.program, (n, parent) => {
      if (n.type !== 'CallExpression') return;
      const name = calleeName(n.callee);
      if (
        (name === 'createRoute' || name === 'createRootRoute') &&
        parent?.type === 'VariableDeclarator' &&
        parent.id.type === 'Identifier'
      ) {
        const opts = n.arguments[0];
        const id = `${rel}#${parent.id.name}`;
        const gpr = objProp(opts, 'getParentRoute');
        const parentName =
          gpr?.body?.type === 'Identifier' ? gpr.body.name : undefined;
        const p = objProp(opts, 'path');
        const component = objProp(opts, 'component');
        const pathValue = stringValue(info, p);
        if (p && pathValue === undefined) unresolvedPaths.push(id);
        defs.set(id, {
          id,
          parent: parentName ? resolveRef(parentName) : undefined,
          ownPath: normalizeSegment(pathValue ?? ''),
          entries: component ? entriesOf(info, component, isBoundary) : [],
          root: name === 'createRootRoute',
        });
      }
      if (name === 'parseModuleRoutes') {
        const target = n.arguments[1];
        const ref =
          target?.type === 'Identifier' ? resolveRef(target.name) : undefined;
        if (ref) moduleSinks.set(rel, ref);
      }
      if (n.callee.type === 'Identifier') {
        n.arguments.forEach((a: any) => {
          if (
            a.type === 'MemberExpression' &&
            a.computed &&
            a.property.type === 'StringLiteral'
          ) {
            const imp = info.imports.get(n.callee.name);
            if (imp?.file)
              keyedCalls.push({ key: a.property.value, factoryFile: imp.file });
          }
        });
      }
    });
  });

  keyedCalls.forEach(({ key, factoryFile }) => {
    const sink = moduleSinks.get(factoryFile);
    if (!sink) return;
    moduleParents.set(key, [...(moduleParents.get(key) ?? []), sink]);
  });
  return { defs, moduleParents, unresolvedPaths, unresolvedImports };
};

const addModuleRoutes = (
  tree: SourceTree,
  defs: Map<string, RouteDef>,
  moduleParents: Map<string, string[]>,
  isBoundary: (rel: string) => boolean
) => {
  const moduleIndexes = tree.files.filter((f) =>
    /^app\/modules\/.+\/index\.tsx?$/.test(f)
  );
  moduleIndexes.forEach((rel) => {
    if (!/\broutes\s*:/.test(tree.source(rel))) return;
    const info = fileInfo(tree, rel);
    const ast = tree.ast(rel);
    if (!info || !ast) return;
    let counter = 0;
    const addEntries = (list: any, parentId: string) => {
      if (list?.type !== 'ArrayExpression') return;
      list.elements.forEach((el: any) => {
        if (el?.type !== 'ObjectExpression') return;
        const p = objProp(el, 'path');
        const index = objProp(el, 'index');
        const element = objProp(el, 'element');
        const id = `${rel}#module-${counter++}`;
        defs.set(id, {
          id,
          parent: parentId,
          ownPath:
            index?.type === 'BooleanLiteral' && index.value
              ? ''
              : p?.type === 'StringLiteral'
              ? normalizeSegment(p.value)
              : '',
          entries: element ? entriesOf(info, element, isBoundary) : [],
          root: false,
        });
        addEntries(objProp(el, 'children'), id);
      });
    };
    walk(ast.program, (n) => {
      if (
        n.type === 'ObjectProperty' &&
        !n.computed &&
        n.key.name === 'routes' &&
        n.value.type === 'ObjectExpression'
      ) {
        n.value.properties.forEach((kp: any) => {
          if (kp.type !== 'ObjectProperty') return;
          const key = kp.key.name ?? kp.key.value;
          (moduleParents.get(key) ?? []).forEach((parentId) =>
            addEntries(kp.value, parentId)
          );
        });
        return false;
      }
      return undefined;
    });
  });
};

export type RouteMap = {
  routes: RouteRef[];
  unmapped: string[];
  /** Route path to the sorted files (import closure) rendered there. */
  routeFiles: Record<string, string[]>;
  /** Route definitions whose parent could not be resolved (skipped). */
  orphans: string[];
  /** Route definitions whose `path` is not a static string (segment dropped). */
  unresolvedPaths: string[];
  /** `routeFile: specifier` of lazy page imports that resolve to no file. */
  unresolvedImports: string[];
};

export const mapRoutes = (rootDir: string, tree?: SourceTree): RouteMap => {
  const t = tree ?? new SourceTree(rootDir);
  const routeFiles = collectRouteFiles(t);
  const routeSet = new Set(routeFiles);
  const isBoundary = (rel: string) => routeSet.has(rel);
  const { defs, moduleParents, unresolvedPaths, unresolvedImports } =
    collectRouteDefs(t, routeFiles, isBoundary);
  addModuleRoutes(t, defs, moduleParents, isBoundary);

  const fullPath = new Map<string, string | null>();
  const resolvePath = (id: string, depth = 0): string | null => {
    if (fullPath.has(id)) return fullPath.get(id) as string | null;
    const d = defs.get(id);
    let result: string | null = null;
    if (d && depth < 64) {
      if (d.root) result = '';
      else if (d.parent) {
        const parentPath = resolvePath(d.parent, depth + 1);
        if (parentPath !== null) {
          result = [parentPath, d.ownPath].filter(Boolean).join('/');
          if (result === '$locale') result = '';
          else if (result.startsWith('$locale/'))
            result = result.slice('$locale/'.length);
        }
      }
    }
    fullPath.set(id, result);
    return result;
  };

  const routes: RouteRef[] = [];
  const orphans: string[] = [];
  const entriesByPath = new Map<string, Set<string>>();
  [...defs.values()].forEach((d) => {
    const p = resolvePath(d.id);
    if (p === null) {
      orphans.push(d.id);
      return;
    }
    if (d.root) return;
    d.entries.forEach((file) => {
      const set = entriesByPath.get(p) ?? new Set<string>();
      set.add(file);
      entriesByPath.set(p, set);
    });
  });

  const closure = (entries: Iterable<string>): string[] => {
    const seen = new Set<string>();
    const stack = [...entries];
    while (stack.length) {
      const f = stack.pop() as string;
      if (seen.has(f) || isBoundary(f)) continue;
      seen.add(f);
      t.depsOf(f).forEach((d) => {
        if (!seen.has(d)) stack.push(d);
      });
    }
    return [...seen].sort();
  };

  const routeFilesByPath: Record<string, string[]> = {};
  const mapped = new Set<string>();
  [...entriesByPath.keys()].sort().forEach((p) => {
    const entries = entriesByPath.get(p) as Set<string>;
    [...entries].sort().forEach((file) =>
      routes.push({
        path: p,
        office: p === 'admin' || p.startsWith('admin/') ? 'admin' : 'public',
        file,
      })
    );
    const files = closure(entries);
    routeFilesByPath[p] = files;
    files.forEach((f) => mapped.add(f));
  });

  const unmapped = t.files.filter((f) => isScannedSource(f) && !mapped.has(f));
  return {
    routes,
    unmapped,
    routeFiles: routeFilesByPath,
    orphans: orphans.sort(),
    unresolvedPaths: unresolvedPaths.sort(),
    unresolvedImports: [...new Set(unresolvedImports)].sort(),
  };
};
