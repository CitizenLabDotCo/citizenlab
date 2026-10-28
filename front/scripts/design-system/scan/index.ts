/*
 * Design-system scanner CLI.
 *
 *   tsx scripts/design-system/scan/index.ts [--out .storybook/static]
 *       [--allow scripts/design-system/scan.allow.json]
 *   tsx scripts/design-system/scan/index.ts --lint [--base <ref>]
 *
 * Scan mode writes design-scan.json (everything) and design-scan.summary.json
 * (totals, for the trend in git history) and prints the totals and the top 10
 * components by usageCount x offSpec. It exits 0 whatever it finds, also with
 * no git and no tokens file; only its own crash exits 1 (it runs in
 * prebuild-storybook on CI).
 *
 * Lint mode prints off-spec values on lines added under app/component-library/
 * and app/design-system/ relative to the merge-base with master (or
 * origin/master, or --base <ref>); without any of those, every line of the
 * files changed in the working tree and the last commit. Exit 1 if any.
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { scanFileResult } from './findings';
import {
  AddedLines,
  formatLintFinding,
  inLintScope,
  lintFindings,
  parseAddedLines,
} from './lint';
import { isScannedSource, mapRoutes, SourceTree } from './routes';
import {
  countFindings,
  legacyCount,
  offSpecCount,
  pageStatus,
  redesignScopeStandIn,
  scoreComponent,
} from './score';
import {
  ComponentScore,
  ComponentUsage,
  Finding,
  PageStatus,
  ScanOutput,
  TokenMeta,
  Totals,
} from './schema';
import { libraryIndex, usagesInFile } from './usages';
import { LegacyValues, legacyValues } from './values';

const ROOT = path.resolve(__dirname, '..', '..', '..');
const TOKENS_META = 'app/design-system/tokens/tokens.meta.json';
const LIB = 'app/component-library/';
const STYLE_UTILS = 'app/component-library/utils/styleUtils.ts';

type Args = {
  out: string;
  allow: string;
  lint: boolean;
  base?: string;
};

const parseArgs = (argv: string[]): Args => {
  const args: Args = {
    out: '.storybook/static',
    allow: 'scripts/design-system/scan.allow.json',
    lint: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i];
    else if (a === '--allow') args.allow = argv[++i];
    else if (a === '--lint') args.lint = true;
    else if (a === '--base') args.base = argv[++i];
    else throw new Error(`unknown argument ${a}`);
  }
  return args;
};

let label = 'ds:scan';
const warn = (msg: string) => console.warn(`${label} warning: ${msg}`);

const git = (args: string[]): string | undefined => {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 256 * 1024 * 1024,
    });
  } catch {
    return undefined;
  }
};

const readJson = (file: string, what: string): unknown => {
  if (!fs.existsSync(file)) {
    warn(`${path.relative(ROOT, file)} not found; ${what}`);
    return undefined;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e: any) {
    warn(
      `${path.relative(ROOT, file)} is not valid JSON (${e?.message}); ${what}`
    );
    return undefined;
  }
};

/** Token list (array or {tokens}); [] with a warning when missing or bad. */
export const loadTokens = (
  file = path.join(ROOT, TOKENS_META)
): TokenMeta[] => {
  const what = 'no token suggestions this run';
  const data: any = readJson(file, what);
  if (data === undefined) return [];
  const list = Array.isArray(data) ? data : data?.tokens;
  if (!Array.isArray(list)) {
    warn(`${path.relative(ROOT, file)} has no token list; ${what}`);
    return [];
  }
  return list as TokenMeta[];
};

type Accepted = { file: string; raw?: string; value?: string; line?: number };

/** Accepted findings; [] with a warning when missing or bad. */
export const loadAllow = (file: string): Accepted[] => {
  const data: any = readJson(file, 'no accepted findings');
  return Array.isArray(data?.accepted) ? data.accepted : [];
};

/** Accepted = same file and raw value, and line within +-3 when given. */
export const isAccepted = (f: Finding, accepted: Accepted[]) =>
  accepted.some(
    (a) =>
      a.file === f.file &&
      (a.raw ?? a.value) === f.raw &&
      (a.line === undefined || Math.abs(a.line - f.line) <= 3)
  );

/**
 * The merge-base with master (or origin/master) for the committed summary,
 * where ds:changes finds it in a clone without those refs; the previous
 * summary's value when neither ref exists.
 */
export const summaryMergeBase = (
  runGit: (args: string[]) => string | undefined,
  previous?: unknown
): string | undefined => {
  for (const ref of ['master', 'origin/master']) {
    const sha = runGit(['merge-base', 'HEAD', ref])?.trim();
    if (sha) return sha;
  }
  const old = (previous as { mergeBase?: unknown } | undefined)?.mergeBase;
  return typeof old === 'string' ? old : undefined;
};

/** What legacy reads render (see values.ts); undefined with a warning. */
const loadLegacyValues = (tree: SourceTree): LegacyValues | undefined => {
  try {
    return legacyValues(tree.source(STYLE_UTILS));
  } catch (e: any) {
    warn(`${STYLE_UTILS} not read (${e?.message ?? e}); no legacy values`);
    return undefined;
  }
};

