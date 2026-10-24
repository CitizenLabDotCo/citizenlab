// Merge into: homemade markup that a library component already covers (a
// styled `button`, `input`, `select`, a link styled as a button), found in
// the scan's styled blocks, and the task that swaps one for the library
// component. Pure functions over the scan.
//
//   merge: <local name> · <file>:<line> · <styled block> → <Component> (<file>)
//   why: look-alike, homemade markup the library component covers
//   check: story <story id>, routes <list>
import type { Finding, ScanOutput } from './data';
import { MAX_TASK_ROUTES, routeLabel } from './healTask';

// The library component each kind of homemade markup becomes. `link`: only
// when the link looks like a button; a text link stays a link.
const TARGETS: { test: RegExp; component: string; note?: string }[] = [
  { test: /^styled\.button\b/, component: 'Button' },
  {
    test: /^styled\.input\.attrs\(\{type:'checkbox'\}\)/,
    component: 'Checkbox',
  },
  { test: /^styled\.input\.attrs\(\{type:'radio'\}\)/, component: 'Radio' },
  { test: /^styled\.input$/, component: 'Input' },
  { test: /^styled\.select$/, component: 'Select' },
  { test: /^styled\.textarea$/, component: 'TextArea' },
  { test: /^styled\.label$/, component: 'Label' },
  {
    test: /^(styled\.a|typedStyled\(Link\)|styled\(OriginalLink\))$/,
    component: 'ButtonWithLink',
    note: 'only if it looks like a button',
  },
];

// The library's own internals build on plain markup: not look-alikes.
const LIBRARY = /^app\/component-library\//;

const flat = (raw: string) => raw.replace(/\s+/g, '');

export type LookAlike = {
  finding: Finding;
  // What the scan calls the styled block (`StyledButton`).
  name: string;
  target: string;
  note?: string;
};

export const lookAlikeOf = (f: Finding): LookAlike | null => {
  if (f.category !== 'styled-block' || LIBRARY.test(f.file)) return null;
  const raw = flat(f.raw);
  const t = TARGETS.find((x) => x.test.test(raw));
  if (!t) return null;
  return {
    finding: f,
    name: f.component ?? raw,
    target: t.component,
    note: t.note,
  };
};

// The look-alikes the component could replace, admin files first (admin
// goes first, SPEC), then by file and line.
export const lookAlikesFor = (
  scan: ScanOutput,
  component: string
): LookAlike[] => {
  const admin = (file: string) => /\/(Admin|admin)\//.test(file);
  return scan.findings
    .map(lookAlikeOf)
    .filter((l): l is LookAlike => l !== null && l.target === component)
    .sort(
      (a, b) =>
        Number(admin(b.finding.file)) - Number(admin(a.finding.file)) ||
        a.finding.file.localeCompare(b.finding.file) ||
        a.finding.line - b.finding.line
    );
};

const dirOf = (file: string) => file.replace(/\/[^/]*$/, '');

// Of the items, those whose file's folder holds the file most closely.
const closest = <T>(items: T[], fileOf: (t: T) => string, file: string) => {
  const dir = dirOf(file);
  let best = -1;
  let found: T[] = [];
  for (const t of items) {
    const d = dirOf(fileOf(t));
    if (dir !== d && !dir.startsWith(`${d}/`)) continue;
    if (d.length > best) {
      best = d.length;
      found = [];
    }
    if (d.length === best) found.push(t);
  }
  return found;
};

// The routes that render the file, as near as the scan can tell: those of
// the scanned component whose folder holds it, else the page files above.
export const routesOfFile = (scan: ScanOutput, file: string): string[] => {
  const owner = closest(scan.components ?? [], (c) => c.file, file);
  const routes = owner.length
    ? owner.flatMap((c) => c.routes)
    : closest(scan.routes, (r) => r.file, file).map((r) => r.path);
  return [...new Set(routes)].sort();
};

export const formatMergeTask = (
  l: LookAlike,
  targetFile: string | undefined,
  storyId: string,
  routes: string[]
): string => {
  const named = routes.slice(0, MAX_TASK_ROUTES).map(routeLabel).join(', ');
  const rest = routes.length - MAX_TASK_ROUTES;
  const list =
    routes.length === 0
      ? 'none known'
      : rest > 0
      ? `${named} and ${rest} more`
      : named;
  const f = l.finding;
  return [
    `merge: ${l.name} · ${f.file}:${f.line} · ${flat(f.raw)} → ${l.target}${
      targetFile ? ` (${targetFile})` : ''
    }`,
    `why: look-alike, homemade markup the library component covers${
      l.note ? `, ${l.note}` : ''
    }`,
    `check: story ${storyId}, routes ${list}`,
  ].join('\n');
};
