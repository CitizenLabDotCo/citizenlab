// What the Tokens and Usage panels show for one component: the tokens its
// story renders merged with the tokens its file reaches in the scan, the
// files that use it, the routes it renders on and its findings. Pure
// functions over the scan, the token metadata and the frame read.
import type { Finding, ScanOutput, TokenMeta } from './data';
import type { TokenMatch } from './frame';
import { healToken, isHealable } from './healTask';
import { legacyIndex, tokensOfFinding } from './usage';

export const REPO = 'https://github.com/CitizenLabDotCo/citizenlab';
export const BRANCH = 'design-system/workbench';

// The file on GitHub, on the branch, at a line.
export const githubLink = (file: string, line?: number) =>
  `${REPO}/blob/${BRANCH}/front/${file}${line ? `#L${line}` : ''}`;

// The Review page with one route and the component to highlight.
export const reviewLink = (path: string, component: string) =>
  `#/review?route=${encodeURIComponent(path)}&component=${encodeURIComponent(
    component
  )}`;

// ---------------------------------------------------------------- tokens

export type Match = TokenMatch['matches'];

export type PanelToken = {
  name: string;
  // linked: a rule of the rendered story reads the token. equal: a rendered
  // value equals it, but no rule names it. none: only the code reaches it
  // (another state, or a branch this story does not render).
  match: Match;
  // Findings of the file that stand for the token.
  findings: Finding[];
  // The findings among them a heal fixes (legacy reads, hard values).
  heal: Finding[];
};

const MATCH_ORDER: Record<Match, number> = { linked: 0, equal: 1, none: 2 };

// The tokens the story renders (linked or equal in `computed`) and the ones
// the file's findings reach: token-var reads, legacy names, and the
// suggested token of a hard value. Ordered linked, equal, code only; then
// by the number of findings, then by name.
export const panelTokens = (
  computed: TokenMatch[] | null,
  findings: Finding[],
  meta: TokenMeta[]
): PanelToken[] => {
  const legacy = legacyIndex(meta);
  const known = new Set(meta.map((t) => t.name));
  const rows = new Map<string, PanelToken>();
  const row = (name: string, match: Match) => {
    let r = rows.get(name);
    if (!r) {
      r = { name, match, findings: [], heal: [] };
      rows.set(name, r);
    }
    return r;
  };
  for (const c of computed ?? []) {
    if (c.matches !== 'none') row(c.name, c.matches);
  }
  for (const f of findings) {
    const tokens =
      f.category === 'token-var'
        ? tokensOfFinding(f, legacy, known)
        : isHealable(f)
        ? healToken(f, meta)
        : [];
    for (const t of tokens) {
      const r = row(t, 'none');
      r.findings.push(f);
      if (isHealable(f)) r.heal.push(f);
    }
  }
  return [...rows.values()].sort(
    (a, b) =>
      MATCH_ORDER[a.match] - MATCH_ORDER[b.match] ||
      b.findings.length - a.findings.length ||
      a.name.localeCompare(b.name)
  );
};

// ---------------------------------------------------------------- usage

export type FileUse = {
  file: string;
  // Usages of the component in the file, the first line, the props set.
  count: number;
  line: number;
  props: string[];
};

// Files that use the component, most uses first. The component's own file
// and the library barrel that re-exports it are not uses.
export const usageFiles = (
  scan: ScanOutput,
  component: string,
  ownFile?: string
): FileUse[] => {
  const byFile = new Map<string, FileUse>();
  for (const u of scan.usages) {
    if (u.component !== component || u.file === ownFile) continue;
    if (/^app\/component-library\/index\.tsx?$/.test(u.file)) continue;
    const entry = byFile.get(u.file) ?? {
      file: u.file,
      count: 0,
      line: u.line,
      props: [],
    };
    entry.count++;
    entry.line = Math.min(entry.line, u.line);
    for (const p of u.props) {
      if (!entry.props.includes(p)) entry.props.push(p);
    }
    byFile.set(u.file, entry);
  }
  return [...byFile.values()].sort(
    (a, b) => b.count - a.count || a.file.localeCompare(b.file)
  );
};

// Props across the uses, most set first.
export const propCounts = (
  scan: ScanOutput,
  component: string
): [string, number][] => {
  const counts = new Map<string, number>();
  for (const u of scan.usages) {
    if (u.component !== component) continue;
    for (const p of new Set(u.props)) counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};

export type Offices = { admin: string[]; public: string[] };

// The component's routes, split by the office the scan gives each path
// (an unknown path counts as admin when it starts with `admin`).
export const routesByOffice = (scan: ScanOutput, routes: string[]): Offices => {
  const office = new Map(scan.routes.map((r) => [r.path, r.office]));
  const out: Offices = { admin: [], public: [] };
  for (const path of [...new Set(routes)].sort()) {
    const o =
      office.get(path) ??
      (path === 'admin' || path.startsWith('admin/') ? 'admin' : 'public');
    out[o].push(path);
  }
  return out;
};

// Findings of the file worth fixing or knowing about (token-var reads are
// the goal, not a finding), in file order.
export const fileFindings = (scan: ScanOutput, file?: string): Finding[] =>
  file
    ? scan.findings
        .filter((f) => f.file === file && f.category !== 'token-var')
        .sort((a, b) => a.line - b.line || a.col - b.col)
    : [];

// Readable names of the finding categories.
export const CATEGORY_LABEL: Record<Finding['category'], string> = {
  px: 'Hard px',
  hex: 'Hex colour',
  rgba: 'rgba colour',
  'named-color': 'Named colour',
  'styled-block': 'Styled block',
  'layout-spacing': 'Layout spacing',
  'legacy-theme': 'Legacy theme',
  'legacy-colors': 'Legacy colours',
  'legacy-bo': 'Legacy back office',
  'token-var': 'Token read',
  'duplicate-candidate': 'Possible duplicate',
};