const scanFiles = (
  tree: SourceTree,
  files: string[],
  tokens: TokenMeta[],
  onFile?: (rel: string) => void,
  values?: LegacyValues
) => {
  const findings: Finding[] = [];
  const parseErrors: string[] = [];
  files.forEach((rel) => {
    const ast = tree.ast(rel);
    if (!ast) {
      parseErrors.push(`${rel}: ${tree.parseErrors.get(rel)}`);
      return;
    }
    tree.importsOf(rel); // cache imports before the AST is released
    const r = scanFileResult(rel, tree.source(rel), tokens, ast, values);
    if (r.parseError) parseErrors.push(`${rel}: ${r.parseError.message}`);
    findings.push(...r.findings);
    onFile?.(rel);
    tree.releaseAst(rel);
  });
  parseErrors.forEach((e) => warn(`skipped (parse error) ${e}`));
  return findings;
};

const pad = (s: string | number, n: number) => String(s).padStart(n);

const runScan = (args: Args) => {
  const started = Date.now();
  const tokens = loadTokens();
  const accepted = loadAllow(path.resolve(ROOT, args.allow));
  const tree = new SourceTree(ROOT);
  const scanned = tree.files.filter(isScannedSource);
  const lib = libraryIndex(tree, isScannedSource);
  const values = loadLegacyValues(tree);

  const usages: ComponentUsage[] = [];
  const rawFindings = scanFiles(
    tree,
    scanned,
    tokens,
    (rel) => {
      usages.push(...usagesInFile(tree, lib, rel));
    },
    values
  );
  const findings = rawFindings.filter((f) => !isAccepted(f, accepted));

  const routeMap = mapRoutes(ROOT, tree);
  routeMap.orphans.forEach((o) =>
    warn(`route with no resolvable parent: ${o}`)
  );
  routeMap.unresolvedImports.forEach((o) =>
    warn(`route page import does not resolve: ${o}`)
  );
  routeMap.unresolvedPaths.forEach((o) =>
    warn(`route path is not a static string, segment dropped: ${o}`)
  );

  const routesOfFile = new Map<string, Set<string>>();
  Object.entries(routeMap.routeFiles).forEach(([p, files]) =>
    files.forEach((f) => {
      const set = routesOfFile.get(f) ?? new Set<string>();
      set.add(p);
      routesOfFile.set(f, set);
    })
  );
  const groupBy = <T>(items: T[], key: (t: T) => string) => {
    const m = new Map<string, T[]>();
    items.forEach((t) => {
      const k = key(t);
      const list = m.get(k);
      if (list) list.push(t);
      else m.set(k, [t]);
    });
    return m;
  };
  const findingsByFile = groupBy(findings, (f) => f.file);
  const usagesByFile = groupBy(usages, (u) => u.file);
  const usagesByComponent = groupBy(usages, (u) => u.component);

  const components: ComponentScore[] = [...lib.ownFiles.keys()]
    .sort()
    .map((component) => {
      const own = lib.ownFiles.get(component) as string[];
      const ownFindings = own.flatMap((f) => findingsByFile.get(f) ?? []);
      const compUsages = usagesByComponent.get(component) ?? [];
      const routes = compUsages.flatMap((u) => [
        ...(routesOfFile.get(u.file) ?? []),
      ]);
      const main =
        lib.mainFile.get(component) ??
        own.find((f) => /\/components\/[^/]+\/index\.[jt]sx?$/.test(f)) ??
        own[0] ??
        '';
      return scoreComponent(ownFindings, compUsages, routes, {
        component,
        file: main,
      });
    });

  // Until the redesign scope list exists, on-tokens components with at
  // least one token read stand in for it (see redesignScopeStandIn).
  const scope = redesignScopeStandIn(components);
  const officeOf = new Map(routeMap.routes.map((r) => [r.path, r.office]));
  const pages: PageStatus[] = Object.keys(routeMap.routeFiles)
    .sort()
    .map((p) => {
      const files = routeMap.routeFiles[p].filter((f) => !f.startsWith(LIB));
      return pageStatus(
        { path: p, office: officeOf.get(p) ?? 'public' },
        files.flatMap((f) => findingsByFile.get(f) ?? []),
        files.flatMap((f) => usagesByFile.get(f) ?? []),
        scope
      );
    });

  const counts = countFindings(findings);
  const totals: Totals = {
    offSpec: offSpecCount(counts),
    legacy: legacyCount(counts),
    tokenReads: counts['token-var'],
    components: components.length,
    onTokens: components.filter((c) => c.status === 'on-tokens').length,
    partly: components.filter((c) => c.status === 'partly').length,
    offTokens: components.filter((c) => c.status === 'off-tokens').length,
    pagesRebuilt: pages.filter((p) => p.status === 'rebuilt').length,
    pagesPartly: pages.filter((p) => p.status === 'partly').length,
    pagesLegacy: pages.filter((p) => p.status === 'legacy').length,
  };

  const commit = git(['rev-parse', 'HEAD'])?.trim() || 'unknown';
  const generatedAt = new Date().toISOString();
  const output: ScanOutput = {
    generatedAt,
    commit,
    findings,
    usages,
    routes: routeMap.routes,
    components,
    pages,
    totals,
    unmapped: routeMap.unmapped,
    routeFiles: routeMap.routeFiles,
  };

  const outDir = path.resolve(ROOT, args.out);
  const summaryFile = path.join(outDir, 'design-scan.summary.json');
  let previousSummary: unknown;
  try {
    previousSummary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
  } catch {
    previousSummary = undefined;
  }
  const mergeBase = summaryMergeBase(git, previousSummary);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'design-scan.json'),
    JSON.stringify(output) + '\n'
  );
  fs.writeFileSync(
    summaryFile,
    `${JSON.stringify(
      { generatedAt, commit, mergeBase, ...totals },
      null,
      2
    )}\n`
  );

  const top = [...components]
    .map((c) => ({ c, off: offSpecCount(c.counts) }))
    .sort(
      (a, b) =>
        b.c.usageCount * b.off - a.c.usageCount * a.off ||
        a.c.component.localeCompare(b.c.component)
    )
    .slice(0, 10);
  const lines = [
    `ds:scan: ${scanned.length} files, ${findings.length} findings (${
      rawFindings.length - findings.length
    } accepted), ${usages.length} component usages, ${
      routeMap.routes.length
    } routes on ${pages.length} paths, ${
      routeMap.unmapped.length
    } unmapped files, ${((Date.now() - started) / 1000).toFixed(1)}s`,
    `totals: offSpec ${totals.offSpec}, legacy ${totals.legacy}, tokenReads ${totals.tokenReads}; components ${totals.components} (on-tokens ${totals.onTokens}, partly ${totals.partly}, off-tokens ${totals.offTokens}); pages rebuilt ${totals.pagesRebuilt}, partly ${totals.pagesPartly}, legacy ${totals.pagesLegacy}`,
    'top 10 by usageCount x offSpec:',
    ...top.map(
      ({ c, off }) =>
        `  ${c.component.padEnd(28)} usages ${pad(
          c.usageCount,
          5
        )}  offSpec ${pad(off, 4)}  score ${c.score.toFixed(3)}  ${c.status}`
    ),
    `wrote ${path.relative(
      ROOT,
      path.join(outDir, 'design-scan.json')
    )} and design-scan.summary.json`,
  ];
  console.log(lines.join('\n'));
};

