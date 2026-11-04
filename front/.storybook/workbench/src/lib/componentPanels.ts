// What the Usage panel and the Design tab show for one component: the files
// that use it, the routes it renders on and its findings. Pure functions
// over the scan.
import type { Finding, ScanOutput } from './data';

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

// ---------------------------------------------------------------- usage

const BARREL = /^app\/component-library\/index\.tsx?$/;

// A use of the component elsewhere: not its own file, not the barrel.
const isUse = (u: { file: string }, ownFile?: string) =>
  u.file !== ownFile && !BARREL.test(u.file);

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
    if (u.component !== component || !isUse(u, ownFile)) continue;
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

// Props across the uses (the same uses as `usageFiles`), most set first.
export const propCounts = (
  scan: ScanOutput,
  component: string,
  ownFile?: string
): [string, number][] => {
  const counts = new Map<string, number>();
  for (const u of scan.usages) {
    if (u.component !== component || !isUse(u, ownFile)) continue;
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
