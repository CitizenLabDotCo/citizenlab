/**
 * Drift trend for the Proposal page: the scan totals at every commit that
 * refreshed the committed scan summary, oldest first.
 *
 *   npm run ds:changes            (runs this after the change list)
 *   tsx scripts/design-system/trend.ts [--out .storybook/static]
 *
 * Writes trend.json (committed). Each point carries the commit, its date,
 * subject and area (`design-system(<area>)`), the summary totals, and for a
 * heal commit a small example of the change (the first changed app file,
 * a few removed and added lines) and the folder of its screenshots.
 *
 * The CI build clones with --depth 1 and sees no history, so a shallow
 * clone, a failing git log or an empty history keeps the committed file.
 * The file has no timestamp and is only rewritten when its content
 * changes, so a local build leaves it clean unless the data moved. It
 * always exits 0.
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// As in changes.ts; not imported, so the workbench typecheck that reads
// these types does not pull in the token build.
export type RunGit = (args: string[]) => string | undefined;

export type TrendTotals = {
  offSpec: number;
  legacy: number;
  tokenReads: number;
  components: number;
  onTokens: number;
};

export type HealExample = {
  file: string;
  removed: string[];
  added: string[];
  // Static-dir folder with before.png and after.png.
  shots?: string;
  // From the commit body: the follows-tokens score and the changed pixels.
  score?: { from: number; to: number };
  diffs?: number;
};

export type TrendPoint = {
  sha: string;
  date: string;
  subject: string;
  area: string;
  totals: TrendTotals;
  heal?: HealExample;
};

export type Trend = { file: string; points: TrendPoint[] };

const TOTAL_KEYS: (keyof TrendTotals)[] = [
  'offSpec',
  'legacy',
  'tokenReads',
  'components',
  'onTokens',
];

// changes.ts SCAN_SUMMARY (changes.ts runs this file, so no import back).
export const SCAN_SUMMARY = 'front/.storybook/static/design-scan.summary.json';

const RS = '\x1e';
const US = '\x1f';
export const TREND_LOG_FORMAT = `--format=${RS}%H${US}%cI${US}%s${US}%b`;
// Pathspec from the repository root, whatever the working directory.
const SUMMARY_SPEC = `:/${SCAN_SUMMARY}`;
const MAX_LINES = 4;

/** Parses `git log` output in TREND_LOG_FORMAT. */
export const parseTrendLog = (
  out: string
): { sha: string; date: string; subject: string; body: string }[] =>
  out
    .split(RS)
    .filter((chunk) => chunk.trim())
    .map((chunk) => {
      const [sha = '', date = '', subject = '', body = ''] = chunk.split(US);
      return {
        sha: sha.trim(),
        date: date.trim(),
        subject: subject.trim(),
        body: body.trim(),
      };
    });

/** `heal` from `design-system(heal): ...`; `other` without the prefix. */
export const areaOf = (subject: string): string =>
  /^design-system\(([^)]*)\):/.exec(subject)?.[1].trim().toLowerCase() ||
  'other';

/** The totals of a summary, or undefined when one is not a number. */
export const totalsOf = (summary: unknown): TrendTotals | undefined => {
  if (!summary || typeof summary !== 'object') return undefined;
  const s = summary as Record<string, unknown>;
  const out = {} as TrendTotals;
  for (const k of TOTAL_KEYS) {
    if (typeof s[k] !== 'number') return undefined;
    out[k] = s[k] as number;
  }
  return out;
};

/** The screenshot folder a heal commit body names, under the static dir. */
export const shotsOf = (body: string): string | undefined =>
  /Screenshots:\s*(?:front\/)?\.storybook\/static\/(heals\/[0-9a-f]{7,40})\/?/.exec(
    body
  )?.[1];

/** The score line and the visual compare of a heal commit body. */
export const healNotesOf = (
  body: string
): Pick<HealExample, 'score' | 'diffs'> => {
  const out: Pick<HealExample, 'score' | 'diffs'> = {};
  const score = /Score (\d+(?:\.\d+)?) → (\d+(?:\.\d+)?)/.exec(body);
  if (score) out.score = { from: Number(score[1]), to: Number(score[2]) };
  // Older bodies give two counts ("today N diffs, redesign M diffs"); the
  // first is the page as it ships.
  const diffs =
    /\btoday (\d+) diffs?/.exec(body) ??
    /Visual compare:[^\n]*?(\d+) diffs?/.exec(body);
  if (diffs) out.diffs = Number(diffs[1]);
  return out;
};

