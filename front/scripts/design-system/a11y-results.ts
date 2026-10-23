// Pure logic for the accessibility run (ds:a11y): the results file, the axe
// options, merging a partial run into the last one, and the check ds:check
// runs. No browser here.

export type Impact = 'minor' | 'moderate' | 'serious' | 'critical';

export const IMPACTS: Impact[] = ['critical', 'serious', 'moderate', 'minor'];

export type Violation = {
  id: string;
  impact: Impact | null;
  nodes: number;
  help: string;
  helpUrl?: string;
};

export type StoryResult = {
  title: string;
  // When axe last ran on this story (a partial run keeps the others' dates).
  checkedAt: string;
  violations: Violation[];
  // Rules axe ran and found nothing against.
  passes: number;
  // Rules axe could not settle (colour contrast over an image, say).
  incomplete: number;
  // Elements in the story a keyboard user can tab to.
  focusable: number;
  // Only for stories with a play function.
  play?: 'passed' | 'failed';
  // The story could not be checked.
  error?: string;
};

export type A11yResults = {
  generatedAt: string;
  // axe-core version the results come from.
  axe: string;
  tags: string[];
  stories: Record<string, StoryResult>;
};

// WCAG 2.0, 2.1 and 2.2 at levels A and AA.
export const AXE_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
];

// Rules about the page around the story (Storybook's iframe.html), not the
// component: its language, title, skip links and viewport meta.
export const PAGE_RULES = [
  'html-has-lang',
  'html-lang-valid',
  'html-xml-lang-mismatch',
  'valid-lang',
  'document-title',
  'bypass',
  'meta-viewport',
  'meta-refresh',
];

// Storybook's own markup inside iframe.html.
export const STORYBOOK_CHROME = [
  '.sb-errordisplay',
  '.sb-preparing-story',
  '.sb-preparing-docs',
  '.sb-nopreview',
  '#storybook-docs',
];

// What a keyboard user can tab to (visibility is checked in the browser).
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type AxeNodeResult = {
  id: string;
  impact?: string | null;
  nodes: unknown[];
  help: string;
  helpUrl?: string;
};

export const summariseViolations = (violations: AxeNodeResult[]): Violation[] =>
  violations
    .map((v) => ({
      id: v.id,
      impact: (IMPACTS as string[]).includes(v.impact ?? '')
        ? (v.impact as Impact)
        : null,
      nodes: v.nodes.length,
      help: v.help,
      ...(v.helpUrl ? { helpUrl: v.helpUrl.replace(/\?.*$/, '') } : {}),
    }))
    .sort(
      (a, b) => rank(a.impact) - rank(b.impact) || a.id.localeCompare(b.id)
    );

const rank = (impact: Impact | null) =>
  impact === null ? IMPACTS.length : IMPACTS.indexOf(impact);

// A run over some stories keeps the other stories' results; a full run
// drops stories that no longer exist.
export const mergeResults = (
  previous: A11yResults | null,
  next: A11yResults,
  full: boolean
): A11yResults => ({
  ...next,
  stories: sortKeys({
    ...(full || !previous ? {} : previous.stories),
    ...next.stories,
  }),
});

const sortKeys = <T>(o: Record<string, T>): Record<string, T> =>
  Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

export type CheckFailure = {
  id: string;
  rule: string;
  nodes: number;
  help: string;
};

// Critical violations in library stories (titles under Components/).
export const criticalFailures = (results: A11yResults): CheckFailure[] =>
  Object.entries(results.stories)
    .filter(([, s]) => s.title.startsWith('Components/'))
    .flatMap(([id, s]) =>
      s.violations
        .filter((v) => v.impact === 'critical')
        .map((v) => ({ id, rule: v.id, nodes: v.nodes, help: v.help }))
    );

export type Counts = Record<Impact, number> & {
  stories: number;
  clean: number;
  errors: number;
};

// Stories with at least one violation of each impact, for the run's log.
export const countByImpact = (results: A11yResults): Counts => {
  const counts: Counts = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    stories: 0,
    clean: 0,
    errors: 0,
  };
  for (const s of Object.values(results.stories)) {
    counts.stories++;
    if (s.error) {
      counts.errors++;
      continue;
    }
    if (s.violations.length === 0) counts.clean++;
    for (const impact of IMPACTS) {
      if (s.violations.some((v) => v.impact === impact)) counts[impact]++;
    }
  }
  return counts;
};

export const parseA11yArgs = (argv: string[]) => {
  const out = {
    url: 'http://localhost:6006',
    stories: undefined as string | undefined,
    out: undefined as string | undefined,
    check: false,
    workers: 4,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) throw new Error(`Missing value for ${a}`);
      return argv[++i];
    };
    if (a === '--url') out.url = next().replace(/\/$/, '');
    else if (a === '--stories') out.stories = next();
    else if (a === '--out') out.out = next();
    else if (a === '--workers') out.workers = Math.max(1, Number(next()) || 1);
    else if (a === '--check') out.check = true;
    else throw new Error(`Unknown argument ${a}`);
  }
  return out;
};
