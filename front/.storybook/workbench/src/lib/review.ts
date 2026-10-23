// The Review page's logic: which routes a filter or a change touches, the
// real URL of a route on a host, what a platform frame is showing, the
// change list grouped for reading, and the "Copy for PR" text. Pure
// functions over the scan, the change list and the route fixture, plus the
// one writer of token edits into a platform frame.
import type { Mode } from '@ds/tokens/tokens';

import type { ScanOutput, TokenMeta } from './data';
import { applyToDocument, MODE_ATTRIBUTE } from './frame';
import type { Overrides } from './overrides';
import { legacyIndex, tokensOfFinding } from './usage';

// Mirrors scripts/design-system/changes.ts (design-changes.json). Not
// imported from there: that module pulls the token build into this bundle.
export type ChangeCommit = {
  sha: string;
  subject: string;
  body: string;
  // Relative to the repository root (`front/app/...`).
  files: string[];
  component?: string;
  kind: 'heal' | 'lift' | 'token' | 'story' | 'other';
  scanDelta?: { offSpec: number };
};

type ModeValues = { today: string; redesign: string };

export type TokenChange = {
  name: string;
  from: ModeValues | null;
  to: ModeValues | null;
};

export type DesignChanges = {
  generatedAt: string;
  base: string | null;
  baseRef: string | null;
  head: string;
  repoUrl: string;
  commits: ChangeCommit[];
  tokenChanges: TokenChange[];
  tokensNew?: number;
  warnings: string[];
};

export type Office = 'admin' | 'public';

export type RouteRef = { path: string; office: Office };

// ---------------------------------------------------------------- fixture

