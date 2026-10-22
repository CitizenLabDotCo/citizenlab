import path from 'path';

import { ParsedFile } from './findings';
import { SourceTree, walk } from './routes';
import { ComponentUsage } from './schema';

/*
 * Library usages: import sites of library components. A library component is
 * a directory under app/component-library/components/ (every export from that
 * directory counts as that component, so `Thead` is `Table`), plus the
 * capitalised value exports of app/component-library/index.tsx that live
 * elsewhere in the library (`InputContainer`, `ClickOutside`). Lowercase
 * exports (`colors`, `media`, hooks) are not components. An import counts when
 * the local name is used as a value (JSX or expression), not only as a type.
 * One usage per imported name per file, at the import line, with the sorted
 * JSX prop names used on that element in the file.
 */

const LIB = 'app/component-library/';
const LIB_INDEX_RE = /^app\/component-library\/index\.tsx?$/;
const COMPONENT_DIR_RE = /^app\/component-library\/components\/([^/]+)\//;

export type LibraryIndex = {
  /** Export name of app/component-library/index -> component name. */
  byExport: Map<string, string>;
  /** Component name -> its own (scanned) files, sorted. */
  ownFiles: Map<string, string[]>;
  /** Library file -> component it belongs to. */
  componentOfFile: (rel: string) => string | undefined;
};

const isCapitalised = (s: string) => /^[A-Z]/.test(s);
const looksLikeType = (s: string) => /(Props|Styles|Names|Type)$/.test(s);

export const libraryIndex = (
  tree: SourceTree,
  isOwnFile: (rel: string) => boolean = (rel) =>
    !/\.(test|stories)\.[jt]sx?$/.test(rel)
): LibraryIndex => {
  const byExport = new Map<string, string>();
  const extraFiles = new Map<string, string>(); // file -> component
  const indexFile = tree.files.find((f) => LIB_INDEX_RE.test(f));
  if (indexFile && tree.ast(indexFile)) {
    const localToFile = new Map<string, string>();
    tree.importsOf(indexFile).forEach((i) => {
      if (i.dynamic || i.typeOnly) return;
      const file = tree.resolver.resolve(indexFile, i.spec);
      if (!file) return;
      i.names.forEach((n) => {
        if (!n.typeOnly) localToFile.set(n.local, file);
      });
    });
    const ast = tree.ast(indexFile) as ParsedFile;
    ast.program.body.forEach((n: any) => {
      if (n.type !== 'ExportNamedDeclaration' || n.exportKind === 'type')
        return;
      if (n.source) return;
      n.specifiers.forEach((sp: any) => {
        const local = sp.local.name;
        const exported = sp.exported.name ?? sp.exported.value;
        const file = localToFile.get(local);
        if (!file || !isCapitalised(exported)) return;
        const dir = COMPONENT_DIR_RE.exec(file)?.[1];
        if (dir) byExport.set(exported, dir);
        else {
          byExport.set(exported, exported);
          extraFiles.set(file, exported);
        }
      });
    });
  }

  const componentOfFile = (rel: string): string | undefined =>
    COMPONENT_DIR_RE.exec(rel)?.[1] ?? extraFiles.get(rel);

  const ownFiles = new Map<string, string[]>();
  const add = (component: string, file: string) =>
    ownFiles.set(component, [...(ownFiles.get(component) ?? []), file]);
  tree.files.forEach((f) => {
    if (!isOwnFile(f)) return;
    const dir = COMPONENT_DIR_RE.exec(f)?.[1];
    if (dir) add(dir, f);
  });
  extraFiles.forEach((component, file) => {
    // An index file owns its directory; a plain file owns itself.
    const base = path.posix.basename(file);
    if (/^index\.[jt]sx?$/.test(base)) {
      const dir = path.posix.dirname(file) + '/';
      tree.files
        .filter((f) => f.startsWith(dir) && isOwnFile(f))
        .forEach((f) => add(component, f));
    } else add(component, file);
  });
  [...byExport.values()].forEach((c) => {
    if (!ownFiles.has(c)) ownFiles.set(c, []);
  });
  ownFiles.forEach((files, c) => ownFiles.set(c, [...new Set(files)].sort()));
  return { byExport, ownFiles, componentOfFile };
};

