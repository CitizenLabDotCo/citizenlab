// Data the shell reads. Everything except the token metadata is fetched at
// runtime from the Storybook static dir, one level up from the shell, so the
// same relative URLs work under /storybook/workbench/ and under /workbench/.
// A file that is missing, unreachable or not valid JSON yields an empty value
// and its name is added to `missing`, which the Start here page lists.
import tokensMeta from '@ds/tokens/tokens.meta.json';

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

export const loadA11y = () =>
  fetchJson<Record<string, unknown>>('../a11y-results.json', {});

export const loadAudits = () =>
  fetchJson<Record<string, unknown>>('../audits/index.json', {});

export const loadAll = () =>
  Promise.all([
    loadScan(),
    loadTokens(),
    loadStoryIndex(),
    loadChanges(),
    loadA11y(),
    loadAudits(),
  ]);