// .storybook/static/routes.fixture.json. `paths` overrides a param for one
// route (`$slug` is a project, idea, folder or page slug depending on the
// route), so it is read before `params`.
export type RouteFixture = {
  hosts: { after: string; before: string };
  params: Record<string, string>;
  paths: Record<string, Record<string, string>>;
  locale: string;
  missing?: string[];
  source?: { host?: string; fetchedAt?: string };
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const strings = (v: unknown): Record<string, string> =>
  isRecord(v)
    ? Object.fromEntries(
        Object.entries(v).filter(
          (e): e is [string, string] => typeof e[1] === 'string' && !!e[1]
        )
      )
    : {};

// A fixture file that is missing or damaged reads as an empty fixture.
export const normaliseFixture = (raw: unknown): RouteFixture => {
  const r = isRecord(raw) ? raw : {};
  const hosts = isRecord(r.hosts) ? r.hosts : {};
  const paths = isRecord(r.paths) ? r.paths : {};
  return {
    hosts: {
      after: typeof hosts.after === 'string' ? hosts.after : '',
      before: typeof hosts.before === 'string' ? hosts.before : '',
    },
    params: strings(r.params),
    paths: Object.fromEntries(
      Object.entries(paths).map(([k, v]) => [k, strings(v)])
    ),
    locale:
      typeof r.locale === 'string' && /^[a-z]{2}(-[A-Za-z]{2})?$/.test(r.locale)
        ? r.locale
        : 'en',
    missing: Array.isArray(r.missing)
      ? r.missing.filter((m): m is string => typeof m === 'string')
      : [],
    source: isRecord(r.source) ? (r.source as RouteFixture['source']) : {},
  };
};

const PARAM = /^\$([A-Za-z0-9_]+)$/;

export const routeParams = (path: string): string[] =>
  path
    .split('/')
    .map((s) => PARAM.exec(s)?.[1])
    .filter((s): s is string => !!s);

const paramValue = (path: string, name: string, fixture: RouteFixture) =>
  fixture.paths[path]?.[name] ?? fixture.params[name];

// Params of the route the fixture has no record for.
export const unfilledParams = (path: string, fixture: RouteFixture): string[] =>
  routeParams(path).filter((p) => !paramValue(path, p, fixture));

// The route on `host` with its params filled and the locale in front:
// `admin/projects/$projectId` -> `https://host/en/admin/projects/<id>`.
// An empty string when a param has no record (see unfilledParams).
export const resolveRoute = (
  path: string,
  fixture: RouteFixture,
  host: string
): string => {
  if (unfilledParams(path, fixture).length) return '';
  const filled = path
    .split('/')
    .map((s) => {
      const name = PARAM.exec(s)?.[1];
      return name
        ? encodeURIComponent(paramValue(path, name, fixture) as string)
        : s;
    })
    .join('/');
  return `${host.replace(/\/+$/, '')}/${fixture.locale}/${filled}`;
};

// ---------------------------------------------------------------- routes

// The scanner's off-spec categories (scan/score.ts OFF_SPEC).
export const OFF_SPEC = new Set([
  'px',
  'hex',
  'rgba',
  'named-color',
  'layout-spacing',
]);

// Changed files of the change list, relative to front/ as the scan has them.
export const changedFiles = (commits: ChangeCommit[]): Set<string> =>
  new Set(
    commits.flatMap((c) =>
      c.files
        .filter((f) => f.startsWith('front/'))
        .map((f) => f.slice('front/'.length))
    )
  );

const routesOfFiles = (
  scan: ScanOutput,
  files: Set<string>,
  shell: Set<string> = new Set()
): Set<string> => {
  const out = new Set<string>();
  if (files.size === 0) return out;
  for (const [route, list] of Object.entries(scan.routeFiles ?? {})) {
    if (list.some((f) => files.has(f) && !shell.has(f))) out.add(route);
  }
  return out;
};

// A file in at least this share of the route closures is the app shell
// (App/index.tsx, the theme bridge, the router): a change there reaches
// every page, so it is reported once instead of marking every route.
export const SHELL_SHARE = 0.9;
// Below this many routes the share says nothing.
const SHELL_MIN_ROUTES = 10;

export const shellFiles = (
  scan: ScanOutput,
  share = SHELL_SHARE
): Set<string> => {
  const closures = Object.values(scan.routeFiles ?? {});
  const out = new Set<string>();
  if (closures.length < SHELL_MIN_ROUTES) return out;
  const count = new Map<string, number>();
  for (const list of closures) {
    for (const f of new Set(list)) count.set(f, (count.get(f) ?? 0) + 1);
  }
  count.forEach((n, f) => {
    if (n >= closures.length * share) out.add(f);
  });
  return out;
};

// The overridden tokens and every token whose value reads one of them
// (`--gv-radius-control: var(--gv-radius-2)`), to a fixed point.
export const reachedTokens = (
  names: string[],
  meta: TokenMeta[]
): Set<string> => {
  const out = new Set(names);
  let grew = names.length > 0;
  while (grew) {
    grew = false;
    for (const t of meta) {
      if (out.has(t.name)) continue;
      const values = `${t.values.today} ${t.values.redesign}`;
      if ([...out].some((n) => values.includes(`var(${n}`))) {
        out.add(t.name);
        grew = true;
      }
    }
  }
  return out;
};

// Files whose findings stand for one of the tokens (token-var reads and the
// legacy names that map to them).
const filesOfTokens = (
  scan: ScanOutput,
  tokens: Set<string>,
  meta: TokenMeta[]
): Set<string> => {
  const files = new Set<string>();
  if (tokens.size === 0) return files;
  const legacy = legacyIndex(meta);
  const known = new Set(meta.map((t) => t.name));
  for (const f of scan.findings) {
    if (files.has(f.file)) continue;
    if (tokensOfFinding(f, legacy, known).some((n) => tokens.has(n))) {
      files.add(f.file);
    }
  }
  return files;
};

// The commits that change how pages look. Stories, tags, tooling and
// scanner commits never mark a route; they are listed in Changes only.
export const DESIGN_KINDS = new Set(['token', 'heal', 'lift']);

export const isDesignCommit = (c: ChangeCommit) => DESIGN_KINDS.has(c.kind);

export type ChangeReach = {
  // Routes the changes touch, the shell left out.
  routes: Set<string>;
  // Changed or token-reading shell files: they affect every page.
  shellFiles: string[];
  // Commits that change a shell file.
  shellCommits: string[];
};

// What the branch's design commits and the session's token edits reach:
// routes whose files a design commit changed, and routes rendering a file
// that reads an overridden token. Other commits reach nothing here. Shell
// files (see shellFiles) mark no route; they are listed apart.
export const changeReach = (
  scan: ScanOutput,
  changes: DesignChanges | undefined,
  overrides: Overrides,
  meta: TokenMeta[],
  shell: Set<string> = shellFiles(scan)
): ChangeReach => {
  const commits = (changes?.commits ?? []).filter(isDesignCommit);
  const changed = changedFiles(commits);
  const tokens = reachedTokens(Object.keys(overrides), meta);
  const reading = filesOfTokens(scan, tokens, meta);
  const routes = routesOfFiles(scan, changed, shell);
  routesOfFiles(scan, reading, shell).forEach((r) => routes.add(r));
  const hit = [...shell].filter((f) => changed.has(f) || reading.has(f));
  return {
    routes,
    shellFiles: hit.sort(),
    shellCommits: commits
      .filter((c) => [...changedFiles([c])].some((f) => shell.has(f)))
      .map((c) => c.sha),
  };
};

// Routes a change touches, the shell left out (see changeReach).
export const affectedRoutes = (
  scan: ScanOutput,
  changes: DesignChanges | undefined,
  overrides: Overrides,
  meta: TokenMeta[],
  shell?: Set<string>
): Set<string> => changeReach(scan, changes, overrides, meta, shell).routes;

// Routes one design commit touches, the shell left out, and whether it
// changes the shell (it then affects every page). Other commits reach
// nothing.
export const commitReach = (
  scan: ScanOutput,
  commit: ChangeCommit,
  shell: Set<string> = shellFiles(scan)
): { routes: Set<string>; shell: boolean } => {
  if (!isDesignCommit(commit)) return { routes: new Set(), shell: false };
  const files = changedFiles([commit]);
  return {
    routes: routesOfFiles(scan, files, shell),
    shell: [...files].some((f) => shell.has(f)),
  };
};

export type RouteFilter = {
  component?: string;
  office?: Office | 'all';
  onlyAffected?: boolean;
  changes?: DesignChanges;
  overrides?: Overrides;
  meta?: TokenMeta[];
  search?: string;
  // Only the routes one commit (by sha) touches.
  commit?: string;
  // Precomputed affectedRoutes, to filter many times per change.
  affected?: Set<string>;
  // Precomputed shellFiles.
  shell?: Set<string>;
};

// Each scanned path once, in scan order, filtered.
export const routesFor = (scan: ScanOutput, f: RouteFilter): RouteRef[] => {
  const seen = new Set<string>();
  let routes: RouteRef[] = [];
  for (const r of scan.routes) {
    if (seen.has(r.path)) continue;
    seen.add(r.path);
    routes.push({ path: r.path, office: r.office });
  }
  if (f.component) {
    const on = new Set(
      scan.components.find((c) => c.component === f.component)?.routes ?? []
    );
    routes = routes.filter((r) => on.has(r.path));
  }
  if (f.office && f.office !== 'all') {
    routes = routes.filter((r) => r.office === f.office);
  }
  if (f.onlyAffected) {
    const hit =
      f.affected ??
      affectedRoutes(scan, f.changes, f.overrides ?? {}, f.meta ?? [], f.shell);
    routes = routes.filter((r) => hit.has(r.path));
  }
  if (f.commit) {
    const commit = f.changes?.commits.find((c) => c.sha === f.commit);
    const hit = commit
      ? commitReach(scan, commit, f.shell).routes
      : new Set<string>();
    routes = routes.filter((r) => hit.has(r.path));
  }
  const q = f.search?.trim().toLowerCase();
  if (q) routes = routes.filter((r) => `/${r.path}`.toLowerCase().includes(q));
  return routes;
};

// Off-spec findings and files per route, for the list's counts.
export const routeStats = (
  scan: ScanOutput
): Map<string, { files: number; offSpec: number }> => {
  const perFile = new Map<string, number>();
  for (const f of scan.findings) {
    if (OFF_SPEC.has(f.category)) {
      perFile.set(f.file, (perFile.get(f.file) ?? 0) + 1);
    }
  }
  const out = new Map<string, { files: number; offSpec: number }>();
  for (const [route, files] of Object.entries(scan.routeFiles ?? {})) {
    let offSpec = 0;
    for (const file of files) offSpec += perFile.get(file) ?? 0;
    out.set(route, { files: files.length, offSpec });
  }
  return out;
};

// ---------------------------------------------------------------- frames

export type FrameState = 'ok' | 'login' | 'cross-origin' | 'blank';

// What a platform frame shows. `login`: the sign-in page (its path, or a
// sign-in form), or an admin route that redirected away from the admin
// (the platform sends a visitor without admin rights to the home page).
// `cross-origin`: reading the document threw. Pass a function to read the
// document inside the same guard (`() => iframe.contentWindow.document`).
export const frameState = (
  input: Document | null | (() => Document | null),
  expectedPath?: string
): FrameState => {
  try {
    const doc = typeof input === 'function' ? input() : input;
    if (!doc) return 'blank';
    const url = doc.URL;
    if (!url || url === 'about:blank') return 'blank';
    const path = new URL(url).pathname;
    if (/\/sign-in(\/|$)/.test(path)) return 'login';
    if (doc.body?.querySelector('form[action*="sign_in"]')) return 'login';
    if (
      expectedPath !== undefined &&
      /^admin(\/|$)/.test(expectedPath) &&
      !/^\/[^/]+\/admin(\/|$)/.test(path)
    ) {
      return 'login';
    }
    return 'ok';
  } catch {
    return 'cross-origin';
  }
};

// The platform's cookie modal covers the page. A frame declines it with
// the modal's own button (the choice is saved like a visitor's, for this
// origin), once it shows. True when it clicked.
export const dismissConsent = (doc: Document): boolean => {
  const reject = doc.querySelector<HTMLElement>(
    '[data-testid="reject-cookies-btn"]'
  );
  if (!reject) return false;
  reject.click();
  return true;
};

export const LIBRARY_ROOT = 'app/component-library/';

// Whether the highlight can find a component in a frame: library
// components carry data-gv-component on a tagged build; UI and admin
// components are never tagged.
export const highlightSupport = (
  componentFile: string | undefined,
  pageTagged: boolean
): 'ok' | 'untagged-component' | 'untagged-build' => {
  if (!componentFile?.startsWith(LIBRARY_ROOT)) return 'untagged-component';
  return pageTagged ? 'ok' : 'untagged-build';
};

const inlineGv = (doc: Document): Map<string, string> => {
  const style = doc.documentElement.style;
  const out = new Map<string, string>();
  for (let i = 0; i < style.length; i++) {
    if (style[i].startsWith('--gv-')) {
      out.set(style[i], style.getPropertyValue(style[i]));
    }
  }
  return out;
};

// Puts the session's edits and the mode on a platform document through
// applyToDocument, without losing the page's own inline tokens (the
// platform's ModeProvider writes --gv-tenant-* there). `applied` remembers,
// per token this function set, the page's value before (null: none), so a
// reset edit gets the page's value back. Keep one map per document.
export const applyEdits = (
  doc: Document,
  overrides: Overrides,
  mode: Mode | undefined,
  applied: Map<string, string | null>
) => {
  const own: Record<string, string> = {};
  inlineGv(doc).forEach((value, name) => {
    if (!applied.has(name)) own[name] = value;
  });
  applied.forEach((original, name) => {
    if (!(name in overrides) && original !== null) own[name] = original;
  });
  for (const name of Object.keys(overrides)) {
    if (!applied.has(name)) applied.set(name, own[name] ?? null);
  }
  for (const name of [...applied.keys()]) {
    if (!(name in overrides)) applied.delete(name);
  }
  applyToDocument(doc, { ...own, ...overrides } as Overrides, mode);
};

export { MODE_ATTRIBUTE };

// ---------------------------------------------------------------- changes

export type CommitGroup = {
  // null: commits that name no component.
  component: string | null;
  kinds: { kind: ChangeCommit['kind']; commits: ChangeCommit[] }[];
  count: number;
};

const KIND_ORDER = ['token', 'heal', 'lift', 'story', 'other'];

// Commits by component (A to Z, the ones without a component last), then
// by kind (token, heal, lift, story, other), newest first inside.
export const groupCommits = (commits: ChangeCommit[]): CommitGroup[] => {
  const by = new Map<string | null, ChangeCommit[]>();
  for (const c of commits) {
    const key = c.component ?? null;
    by.set(key, [...(by.get(key) ?? []), c]);
  }
  return [...by.entries()]
    .sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : a.localeCompare(b)))
    .map(([component, list]) => ({
      component,
      count: list.length,
      kinds: KIND_ORDER.map((kind) => ({
        kind: kind as ChangeCommit['kind'],
        commits: list.filter((c) => c.kind === kind),
      })).filter((k) => k.commits.length > 0),
    }));
};

