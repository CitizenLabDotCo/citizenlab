/*
 * Code index CLI: every style template of the app and what each value reads.
 *
 *   tsx scripts/design-system/index/index.ts [--out .storybook/static/design-index]
 *       [--files app/a.tsx,app/b.tsx]
 *
 * Reads app/**\/*.{ts,tsx} (stories included) and .storybook/**\/*.{ts,tsx},
 * minus .storybook/workbench/, tests and __mocks__ (statically: no app code
 * runs), and writes into the out folder:
 * - meta.json: totals, the commit (CIRCLE_SHA1, else `git rev-parse HEAD`)
 *   and where each theme and const value is defined (values.ts defs);
 * - lookup.json: fnv1a32 of a quasi -> template ids (sorted, at most 20);
 * - files.json: per file with templates, its counts (designCounts.ts);
 * - files/<fnv1a32 of the file path>.json: { file, templates };
 * - styles.json: the inline style objects of the story files and the
 *   Storybook setup (styleObjects.ts), the story frames.
 * Keys and lists are sorted and there are no timestamps, so two runs on one
 * commit give the same bytes. --files indexes only those files (imports
 * still resolve against the whole tree).
 *
 * A file that fails is counted, reported and left out; the run goes on. Only
 * a failure of the whole run exits 1, and ds:prepare runs the next step
 * anyway.
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { parseSource } from '../scan/findings';
import { listCodeFiles, SourceTree } from '../scan/routes';
import {
  LegacyValues,
  legacyValues,
  STYLE_UTILS_FILE,
  ValueDef,
} from '../scan/values';

import { designCounts } from './designCounts';
import { fnv1a32 } from './hash';
import { isKnown } from './reads';
import { isFrameFile, styleObjectsOf } from './styleObjects';
import {
  DefPlace,
  IndexFiles,
  IndexLookup,
  IndexMeta,
  IndexShard,
  IndexStyles,
  Template,
  TemplateKind,
} from './schema';
import {
  ExportedTemplate,
  exportsOf,
  IndexContext,
  indexFile,
  StyleUtilsIndex,
  styleUtilsOf,
  UnknownTag,
} from './templates';

const ROOT = path.resolve(__dirname, '..', '..', '..');
const DEFAULT_OUT = '.storybook/static/design-index';
/** Quasis this long or longer are lookup keys, besides each longest quasi. */
const LOOKUP_MIN = 24;
const LOOKUP_MAX_IDS = 20;

/** Indexed source: .ts/.tsx, without tests, mocks and the workbench. */
export const isIndexedSource = (rel: string) =>
  /\.tsx?$/.test(rel) &&
  !/\.test\.[jt]sx?$/.test(rel) &&
  !/(^|\/)__mocks__\//.test(rel) &&
  !rel.startsWith('.storybook/workbench/');

// Code files under .storybook/ (for resolution and the index), sorted.
const storybookFiles = (rootDir: string): string[] => {
  const out: string[] = [];
  const walkDir = (rel: string) => {
    const dir = path.join(rootDir, rel);
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
      if (e.name === 'node_modules' || e.name.startsWith('.')) return;
      const child = `${rel}/${e.name}`;
      if (child === '.storybook/workbench') return;
      if (e.isDirectory()) walkDir(child);
      else if (/\.(tsx?|jsx?)$/.test(e.name)) out.push(child);
    });
  };
  walkDir('.storybook');
  return out.sort();
};

export type IndexResult = {
  meta: IndexMeta;
  lookup: IndexLookup;
  filesJson: IndexFiles;
  shards: IndexShard[];
  styles: IndexStyles;
  /** Templates by kind, for the summary. */
  kinds: Record<string, number>;
  unknownTags: UnknownTag[];
  failed: { file: string; error: string }[];
  warnings: string[];
};

type BuildOptions = {
  rootDir?: string;
  /** Index only these files (paths from front/). */
  only?: string[];
  /** The commit to record; default CIRCLE_SHA1, else git. */
  commit?: string;
};

const gitCommit = (rootDir: string): string => {
  if (process.env.CIRCLE_SHA1) return process.env.CIRCLE_SHA1;
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'unknown';
  }
};

const sortedRecord = <T>(entries: [string, T][]): Record<string, T> => {
  const out: Record<string, T> = {};
  entries
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .forEach(([k, v]) => {
      out[k] = v;
    });
  return out;
};