/** Added lines under the lint scope, from git; undefined when git is unusable. */
const addedLinesFromGit = (base?: string): AddedLines | undefined => {
  if (git(['rev-parse', '--is-inside-work-tree']) === undefined)
    return undefined;
  const untracked = (git(['ls-files', '--others', '--exclude-standard']) ?? '')
    .split('\n')
    .filter(Boolean);
  const refs = base ? [base] : ['master', 'origin/master'];
  let mergeBase: string | undefined;
  for (const ref of refs) {
    mergeBase = git(['merge-base', 'HEAD', ref])?.trim();
    if (mergeBase) break;
  }
  let added: AddedLines;
  if (mergeBase) {
    added = parseAddedLines(
      git([
        'diff',
        '-U0',
        '--no-color',
        '--no-ext-diff',
        '--relative',
        mergeBase,
        '--',
      ]) ?? ''
    );
  } else {
    warn(
      `no merge-base with ${refs.join(
        ' or '
      )}; linting every line of the files changed in the working tree and the last commit`
    );
    added = new Map();
    [
      git(['diff', '--name-only', '--relative', 'HEAD']),
      git(['diff', '--name-only', '--relative', 'HEAD~1', 'HEAD']),
    ].forEach((out) =>
      (out ?? '')
        .split('\n')
        .filter(Boolean)
        .forEach((f) => added.set(f, 'all'))
    );
  }
  untracked.forEach((f) => added.set(f, 'all'));
  return added;
};

const runLint = (args: Args): number => {
  const added = addedLinesFromGit(args.base);
  if (!added) {
    warn('git is not available; nothing to lint');
    return 0;
  }
  const tokens = loadTokens();
  const files = [...added.keys()]
    .filter(
      (f) =>
        inLintScope(f) &&
        isScannedSource(f) &&
        fs.existsSync(path.join(ROOT, f))
    )
    .sort();
  const tree = new SourceTree(ROOT, files);
  const hits = lintFindings(scanFiles(tree, files, tokens), added);
  hits.forEach((f) => console.log(formatLintFinding(f)));
  console.log(
    hits.length
      ? `ds:lint: ${hits.length} off-spec value(s) on added lines in ${files.length} changed file(s)`
      : `ds:lint: no off-spec values on added lines (${files.length} changed file(s))`
  );
  return hits.length ? 1 : 0;
};

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.lint) {
      label = 'ds:lint';
      process.exitCode = runLint(args);
    } else runScan(args);
  } catch (e: any) {
    console.error(`ds:scan failed: ${e?.stack ?? e}`);
    process.exitCode = 1;
  }
}