// The GitHub view of a changed file on the branch.
export const fileLink = (repoUrl: string, branch: string, file: string) =>
  `${repoUrl.replace(/\/+$/, '')}/blob/${branch}/${file}`;

export const SEEN_KEY = 'gv-review-seen';

export const readSeen = (): Set<string> => {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return new Set(
      Array.isArray(list) ? list.filter((s) => typeof s === 'string') : []
    );
  } catch {
    return new Set();
  }
};

export const writeSeen = (seen: Set<string>) => {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // Storage blocked: the marks last for this visit only.
  }
};

// ---------------------------------------------------------------- hash

export type ReviewState = {
  route?: string;
  component?: string;
  office: Office | 'all';
  only: boolean;
  tab: 'routes' | 'changes';
};

const KEYS = ['route', 'component', 'office', 'only', 'tab'];

// `#/review?route=...&component=...&office=admin&only=1&tab=changes`; the
// `o` parameter (overrides) belongs to useOverrides.
export const parseReviewHash = (hash: string): ReviewState => {
  const q = hash.indexOf('?');
  const p = new URLSearchParams(q === -1 ? '' : hash.slice(q + 1));
  const office = p.get('office');
  return {
    route: p.get('route') ?? undefined,
    component: p.get('component') || undefined,
    office: office === 'admin' || office === 'public' ? office : 'all',
    only: p.get('only') === '1',
    tab: p.get('tab') === 'changes' ? 'changes' : 'routes',
  };
};

