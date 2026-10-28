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
  // What a legacy read (legacy-theme, -colors, -bo) renders with the default
  // theme, when that is static and the same in every city.
  value?: string;
  suggestion?: { token: string; distance: number };
  confidence: 'high' | 'medium' | 'low';
  component?: string;
};

export type ComponentUsage = {
  component: string;
  file: string;
  line: number;
  props: string[];
  // Lines of the component's JSX elements in the file, in source order
  // (absent in scans from before they were recorded).
  sites?: number[];
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
  // Scanned files no route reaches (the App shell, unused code, route files).
  unmapped?: string[];
  // Route path to the files (import closure of its pages) rendered there.
  routeFiles?: Record<string, string[]>;
};

// Mirrors the entries of app/design-system/tokens/tokens.meta.json.
export type TokenMeta = {
  name: string;
  category: string;
  tier: 1 | 2;
  // What the code renders now, references followed.
  value: string;
  // The proposed back-office value, when it differs (Proposal page only).
  backOffice?: string;
  legacy: string[];
  // Optional extras for the Tokens panel; the scanner reads only the above.
  type?: string;
  description?: string;
  tenant?: 'primary' | 'secondary' | 'text';
  deprecated?: boolean;
  path?: string;
};
