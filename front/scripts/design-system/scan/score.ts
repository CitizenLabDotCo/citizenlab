import {
  ComponentScore,
  ComponentUsage,
  Finding,
  FindingCategory,
  PageStatus,
} from './schema';

/*
 * Follows-tokens score = tokenReads / (tokenReads + 0.5 * legacy + offSpec).
 * Legacy reads (theme.*, colors.*, bo.*) weigh half: moving to variables is
 * rewarded without punishing today's theme reads as hard as raw values.
 * Styled blocks and duplicate candidates are reported but not scored. With
 * nothing to read (denominator 0) the score is 1: nothing is off the tokens.
 * Status: >= 0.9 on-tokens, >= 0.4 partly, else off-tokens. A component
 * with no reads at all is on-tokens by score only: that is no evidence, so
 * it never enters the redesign-scope stand-in (redesignScopeStandIn).
 */

export const OFF_SPEC: FindingCategory[] = [
  'px',
  'hex',
  'rgba',
  'named-color',
  'layout-spacing',
];
export const LEGACY: FindingCategory[] = [
  'legacy-theme',
  'legacy-colors',
  'legacy-bo',
];
export const ALL_CATEGORIES: FindingCategory[] = [
  ...OFF_SPEC,
  'styled-block',
  ...LEGACY,
  'token-var',
  'duplicate-candidate',
];

export const LEGACY_WEIGHT = 0.5;

export const countFindings = (
  findings: Finding[]
): Record<FindingCategory, number> => {
  const counts = Object.fromEntries(
    ALL_CATEGORIES.map((c) => [c, 0])
  ) as Record<FindingCategory, number>;
  findings.forEach((f) => {
    counts[f.category] += 1;
  });
  return counts;
};

const sum = (
  counts: Record<FindingCategory, number>,
  cats: FindingCategory[]
) => cats.reduce((n, c) => n + counts[c], 0);

export const offSpecCount = (counts: Record<FindingCategory, number>) =>
  sum(counts, OFF_SPEC);
export const legacyCount = (counts: Record<FindingCategory, number>) =>
  sum(counts, LEGACY);

export const followsTokensScore = (
  counts: Record<FindingCategory, number>
): number => {
  const token = counts['token-var'];
  const denom =
    token + LEGACY_WEIGHT * legacyCount(counts) + offSpecCount(counts);
  if (denom === 0) return 1;
  return Math.round((token / denom) * 1000) / 1000;
};

export const statusFor = (score: number): ComponentScore['status'] =>
  score >= 0.9 ? 'on-tokens' : score >= 0.4 ? 'partly' : 'off-tokens';

/**
 * Score one component from the findings in its own files, its usages and the
 * route paths those usages render on. `id` names the component and its main
 * file; it defaults to the first usage's component and the first finding's file.
 */
export const scoreComponent = (
  findings: Finding[],
  usages: ComponentUsage[],
  routes: string[],
  id?: { component: string; file: string }
): ComponentScore => {
  const counts = countFindings(findings);
  const score = followsTokensScore(counts);
  return {
    component:
      id?.component ?? usages[0]?.component ?? findings[0]?.component ?? '',
    file: id?.file ?? findings[0]?.file ?? '',
    score,
    counts,
    usageCount: usages.length,
    routes: [...new Set(routes)].sort(),
    status: statusFor(score),
  };
};

/**
 * Coverage of one page from the findings and library usages in its files
 * (the CLI passes the page's non-library files: library files are scored per
 * component). libraryPieces = library usages; localPieces = local styled
 * components; offSpec = raw values.
 * - rebuilt: at least one library piece, every one in `redesignScope`, no
 *   local pieces and no off-spec values;
 * - legacy: no library pieces;
 * - partly: anything else.
 */
export const pageStatus = (
  route: { path: string; office: 'admin' | 'public' },
  findings: Finding[],
  usages: ComponentUsage[],
  redesignScope: Set<string>
): PageStatus => {
  const counts = countFindings(findings);
  const libraryPieces = usages.length;
  const localPieces = counts['styled-block'];
  const offSpec = offSpecCount(counts);
  let status: PageStatus['status'];
  if (libraryPieces === 0) status = 'legacy';
  else if (
    localPieces === 0 &&
    offSpec === 0 &&
    usages.every((u) => redesignScope.has(u.component))
  )
    status = 'rebuilt';
  else status = 'partly';
  return {
    path: route.path,
    office: route.office,
    status,
    libraryPieces,
    localPieces,
    offSpec,
  };
};

/**
 * Stand-in for the redesign scope until a scope list exists: components that
 * are on-tokens AND read at least one token. Components with no style reads
 * at all (score 1 by definition) are left out.
 */
export const redesignScopeStandIn = (components: ComponentScore[]) =>
  new Set(
    components
      .filter((c) => c.status === 'on-tokens' && c.counts['token-var'] >= 1)
      .map((c) => c.component)
  );