/**
 * The context every file is read with: styleUtils' values and helpers, and
 * imports followed through barrels to the module that defines them.
 */
const contextOf = (
  tree: SourceTree,
  warnings: string[]
): IndexContext | undefined => {
  let values: LegacyValues;
  let styleUtils: StyleUtilsIndex;
  try {
    const source = tree.source(STYLE_UTILS_FILE);
    values = legacyValues(source);
    styleUtils = styleUtilsOf(source, values);
  } catch (e: any) {
    warnings.push(`${STYLE_UTILS_FILE} not read: ${e?.message ?? e}`);
    return undefined;
  }

  // The names a module (not a barrel) exports, for `export *` from it.
  const namesMemo = new Map<string, Set<string>>();
  const exportNames = (file: string): Set<string> => {
    let names = namesMemo.get(file);
    if (!names) {
      names = new Set<string>();
      const ast = tree.ast(file);
      (ast?.program.body ?? []).forEach((n: any) => {
        if (n.type === 'ExportDefaultDeclaration') names?.add('default');
        if (n.type !== 'ExportNamedDeclaration') return;
        (n.specifiers ?? []).forEach((sp: any) =>
          names?.add(sp.exported.name ?? sp.exported.value)
        );
        const d = n.declaration;
        if (d?.id?.name) names?.add(d.id.name);
        (d?.declarations ?? []).forEach((v: any) => {
          if (v.id.type === 'Identifier') names?.add(v.id.name);
        });
      });
      tree.releaseAst(file);
      namesMemo.set(file, names);
    }
    return names;
  };

  // Barrel maps stay cached; their ASTs and sources are dropped.
  const barrelOf = (file: string) => {
    const info = tree.barrel(file);
    tree.releaseAst(file);
    return info;
  };

  // A named import followed through barrels to the module that defines it
  // (as routes.ts does); undefined when a barrel does not have it.
  const throughBarrels = (
    file: string,
    name: string,
    depth = 0
  ): { file: string; name: string } | undefined => {
    const info = depth > 8 ? null : barrelOf(file);
    if (!info) return { file, name };
    const hit = info.named.get(name);
    if (hit) {
      return hit.name === '*'
        ? hit
        : throughBarrels(hit.file, hit.name, depth + 1);
    }
    for (const star of info.stars) {
      if (barrelOf(star)) {
        const found = throughBarrels(star, name, depth + 1);
        if (found) return found;
      } else if (exportNames(star).has(name)) return { file: star, name };
    }
    return undefined;
  };

  const exportsMemo = new Map<string, Record<string, ExportedTemplate>>();
  const exported = (file: string): Record<string, ExportedTemplate> => {
    let e = exportsMemo.get(file);
    if (!e) {
      try {
        const source = fs.readFileSync(path.join(tree.rootDir, file), 'utf8');
        e = source.includes('`')
          ? exportsOf(file, parseSource(file, source), source)
          : {};
      } catch {
        e = {};
      }
      exportsMemo.set(file, e);
    }
    return e;
  };

  return {
    values,
    styleUtils,
    resolveImport: (file, spec, imported) => {
      const target = tree.resolver.resolve(file, spec);
      if (!target) return undefined;
      if (imported === '*') return { file: target, name: '*' };
      return throughBarrels(target, imported);
    },
    exportedTemplate: (file, name) => exported(file)[name],
  };
};

const lookupOf = (templates: Template[]): IndexLookup => {
  const ids = new Map<string, Set<string>>();
  const add = (q: string, id: string) => {
    // A blank quasi would match every template; it names none.
    if (q.trim() === '') return;
    const k = fnv1a32(q);
    const set = ids.get(k) ?? new Set<string>();
    set.add(id);
    ids.set(k, set);
  };
  templates.forEach((t) => {
    let longest = '';
    t.quasis.forEach((q) => {
      if (q.length > longest.length) longest = q;
      if (q.length >= LOOKUP_MIN) add(q, t.id);
    });
    add(longest, t.id);
  });
  return sortedRecord(
    [...ids].map(([k, set]) => [k, [...set].sort().slice(0, LOOKUP_MAX_IDS)])
  );
};