// TS nodes whose subtree is type-only (references inside are not value uses).
const TYPE_NODES = new Set([
  'TSTypeAnnotation',
  'TSTypeReference',
  'TSInterfaceDeclaration',
  'TSTypeAliasDeclaration',
  'TSTypeParameterInstantiation',
  'TSTypeParameterDeclaration',
  'TSTypeQuery',
  'TSExpressionWithTypeArguments',
  'TSInterfaceHeritage',
  'TSDeclareFunction',
  'TSModuleDeclaration',
]);

type FileRefs = { values: Set<string>; props: Map<string, Set<string>> };

const fileRefs = (ast: ParsedFile): FileRefs => {
  const values = new Set<string>();
  const props = new Map<string, Set<string>>();
  walk(ast.program, (n, parent) => {
    if (TYPE_NODES.has(n.type) || n.type === 'ImportDeclaration') return false;
    if (n.type === 'JSXOpeningElement') {
      const name = n.name.type === 'JSXIdentifier' ? n.name.name : undefined;
      if (name) {
        values.add(name);
        const set = props.get(name) ?? new Set<string>();
        n.attributes.forEach((a: any) => {
          if (a.type === 'JSXAttribute' && a.name.type === 'JSXIdentifier')
            set.add(a.name.name);
        });
        props.set(name, set);
      }
      if (n.name.type === 'JSXMemberExpression') {
        let o = n.name;
        while (o.type === 'JSXMemberExpression') o = o.object;
        if (o.type === 'JSXIdentifier') values.add(o.name);
      }
    } else if (n.type === 'Identifier') {
      const isMemberProp =
        (parent?.type === 'MemberExpression' ||
          parent?.type === 'OptionalMemberExpression') &&
        parent.property === n &&
        !parent.computed;
      const isKey =
        (parent?.type === 'ObjectProperty' ||
          parent?.type === 'ObjectMethod' ||
          parent?.type === 'ClassProperty' ||
          parent?.type === 'ClassMethod') &&
        parent.key === n &&
        !parent.computed &&
        !parent.shorthand;
      if (!isMemberProp && !isKey) values.add(n.name);
    }
    return undefined;
  });
  return { values, props };
};

const treeCache = new Map<string, { tree: SourceTree; lib: LibraryIndex }>();

/** Usages in one file of a tree (the CLI shares one SourceTree and index). */
export const usagesInFile = (
  tree: SourceTree,
  lib: LibraryIndex,
  rel: string
): ComponentUsage[] => {
  const ast = tree.ast(rel);
  if (!ast) return [];
  const ownComponent = rel.startsWith(LIB)
    ? lib.componentOfFile(rel)
    : undefined;
  let refs: FileRefs | undefined;
  const out: ComponentUsage[] = [];
  tree.importsOf(rel).forEach((i) => {
    if (i.dynamic || i.typeOnly) return;
    const target = tree.resolver.resolve(rel, i.spec);
    if (!target || !target.startsWith(LIB)) return;
    i.names.forEach((n) => {
      if (n.typeOnly || n.imported === '*') return;
      let component: string | undefined;
      if (LIB_INDEX_RE.test(target)) {
        component = lib.byExport.get(n.imported);
      } else {
        const c = lib.componentOfFile(target);
        if (
          c &&
          (n.imported === 'default' ||
            (isCapitalised(n.imported) && !looksLikeType(n.imported)))
        )
          component = c;
      }
      if (!component || component === ownComponent) return;
      refs = refs ?? fileRefs(ast);
      if (!refs.values.has(n.local)) return;
      out.push({
        component,
        file: rel,
        line: i.line,
        props: [...(refs.props.get(n.local) ?? [])].sort(),
      });
    });
  });
  return out.sort(
    (a, b) => a.line - b.line || a.component.localeCompare(b.component)
  );
};

/** Convenience for one file; `source` overrides the file on disk. */
export const libraryUsages = (
  rootDir: string,
  rel: string,
  source?: string
): ComponentUsage[] => {
  let entry = treeCache.get(rootDir);
  if (!entry) {
    const tree = new SourceTree(rootDir);
    entry = { tree, lib: libraryIndex(tree) };
    treeCache.set(rootDir, entry);
  }
  if (source !== undefined) entry.tree.setSource(rel, source);
  return usagesInFile(entry.tree, entry.lib, rel);
};
