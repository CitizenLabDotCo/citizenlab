/**
 * Change list for the Review page: the branch's commits since the
 * merge-base with master, and the token changes between the two.
 *
 *   npm run ds:changes [-- --base <ref>] [-- --out .storybook/static]
 *
 * Writes design-changes.json (committed; rebuilt on every Storybook
 * build). Each commit carries its subject, body and changed files (paths
 * from the repository root, for GitHub links; diffs are not embedded), a
 * kind and component read from the subject (`design-system(heal): Button
 * ...`), and the offSpec delta when the commit refreshed the committed scan
 * summary. A commit lists only files that still differ from the base, so a
 * change a later commit reverted marks nothing. Token changes compare the
 * values in tokens.source.json at the base and at HEAD.
 *
 * The base is the merge-base with --base, else master, else origin/master,
 * else the merge-base the last local scan cached in design-scan.summary.json
 * (CI clones may have no master ref). Without any of those it writes no
 * commits and a warning, and keeps an existing design-changes.json as it
 * is: the file is committed, because the CI build clones with --depth 1 and
 * reaches no base, so the Review page shows the list last refreshed
 * locally. It always exits 0, so a Storybook build never fails on it.
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { buildTokens, TokenSource } from './build-tokens';

export type RunGit = (args: string[]) => string | undefined;

export type Kind = 'heal' | 'lift' | 'token' | 'design' | 'story' | 'other';

export type ChangeCommit = {
  sha: string;
  subject: string;
  body: string;
  files: string[];
  component?: string;
  kind: Kind;
  scanDelta?: { offSpec: number };
};

export type TokenChange = {
  name: string;
  from: string | null;
  to: string | null;
};

export type DesignChanges = {
  generatedAt: string;
  base: string | null;
  baseRef: string | null;
  head: string;
  repoUrl: string;
  commits: ChangeCommit[];
  tokenChanges: TokenChange[];
  // Tokens at HEAD when the base has no token source (all new).
  tokensNew?: number;
  warnings: string[];
};

// Paths from the repository root, as git log --name-only prints them.
export const TOKENS_SOURCE =
  'front/app/design-system/tokens/tokens.source.json';
export const SCAN_SUMMARY = 'front/.storybook/static/design-scan.summary.json';
const REPO_URL = 'https://github.com/CitizenLabDotCo/citizenlab';

const KINDS: Record<string, Kind> = {
  heal: 'heal',
  lift: 'lift',
  token: 'token',
  tokens: 'token',
  design: 'design',
  story: 'story',
  stories: 'story',
};
const SUBJECT_RE = /^design-system\(([^)]*)\):\s*(.*)$/;
// PascalCase, optionally under a folder (`UI/Error`).
const COMPONENT_RE = /^(?:[A-Za-z]+\/)?[A-Z][a-z0-9]+(?:[A-Z][A-Za-z0-9]*)*$/;
const NAMED_KINDS = new Set<Kind>(['heal', 'lift', 'design', 'story']);

/**
 * Kind from the `design-system(<area>)` prefix; component from the first
 * words after the colon: a name from `known` when given, else (for heal,
 * lift and story commits only) the first PascalCase word. For `other`
 * commits only the first word counts, so "smoke: find the Button story"
 * names no component.
 */
export const parseSubject = (
  subject: string,
  known?: Iterable<string>
): { kind: Kind; component?: string } => {
  const m = SUBJECT_RE.exec(subject);
  if (!m) return { kind: 'other' };
  const kind = KINDS[m[1].trim().toLowerCase()] ?? 'other';
  const words = m[2]
    .split(/\s+/)
    .slice(0, kind === 'other' ? 1 : 6)
    .map((w) => w.replace(/[,.:;]+$/, ''));
  const knownSet = known ? new Set(known) : undefined;
  let component: string | undefined;
  if (knownSet && knownSet.size > 0) {
    component = words.find((w) => knownSet.has(w));
  }
  if (!component && NAMED_KINDS.has(kind)) {
    component = words.find((w) => COMPONENT_RE.test(w));
  }
  return component ? { kind, component } : { kind };
};

const RS = '\x1e';
const US = '\x1f';
export const LOG_FORMAT = `--format=${RS}%H${US}%s${US}%b${US}`;