const defsOf = (defs: Record<string, ValueDef>) => {
  const themeDefs: Record<string, DefPlace> = {};
  const constDefs: Record<string, DefPlace> = {};
  Object.keys(defs)
    .sort()
    .forEach((k) => {
      if (k.startsWith('theme.')) themeDefs[k.slice('theme.'.length)] = defs[k];
      else constDefs[k] = defs[k];
    });
  return { themeDefs, constDefs };
};

/** Indexes the tree (or `only` its listed files). */
export const buildIndex = (opts: BuildOptions = {}): IndexResult => {
  const rootDir = opts.rootDir ?? ROOT;
  const all = [...listCodeFiles(rootDir), ...storybookFiles(rootDir)];
  const tree = new SourceTree(rootDir, all);
  const warnings: string[] = [];
  const ctx = contextOf(tree, warnings) ?? {
    values: {
      theme: {},
      colors: {},
      bo: {},
      viewportWidths: {},
      defs: {},
    },
    styleUtils: { helpers: {}, exports: {} },
  };
  const files = (opts.only ?? all.filter(isIndexedSource)).slice().sort();

  const shards: IndexShard[] = [];
  const styles: IndexStyles = [];
  const unknownTags: UnknownTag[] = [];
  const failed: { file: string; error: string }[] = [];
  const attempt = (file: string, what: string, f: () => void) => {
    try {
      f();
    } catch (e: any) {
      const error = String(e?.message ?? e).split('\n')[0];
      failed.push({ file, error: what ? `${what}: ${error}` : error });
    }
  };
  files.forEach((file) => {
    let source = '';
    attempt(file, '', () => {
      source = fs.readFileSync(path.join(rootDir, file), 'utf8');
      // No backtick, no template.
      if (!source.includes('`')) return;
      const r = indexFile(file, source, ctx);
      unknownTags.push(...r.unknownTags);
      if (r.templates.length) shards.push({ file, templates: r.templates });
    });
    // No `style=`, no inline style object.
    if (source && isFrameFile(file) && /\bstyle\s*=/.test(source)) {
      attempt(file, 'styles', () =>
        styles.push(...styleObjectsOf(file, source))
      );
    }
  });
  styles.sort((a, b) =>
    a.file !== b.file ? (a.file < b.file ? -1 : 1) : a.loc.start - b.loc.start
  );

  const templates = shards.flatMap((s) => s.templates);
  const kinds: Record<string, number> = {};
  let decls = 0;
  let exprs = 0;
  let exprsKnown = 0;
  templates.forEach((t) => {
    kinds[t.kind] = (kinds[t.kind] ?? 0) + 1;
    decls += t.decls.length;
    exprs += t.exprs.length;
    exprsKnown += t.exprs.filter((e) => isKnown(e.read)).length;
  });

  const meta: IndexMeta = {
    version: 1,
    commit: opts.commit ?? gitCommit(rootDir),
    files: files.length,
    templates: templates.length,
    decls,
    exprs,
    exprsKnown,
    unknownTags: unknownTags.length,
    ...defsOf(ctx.values.defs),
  };
  const filesJson: IndexFiles = sortedRecord(
    shards.map((s) => [s.file, designCounts(s.templates)])
  );
  return {
    meta,
    lookup: lookupOf(templates),
    filesJson,
    shards,
    styles,
    kinds,
    unknownTags,
    failed,
    warnings,
  };
};

/**
 * Writes the folder: replaces meta.json, lookup.json, files.json,
 * styles.json and files/ (nothing else in it is touched). Two files whose
 * paths hash alike keep the first shard and warn.
 */