// The hash with the review state written, other parameters kept.
export const reviewHash = (hash: string, s: ReviewState): string => {
  const q = hash.indexOf('?');
  const path = q === -1 ? hash || '#/review' : hash.slice(0, q);
  const p = new URLSearchParams(q === -1 ? '' : hash.slice(q + 1));
  KEYS.forEach((k) => p.delete(k));
  if (s.route !== undefined) p.set('route', s.route);
  if (s.component) p.set('component', s.component);
  if (s.office !== 'all') p.set('office', s.office);
  if (s.only) p.set('only', '1');
  if (s.tab !== 'routes') p.set('tab', s.tab);
  const query = p.toString();
  return query ? `${path}?${query}` : path;
};

// ---------------------------------------------------------------- summary

export type ReviewSummary = {
  commits: number;
  kinds: Record<string, number>;
  // Token, heal and lift commits: the changes to how pages look.
  designCommits: number;
  stories: number;
  // Every other commit: workbench, scripts, the scanner.
  tooling: number;
  tokenEdits: number;
  tokenChanges: number;
  edits: [string, string][];
  // Components of heal and lift commits.
  components: string[];
  routes: string[];
  shellFiles: string[];
  // Off-spec now, and before the commits that are not scanner changes.
  offSpecBefore: number;
  offSpecAfter: number;
  // What scanner rule commits moved the count by (not a design change).
  scannerDelta: number;
  // What story and tooling commits moved it by.
  otherDelta: number;
};