/** Parses `git log --name-only` output in LOG_FORMAT. */
export const parseLog = (
  out: string
): { sha: string; subject: string; body: string; files: string[] }[] =>
  out
    .split(RS)
    .filter((chunk) => chunk.trim())
    .map((chunk) => {
      const [sha, subject, body, rest = ''] = chunk.split(US);
      return {
        sha: sha.trim(),
        subject: subject.trim(),
        body: body.trim(),
        files: rest
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
      };
    });

const tokenValues = (source: TokenSource): Map<string, string> =>
  new Map(buildTokens(source).meta.map((t) => [t.name, String(t.value)]));

/** Tokens whose value changed, plus added and removed ones. */
export const tokenChanges = (
  base: TokenSource,
  head: TokenSource
): TokenChange[] => {
  const from = tokenValues(base);
  const to = tokenValues(head);
  const names = [...new Set([...from.keys(), ...to.keys()])].sort();
  const out: TokenChange[] = [];
  names.forEach((name) => {
    const a = from.get(name) ?? null;
    const b = to.get(name) ?? null;
    if (a !== null && a === b) return;
    out.push({ name, from: a, to: b });
  });
  return out;
};

const parseJson = (text: string | undefined): any => {
  if (text === undefined) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const resolveBase = (
  runGit: RunGit,
  base: string | undefined,
  cachedMergeBase: string | undefined
): { sha: string; ref: string; cached?: boolean } | undefined => {
  const refs = base ? [base] : ['master', 'origin/master'];
  for (const ref of refs) {
    const sha = runGit(['merge-base', 'HEAD', ref])?.trim();
    if (sha) return { sha, ref };
  }
  if (
    cachedMergeBase &&
    runGit(['cat-file', '-e', `${cachedMergeBase}^{commit}`]) !== undefined
  ) {
    return { sha: cachedMergeBase, ref: 'cached', cached: true };
  }
  return undefined;
};

export const buildChanges = (opts: {
  runGit: RunGit;
  base?: string;
  cachedMergeBase?: string;
  knownComponents?: Iterable<string>;
  now?: Date;
}): DesignChanges => {
  const { runGit } = opts;
  const head = runGit(['rev-parse', 'HEAD'])?.trim() || 'unknown';
  const out: DesignChanges = {
    generatedAt: (opts.now ?? new Date()).toISOString(),
    base: null,
    baseRef: null,
    head,
    repoUrl: REPO_URL,
    commits: [],
    tokenChanges: [],
    warnings: [],
  };
  const base = resolveBase(runGit, opts.base, opts.cachedMergeBase);
  if (!base) {
    const tried = opts.base ?? 'master or origin/master';
    out.warnings.push(
      opts.cachedMergeBase
        ? `no merge-base with ${tried}, and the cached merge-base ${opts.cachedMergeBase} is not in this clone (shallow?); no commits listed`
        : `no merge-base with ${tried}, and no merge-base is cached in the scan summary; no commits listed`
    );
    return out;
  }
  out.base = base.sha;
  out.baseRef = base.ref;
  if (base.cached) {
    out.warnings.push(
      `no merge-base with ${
        opts.base ?? 'master or origin/master'
      }; using the cached merge-base ${base.sha} from the scan summary`
    );
  }

  const log = runGit([
    'log',
    '--no-merges',
    '--name-only',
    LOG_FORMAT,
    `${base.sha}..HEAD`,
  ]);
  if (log === undefined) {
    out.warnings.push(`git log ${base.sha}..HEAD failed; no commits listed`);
  }
  const known = opts.knownComponents ? [...opts.knownComponents] : undefined;
  const offSpecAt = (rev: string): number | undefined => {
    const v = parseJson(runGit(['show', `${rev}:${SCAN_SUMMARY}`]))?.offSpec;
    return typeof v === 'number' ? v : undefined;
  };
  // Files the branch still changes; a commit's other files were reverted.
  const net = runGit(['diff', '--name-only', base.sha, 'HEAD']);
  const kept = net === undefined ? undefined : new Set(net.split('\n'));
  out.commits = parseLog(log ?? '').map((c) => {
    const { kind, component } = parseSubject(c.subject, known);
    const files = kept ? c.files.filter((f) => kept.has(f)) : c.files;
    const commit: ChangeCommit = { ...c, files, kind };
    if (component) commit.component = component;
    if (files.includes(SCAN_SUMMARY)) {
      const after = offSpecAt(c.sha);
      const before = offSpecAt(`${c.sha}^`);
      if (after !== undefined && before !== undefined) {
        commit.scanDelta = { offSpec: after - before };
      }
    }
    return commit;
  });

  const headSource = parseJson(runGit(['show', `HEAD:${TOKENS_SOURCE}`]));
  const baseSource = parseJson(
    runGit(['show', `${base.sha}:${TOKENS_SOURCE}`])
  );
  try {
    if (headSource && baseSource) {
      out.tokenChanges = tokenChanges(baseSource, headSource);
    } else if (headSource) {
      out.tokensNew = tokenValues(headSource).size;
    }
  } catch (e: any) {
    out.warnings.push(
      `token sources could not be compared (${e?.message ?? e})`
    );
  }
  return out;
};

/**
 * Writes the change list, except when no base was reachable and a file
 * already exists: CI clones with --depth 1 (no master, no history), so there
 * the committed file, refreshed locally, is kept as it is.
 */
export const writeChanges = (
  file: string,
  changes: DesignChanges
): 'written' | 'kept' => {
  if (changes.base === null && fs.existsSync(file)) return 'kept';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(changes, null, 2)}\n`);
  return 'written';
};

// ---------------------------------------------------------------------------
// CLI

const ROOT = path.resolve(__dirname, '..', '..');

const gitIn =
  (cwd: string): RunGit =>
  (args) => {
    try {
      return execFileSync('git', args, {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        maxBuffer: 256 * 1024 * 1024,
      });
    } catch {
      return undefined;
    }
  };

const readJsonFile = (rel: string): any => {
  const file = path.join(ROOT, rel);
  return fs.existsSync(file)
    ? parseJson(fs.readFileSync(file, 'utf8'))
    : undefined;
};

const main = () => {
  const argv = process.argv.slice(2);
  let base: string | undefined;
  let outDir = '.storybook/static';
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--base') base = argv[++i];
    else if (argv[i] === '--out') outDir = argv[++i];
    else console.warn(`ds:changes warning: unknown argument ${argv[i]}`);
  }
  const summary = readJsonFile('.storybook/static/design-scan.summary.json');
  const scan = readJsonFile('.storybook/static/design-scan.json');
  const known: string[] | undefined = Array.isArray(scan?.components)
    ? scan.components.map((c: any) => c.component)
    : undefined;
  const changes = buildChanges({
    runGit: gitIn(ROOT),
    base,
    cachedMergeBase:
      typeof summary?.mergeBase === 'string' ? summary.mergeBase : undefined,
    knownComponents: known,
  });
  const dir = path.resolve(ROOT, outDir);
  const file = path.join(dir, 'design-changes.json');
  changes.warnings.forEach((w) => console.warn(`ds:changes warning: ${w}`));
  if (writeChanges(file, changes) === 'kept') {
    console.warn(
      `ds:changes warning: no base reachable; kept the committed ${path.relative(
        ROOT,
        file
      )} unchanged (refresh it locally with npm run ds:changes)`
    );
    return;
  }
  const byKind = changes.commits.reduce<Record<string, number>>((m, c) => {
    m[c.kind] = (m[c.kind] ?? 0) + 1;
    return m;
  }, {});
  console.log(
    `ds:changes: ${changes.commits.length} commits since ${
      changes.base
        ? `${changes.base.slice(0, 11)} (${changes.baseRef})`
        : 'no base'
    }${
      changes.commits.length
        ? ` (${Object.entries(byKind)
            .map(([k, n]) => `${k} ${n}`)
            .join(', ')})`
        : ''
    }, ${changes.tokenChanges.length} token changes${
      changes.tokensNew
        ? `, ${changes.tokensNew} tokens new on this branch`
        : ''
    }; wrote ${path.relative(ROOT, file)}`
  );
};

if (require.main === module) {
  try {
    main();
  } catch (e: any) {
    console.warn(`ds:changes warning: failed (${e?.stack ?? e}); exit 0`);
  }
}