export const writeIndex = (r: IndexResult, outDir: string): string[] => {
  const warnings: string[] = [];
  const filesDir = path.join(outDir, 'files');
  fs.rmSync(filesDir, { recursive: true, force: true });
  fs.mkdirSync(filesDir, { recursive: true });
  const written = new Map<string, string>();
  r.shards.forEach((s) => {
    const h = fnv1a32(s.file);
    const other = written.get(h);
    if (other) {
      warnings.push(
        `shard hash ${h} of ${s.file} is taken by ${other}; left out`
      );
      return;
    }
    written.set(h, s.file);
    fs.writeFileSync(
      path.join(filesDir, `${h}.json`),
      `${JSON.stringify(s)}\n`
    );
  });
  const json = (name: string, data: unknown, pretty: boolean) =>
    fs.writeFileSync(
      path.join(outDir, name),
      `${JSON.stringify(data, null, pretty ? 2 : undefined)}\n`
    );
  json('meta.json', r.meta, true);
  // JSON.stringify puts keys that look like array indexes ('93732405')
  // first; write the hash keys in plain sorted order instead.
  fs.writeFileSync(
    path.join(outDir, 'lookup.json'),
    `{${Object.keys(r.lookup)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${JSON.stringify(r.lookup[k])}`)
      .join(',')}}\n`
  );
  json('files.json', r.filesJson, true);
  json('styles.json', r.styles, false);
  return warnings;
};

const dirSize = (dir: string): number =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => {
    const p = path.join(dir, e.name);
    return n + (e.isDirectory() ? dirSize(p) : fs.statSync(p).size);
  }, 0);

const pct = (a: number, b: number) =>
  b ? `${((100 * a) / b).toFixed(1)}%` : 'n/a';

// The out folder from front/, or absolute when outside it.
const shown = (dir: string) => {
  const rel = path.relative(ROOT, dir);
  return rel.startsWith('..') || path.isAbsolute(rel) ? dir : rel;
};

const printSummary = (r: IndexResult, outDir: string, ms: number) => {
  const m = r.meta;
  const kinds = (Object.keys(r.kinds) as TemplateKind[])
    .sort()
    .map((k) => `${k} ${r.kinds[k]}`)
    .join(', ');
  const design = Object.values(r.filesJson).reduce(
    (acc, f) => {
      (Object.keys(acc) as (keyof typeof acc)[]).forEach((k) => {
        acc[k] += f.design[k];
      });
      return acc;
    },
    { token: 0, legacy: 0, literal: 0, prop: 0, unknown: 0 }
  );
  const lines = [
    `ds:index: ${m.files} files read, ${r.shards.length} with templates (commit ${m.commit})`,
    `  templates: ${m.templates} (${kinds})`,
    `  decls: ${m.decls}; design decls: ${Object.entries(design)
      .map(([k, n]) => `${k} ${n}`)
      .join(', ')}`,
    `  exprs: ${m.exprs}, known read ${m.exprsKnown} (${pct(
      m.exprsKnown,
      m.exprs
    )})`,
    `  style objects: ${r.styles.length} in ${
      new Set(r.styles.map((o) => o.file)).size
    } frame files, ${r.styles.filter((o) => o.entries).length} static`,
    `  unknown tags: ${m.unknownTags}`,
  ];
  const byTag = new Map<string, UnknownTag[]>();
  r.unknownTags.forEach((t) =>
    byTag.set(t.tag, [...(byTag.get(t.tag) ?? []), t])
  );
  [...byTag]
    .sort((a, b) => b[1].length - a[1].length || (a[0] < b[0] ? -1 : 1))
    .slice(0, 10)
    .forEach(([tag, sites]) =>
      lines.push(
        `    ${String(sites.length).padStart(4)} ${tag}  (${sites[0].file}:${
          sites[0].line
        })`
      )
    );
  if (r.failed.length) {
    lines.push(`  failed files: ${r.failed.length}`);
    r.failed
      .slice(0, 10)
      .forEach((f) => lines.push(`    ${f.file}: ${f.error}`));
  }
  r.warnings.forEach((w) => lines.push(`  warning: ${w}`));
  lines.push(
    `  wrote ${shown(outDir)} (${(dirSize(outDir) / 1024 / 1024).toFixed(
      1
    )} MB) in ${(ms / 1000).toFixed(1)} s`
  );
  console.log(lines.join('\n'));
};

type Args = { out: string; files?: string[] };

const parseArgs = (argv: string[]): Args => {
  const args: Args = { out: DEFAULT_OUT };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i];
    else if (a === '--files') args.files = argv[++i].split(',').filter(Boolean);
    else throw new Error(`unknown argument ${a}`);
  }
  return args;
};

if (require.main === module) {
  try {
    const started = Date.now();
    const args = parseArgs(process.argv.slice(2));
    const outDir = path.resolve(ROOT, args.out);
    const r = buildIndex({ only: args.files });
    r.warnings.push(...writeIndex(r, outDir));
    printSummary(r, outDir, Date.now() - started);
  } catch (e: any) {
    console.error(`ds:index failed: ${e?.stack ?? e}`);
    process.exitCode = 1;
  }
}