const IMPORT_RE = /^\s*import\s|^\s*}\s*from\s/;

/**
 * The first file of a unified diff with its changed lines, imports left
 * out (a heal adds the token import; the line that changed is the point).
 */
export const healExampleOf = (
  diff: string
): Omit<HealExample, 'shots'> | undefined => {
  let file: string | undefined;
  const removed: string[] = [];
  const added: string[] = [];
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      if (file) break;
      file = line.replace(/^\+\+\+ (b\/)?/, '');
      continue;
    }
    if (!file || line.startsWith('--- ')) continue;
    const text = line.slice(1);
    if (IMPORT_RE.test(text) || !text.trim()) continue;
    // The same edit on several lines shows once.
    const into = line.startsWith('-')
      ? removed
      : line.startsWith('+')
      ? added
      : null;
    if (into && into.length < MAX_LINES && !into.includes(text)) {
      into.push(text);
    }
  }
  if (!file || (removed.length === 0 && added.length === 0)) return undefined;
  return { file, removed, added };
};

const parseJson = (text: string | undefined): unknown => {
  if (text === undefined) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

/**
 * The trend from git, or undefined with a reason when git cannot give a
 * whole history (a shallow clone, a failing log).
 */
export const buildTrend = (
  runGit: RunGit
): { trend: Trend } | { trend?: undefined; reason: string } => {
  if (runGit(['rev-parse', '--is-shallow-repository'])?.trim() === 'true') {
    return { reason: 'shallow clone, history not reachable' };
  }
  const log = runGit([
    'log',
    '--reverse',
    TREND_LOG_FORMAT,
    '--',
    SUMMARY_SPEC,
  ]);
  if (log === undefined) return { reason: 'git log failed' };
  const points: TrendPoint[] = [];
  parseTrendLog(log).forEach((c) => {
    const totals = totalsOf(
      parseJson(runGit(['show', `${c.sha}:${SCAN_SUMMARY}`]))
    );
    if (!totals) return;
    const area = areaOf(c.subject);
    const point: TrendPoint = {
      sha: c.sha,
      date: c.date,
      subject: c.subject,
      area,
      totals,
    };
    if (area === 'heal') {
      const example = healExampleOf(
        runGit(['show', '--format=', '-U0', c.sha, '--', ':/front/app']) ?? ''
      );
      const shots = shotsOf(c.body);
      if (example) {
        point.heal = {
          ...example,
          ...(shots ? { shots } : {}),
          ...healNotesOf(c.body),
        };
      }
    }
    points.push(point);
  });
  if (points.length === 0) return { reason: 'no commit of the summary found' };
  return { trend: { file: SCAN_SUMMARY, points } };
};

export const serializeTrend = (trend: Trend) =>
  `${JSON.stringify(trend, null, 2)}\n`;

/**
 * Writes the trend when it differs from the file; keeps the file when no
 * trend could be built (it never writes an empty one).
 */
export const writeTrend = (
  file: string,
  result: ReturnType<typeof buildTrend>
): 'written' | 'unchanged' | 'kept' | 'none' => {
  const exists = fs.existsSync(file);
  if (!result.trend) return exists ? 'kept' : 'none';
  const text = serializeTrend(result.trend);
  if (exists && fs.readFileSync(file, 'utf8') === text) return 'unchanged';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
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
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch {
      return undefined;
    }
  };

/** Builds and writes trend.json in `outDir`; logs one line. Never throws. */
export const runTrend = (outDir = '.storybook/static') => {
  try {
    const file = path.join(path.resolve(ROOT, outDir), 'trend.json');
    const result = buildTrend(gitIn(ROOT));
    const outcome = writeTrend(file, result);
    const rel = path.relative(ROOT, file);
    if (!result.trend) {
      console.warn(
        `ds:trend warning: ${result.reason}; ${
          outcome === 'kept' ? `kept the committed ${rel}` : `no ${rel} written`
        }`
      );
      return;
    }
    console.log(
      `ds:trend: ${result.trend.points.length} points; ${rel} ${outcome}`
    );
  } catch (e: any) {
    console.warn(`ds:trend warning: failed (${e?.message ?? e})`);
  }
};

if (require.main === module) {
  const i = process.argv.indexOf('--out');
  runTrend(i > -1 ? process.argv[i + 1] : undefined);
}
