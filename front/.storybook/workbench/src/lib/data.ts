// Data the shell reads. Everything except the token metadata is fetched at
// runtime from the Storybook static dir, one level up from the shell, so the
// same relative URLs work under /storybook/workbench/ and under /workbench/.
// A file that is missing, unreachable or not valid JSON yields an empty value
// and its name is added to `missing`, which the Start here page lists.
import tokensMeta from '@ds/tokens/tokens.meta.json';

import type { A11yResults } from '../../../../scripts/design-system/a11y-results';
import type {
  ComponentScore,
  Finding,
  ScanOutput,
  TokenMeta,
} from '../../../../scripts/design-system/scan/schema';

export type { ComponentScore, Finding, ScanOutput, TokenMeta };

export type StoryEntry = {
  id: string;
  title: string;
  name: string;
  tags: string[];
  importPath: string;
  type?: string;
  exportName?: string;
  componentPath?: string;
};

export type StoryIndex = { entries: Record<string, StoryEntry> };

export const missing: string[] = [];

const cache = new Map<string, Promise<unknown>>();

const fetchJson = <T>(url: string, empty: T): Promise<T> => {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .catch(() => {
          if (!missing.includes(url)) missing.push(url);
          return empty;
        })
    );
  }
  return cache.get(url) as Promise<T>;
};

const EMPTY_SCAN: ScanOutput = {
  generatedAt: '',
  commit: '',
  findings: [],
  usages: [],
  routes: [],
  components: [],
  pages: [],
  totals: {
    offSpec: 0,
    legacy: 0,
    tokenReads: 0,
    components: 0,
    onTokens: 0,
    partly: 0,
    offTokens: 0,
    pagesRebuilt: 0,
    pagesPartly: 0,
    pagesLegacy: 0,
  },
};

export const loadScan = () =>
  fetchJson<ScanOutput>('../design-scan.json', EMPTY_SCAN);

// Bundled, so it is there synchronously.
export const TOKEN_META = tokensMeta as TokenMeta[];

export const loadTokens = (): Promise<TokenMeta[]> =>
  Promise.resolve(TOKEN_META);

export const loadStoryIndex = () =>
  fetchJson<StoryIndex>('../index.json', { entries: {} });

// Shapes are owned by the tasks that produce these files.
export const loadChanges = () =>
  fetchJson<Record<string, unknown>>('../design-changes.json', {});

// The committed scan totals and their history (trend.json), for the
// Proposal page; null when the build has none.
export const loadSummary = () =>
  fetchJson<Record<string, unknown> | null>(
    '../design-scan.summary.json',
    null
  );

export const loadTrend = () =>
  fetchJson<{ points?: unknown } | null>('../trend.json', null);

export const loadRouteFixture = () =>
  fetchJson<unknown>('../routes.fixture.json', {});

// null when the build has no results (ds:a11y has not run).
export const loadA11y = () =>
  fetchJson<A11yResults | null>('../a11y-results.json', null).then((r) =>
    r && typeof r === 'object' && 'stories' in r ? r : null
  );

// Instance audits (npm run ds:audit) are optional: a build without them is
// complete, so they never count as missing.
export type AuditSummary = {
  component: string;
  generatedAt: string;
  host: string;
  story?: string;
  // Writes blocked after a click (an alarm) and on page load (expected).
  blockedWrites: number;
  blockedOnLoad: number;
  instances: { route: string; viewport: string; error?: string }[];
  notReached: { route: string; reason: string }[];
  inconsistencies: string[];
  healTasks: string[];
};

type AuditIndexFile = {
  components?: Record<string, { file?: string } | undefined>;
};

const fetchOptional = <T>(url: string): Promise<T | null> => {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null)
    );
  }
  return cache.get(url) as Promise<T | null>;
};

export const loadAudits = () =>
  fetchOptional<AuditIndexFile>('../audits/index.json').then((r) => r ?? {});

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown) => (typeof v === 'number' && v >= 0 ? v : 0);
const objects = (v: unknown) =>
  (Array.isArray(v) ? v : []).filter(
    (x): x is Record<string, unknown> => !!x && typeof x === 'object'
  );
const strings = (v: unknown) =>
  (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === 'string');

// Every field the Audit section reads, typed, with missing or malformed
// parts as empty values: an older or hand-edited file cannot crash it.
export const normaliseAudit = (
  raw: unknown,
  component: string
): AuditSummary | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const a = raw as Record<string, unknown>;
  return {
    component: str(a.component) || component,
    generatedAt: str(a.generatedAt),
    host: str(a.host),
    story: str(a.story) || undefined,
    blockedWrites: num(a.blockedWrites),
    blockedOnLoad: num(a.blockedOnLoad),
    instances: objects(a.instances).map((i) => ({
      route: str(i.route),
      viewport: str(i.viewport),
      ...(i.error === undefined ? {} : { error: str(i.error) || 'error' }),
    })),
    notReached: objects(a.notReached).map((n) => ({
      route: str(n.route),
      reason: str(n.reason),
    })),
    inconsistencies: strings(a.inconsistencies),
    healTasks: strings(a.healTasks),
  };
};

// The committed audit of one component, or null when it has none.
export const loadAudit = async (
  component: string
): Promise<AuditSummary | null> => {
  const file = (await loadAudits()).components?.[component]?.file;
  if (!file || !/^audits\/[\w-]+\.json$/.test(file)) return null;
  return normaliseAudit(await fetchOptional<unknown>(`../${file}`), component);
};

export const loadAll = () =>
  Promise.all([
    loadScan(),
    loadTokens(),
    loadStoryIndex(),
    loadChanges(),
    loadA11y(),
    loadAudits(),
    // Read here too, so Start here's missing list does not depend on which
    // page was visited first.
    loadSummary(),
    loadTrend(),
    loadRouteFixture(),
  ]);
