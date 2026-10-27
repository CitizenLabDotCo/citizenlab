// Data the shell reads. Everything except the token metadata is fetched at
// runtime from the Storybook static dir, one level up from the shell, so the
// same relative URLs work under /storybook/workbench/ and under /workbench/.
// A file that is missing, unreachable or not valid JSON yields an empty value.
import tokensMeta from '@ds/tokens/tokens.meta.json';

import { setTokenSource } from './liveSource';

import type { ThumbManifest } from './thumbs';
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
        .catch(() => empty)
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

// Bundled, so it is there synchronously. A local run (npm run ds:local)
// swaps in the files as they are now before the first render, since saved
// edits change them after this bundle was built.
export const TOKEN_META = tokensMeta as TokenMeta[];
export const setLiveTokens = (live: { meta: TokenMeta[]; source: unknown }) => {
  TOKEN_META.splice(0, TOKEN_META.length, ...live.meta);
  setTokenSource(live.source);
};

export const loadStoryIndex = () =>
  fetchJson<StoryIndex>('../index.json', { entries: {} });

// Shapes are owned by the tasks that produce these files. A review stacked
// on the workbench ships its own list (review-changes.json, ds:changes);
// every other build has only design-changes.json.
export const loadChanges = () =>
  fetchJson<Record<string, unknown> | null>(
    '../review-changes.json',
    null
  ).then((review) =>
    review && Array.isArray(review.commits)
      ? review
      : fetchJson<Record<string, unknown>>('../design-changes.json', {})
  );

export const loadRouteFixture = () =>
  fetchJson<unknown>('../routes.fixture.json', {});

// null when the build has no results (ds:a11y has not run).
export const loadA11y = () =>
  fetchJson<A11yResults | null>('../a11y-results.json', null).then((r) =>
    r && typeof r === 'object' && 'stories' in r ? r : null
  );

// The pictures ds:thumbs took of the gallery cards' stories; null when the
// build has none (the cards render live then).
export const loadThumbs = () =>
  fetchJson<ThumbManifest | null>('../thumbs.json', null).then((m) =>
    m && typeof m === 'object' && 'thumbs' in m ? m : null
  );
