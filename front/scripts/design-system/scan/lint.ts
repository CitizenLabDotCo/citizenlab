import { Finding, FindingCategory } from './schema';

/*
 * ds:lint: off-spec findings on lines added under the library and the design
 * system, so a raw value cannot land there unnoticed. Pure helpers here; git
 * access lives in the CLI (index.ts).
 */

export const LINT_CATEGORIES: FindingCategory[] = [
  'px',
  'hex',
  'rgba',
  'named-color',
  'layout-spacing',
];
export const LINT_SCOPE = ['app/component-library/', 'app/design-system/'];

/** File -> added line numbers, or 'all' when the whole file is new. */
export type AddedLines = Map<string, Set<number> | 'all'>;

export const inLintScope = (file: string) =>
  LINT_SCOPE.some((p) => file.startsWith(p));

/** Added lines (new-file numbering) per file of a unified diff. */
export const parseAddedLines = (diff: string): AddedLines => {
  const out: AddedLines = new Map();
  let file: string | undefined;
  let line = 0;
  let inHunk = false;
  diff.split('\n').forEach((l) => {
    if (l.startsWith('diff --git ')) {
      file = undefined;
      inHunk = false;
      return;
    }
    if (!inHunk && l.startsWith('+++ ')) {
      const target = l.slice(4).trim();
      file =
        target === '/dev/null'
          ? undefined
          : target.replace(/^"?b\//, '').replace(/"$/, '');
      return;
    }
    if (!inHunk && l.startsWith('--- ')) return;
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(l);
    if (hunk) {
      line = Number(hunk[1]);
      inHunk = true;
      return;
    }
    if (!inHunk || !file) return;
    if (l.startsWith('+')) {
      const set = out.get(file);
      const lines = set instanceof Set ? set : new Set<number>();
      lines.add(line);
      out.set(file, lines);
      line += 1;
    } else if (l.startsWith(' ')) {
      line += 1;
    }
    // '-' and '\ No newline' lines do not advance the new-file counter.
  });
  return out;
};

export const lintFindings = (findings: Finding[], added: AddedLines) =>
  findings.filter((f) => {
    if (!inLintScope(f.file) || !LINT_CATEGORIES.includes(f.category))
      return false;
    const lines = added.get(f.file);
    if (!lines) return false;
    return lines === 'all' || lines.has(f.line);
  });

export const formatLintFinding = (f: Finding) =>
  `${f.file}:${f.line} ${f.raw} → ${
    f.suggestion
      ? `${f.suggestion.token}${
          f.suggestion.distance ? ` (distance ${f.suggestion.distance})` : ''
        }`
      : 'no token'
  }`;