// A commit that changes the scanner changes what is counted, not the pages.
export const isScannerCommit = (c: ChangeCommit) =>
  c.files.some((f) => f.startsWith('front/scripts/design-system/scan/'));

export const reviewSummary = (
  scan: ScanOutput,
  {
    changes,
    overrides,
    meta,
  }: { changes?: DesignChanges; overrides: Overrides; meta: TokenMeta[] }
): ReviewSummary => {
  const commits = changes?.commits ?? [];
  const kinds: Record<string, number> = {};
  commits.forEach((c) => (kinds[c.kind] = (kinds[c.kind] ?? 0) + 1));
  const design = commits.filter(isDesignCommit);
  const stories = commits.filter((c) => c.kind === 'story').length;
  const delta = (list: ChangeCommit[]) =>
    list.reduce((n, c) => n + (c.scanDelta?.offSpec ?? 0), 0);
  const scanner = commits.filter(isScannerCommit);
  const after = scan.totals?.offSpec ?? 0;
  const reach = changeReach(scan, changes, overrides, meta);
  return {
    commits: commits.length,
    kinds,
    designCommits: design.length,
    stories,
    tooling: commits.length - design.length - stories,
    tokenEdits: Object.keys(overrides).length,
    tokenChanges: changes?.tokenChanges.length ?? 0,
    edits: Object.entries(overrides).filter(
      (e): e is [string, string] => typeof e[1] === 'string'
    ),
    components: [
      ...new Set(
        design
          .filter((c) => c.kind !== 'token')
          .map((c) => c.component)
          .filter((c): c is string => !!c)
      ),
    ].sort((a, b) => a.localeCompare(b)),
    routes: [...reach.routes].sort(),
    shellFiles: reach.shellFiles,
    offSpecBefore: after - delta(design),
    offSpecAfter: after,
    scannerDelta: delta(scanner),
    otherDelta: delta(
      commits.filter((c) => !isDesignCommit(c) && !isScannerCommit(c))
    ),
  };
};

