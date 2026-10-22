export type FindingCategory =
  | 'px'
  | 'hex'
  | 'rgba'
  | 'named-color'
  | 'styled-block'
  | 'layout-spacing'
  | 'legacy-theme'
  | 'legacy-colors'
  | 'legacy-bo'
  | 'token-var'
  | 'duplicate-candidate';

export type Finding = {
  file: string;
  line: number; // 1-based
  col: number; // 1-based
  raw: string;
  category: FindingCategory;
  suggestion?: { token: string; distance: number };
  confidence: 'high' | 'medium' | 'low';
  component?: string;
};

export type ComponentUsage = {
  component: string;
  file: string;
  line: number;
  props: string[];
};

export type RouteRef = {
  path: string;
  office: 'admin' | 'public';
  file: string;
};

export type ComponentScore = {
  component: string;
  file: string;
  score: number;
  counts: Record<FindingCategory, number>;
  usageCount: number;
  routes: string[];
  status: 'on-tokens' | 'partly' | 'off-tokens';
};

export type PageStatus = {
  path: string;
  office: 'admin' | 'public';
  status: 'rebuilt' | 'partly' | 'legacy';
  libraryPieces: number;
  localPieces: number;
  offSpec: number;
};

export type Totals = {
  offSpec: number;
  legacy: number;
  tokenReads: number;
  components: number;
  onTokens: number;
  partly: number;
  offTokens: number;
  pagesRebuilt: number;
  pagesPartly: number;
  pagesLegacy: number;
};

export type ScanOutput = {
  generatedAt: string;
  commit: string;
  findings: Finding[];
  usages: ComponentUsage[];
  routes: RouteRef[];
  components: ComponentScore[];
  pages: PageStatus[];
  totals: Totals;
};

// Mirrors the entries of app/design-system/tokens/tokens.meta.json (Task 4).
export type TokenMeta = {
  name: string;
  category: string;
  tier: 1 | 2;
  values: { today: string; redesign: string };
  legacy: string[];
};
