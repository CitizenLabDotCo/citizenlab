// What the Review page and the canvas share: the change list's shape
// (design-changes.json), the route fixture and the real URL of a route on
// a host, the routes a design commit reaches, and the one writer of token
// edits into a platform document. Pure functions over the scan, the change
// list and the route fixture.
import type { ScanOutput } from './data';
import { applyToDocument } from './frame';
import type { Overrides } from './overrides';

// Mirrors scripts/design-system/changes.ts (design-changes.json). Not
// imported from there: that module pulls the token build into this bundle.
export type ChangeCommit = {
  sha: string;
  subject: string;
  body: string;
  // Relative to the repository root (`front/app/...`).
  files: string[];
  component?: string;
  kind: 'heal' | 'lift' | 'token' | 'design' | 'story' | 'other';
  scanDelta?: { offSpec: number };
  // The story that shows the change (the commit's `Story:` line).
  story?: string;
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
  tokensNew?: number;
  warnings: string[];
};

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

// The commits that change how pages look. Stories, tags, tooling and
// scanner commits never mark a route; they are listed in Changes only.
export const DESIGN_KINDS = new Set(['token', 'heal', 'lift', 'design']);

export const isDesignCommit = (c: ChangeCommit) => DESIGN_KINDS.has(c.kind);

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

// ---------------------------------------------------------------- frames

// The --gv-* tokens on a document's root element: the page's own (the
// city's tenant slots) and the session's overrides.
export const inlineGv = (doc: Document): Map<string, string> => {
  const style = doc.documentElement.style;
  const out = new Map<string, string>();
  for (let i = 0; i < style.length; i++) {
    if (style[i].startsWith('--gv-')) {
      out.set(style[i], style.getPropertyValue(style[i]));
    }
  }
  return out;
};

// Puts the session's edits on a platform document through applyToDocument,
// without losing the page's own inline tokens (Storybook's theme context
// writes --gv-tenant-* there). `applied` remembers,
// per token this function set, the page's value before (null: none), so a
// reset edit gets the page's value back. Keep one map per document.
export const applyEdits = (
  doc: Document,
  overrides: Overrides,
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
  applyToDocument(doc, { ...own, ...overrides } as Overrides);
};

// After the page wrote its own inline tokens again (a story mounted anew,
// in another city), a token that no longer holds the edit applyEdits put
// there holds the page's new value: that is the value a reset gets back.
// The edit is compared as the browser reads it back once written (' 8px '
// reads '8px'). Call it before applyEdits, only when the page may have
// written them.
export const adoptPageTokens = (
  doc: Document,
  overrides: Overrides,
  applied: Map<string, string | null>
) => {
  const inline = inlineGv(doc);
  const probe = doc.createElement('div').style;
  applied.forEach((_, name) => {
    const edit = (overrides as Record<string, string | undefined>)[name];
    if (edit === undefined) return;
    probe.setProperty(name, edit);
    const written = probe.getPropertyValue(name);
    const value = inline.get(name);
    if (value !== written) applied.set(name, value || null);
  });
};