// `admin/projects/$projectId` as `/admin/projects/:projectId`, the way the
// route list shows it.
export const routeLabel = (path: string) =>
  `/${path.replace(/(^|\/)\$([A-Za-z0-9_]+)/g, '$1:$2')}`;

const LIST_MAX = 12;

const capped = (items: string[], format: (s: string) => string) => {
  const shown = items.slice(0, LIST_MAX).map(format).join(', ');
  const rest = items.length - LIST_MAX;
  return rest > 0 ? `${shown} and ${rest} more` : shown;
};

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

// The "Copy for PR" block: the summary sentence, the numbers, the touched
// components and routes, and the link that opens this review.
const signed = (n: number) => `${n > 0 ? '+' : ''}${n}`;

export const prMarkdown = (s: ReviewSummary, link: string): string => {
  const changes = s.designCommits + s.tokenChanges + s.tokenEdits;
  const delta = s.offSpecAfter - s.offSpecBefore;
  const reach = [
    s.components.length ? plural(s.components.length, 'component') : '',
    plural(s.routes.length, 'route'),
  ]
    .filter(Boolean)
    .join(' and ');
  // No scanned route but shell files: the change reaches every page.
  const where =
    !s.components.length && !s.routes.length && s.shellFiles.length
      ? ' to shell files on every page'
      : ` across ${reach}${
          s.shellFiles.length ? ' (plus shell files on every page)' : ''
        }`;
  const lines = [
    `**${plural(
      changes,
      'design change'
    )}${where}, reviewed in the workbench.**`,
    '',
  ];
  if (s.designCommits) {
    const kinds = KIND_ORDER.filter((k) => DESIGN_KINDS.has(k) && s.kinds[k])
      .map((k) => `${s.kinds[k]} ${k}`)
      .join(', ');
    lines.push(`- Design commits: ${s.designCommits} (${kinds})`);
  }
  if (s.stories || s.tooling) {
    const other = [
      s.stories ? plural(s.stories, 'story commit') : '',
      s.tooling ? plural(s.tooling, 'tooling commit') : '',
    ].filter(Boolean);
    lines.push(`- Not counted as design changes: ${other.join(', ')}`);
  }
  if (s.tokenChanges) {
    lines.push(`- Token source changes: ${s.tokenChanges}`);
  }
  if (s.edits.length) {
    lines.push(
      `- Token edits in the link: ${s.edits
        .map(([n, v]) => `\`${n}\`: ${v}`)
        .join(', ')}`
    );
  }
  lines.push(
    `- Off-spec values: ${s.offSpecBefore} before the design commits, ${
      s.offSpecAfter
    } now (${signed(delta)})${
      s.scannerDelta
        ? `. Scanner rule changes moved the count by ${signed(
            s.scannerDelta
          )} and are not in this delta`
        : ''
    }${
      s.otherDelta ? `. Other commits moved it by ${signed(s.otherDelta)}` : ''
    }`
  );
  if (s.shellFiles.length) {
    lines.push(
      `- Shell files changed, they affect every page: ${capped(
        s.shellFiles,
        (f) => `\`${f}\``
      )}`
    );
  }
  if (s.components.length) {
    lines.push(`- Components: ${capped(s.components, (c) => c)}`);
  }
  if (s.routes.length) {
    lines.push(`- Routes: ${capped(s.routes, (r) => `\`${routeLabel(r)}\``)}`);
  }
  lines.push('', `[Open the review](${link})`);
  return lines.join('\n');
};
