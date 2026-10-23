// What the A11y panel and the gallery badges say about a component: the
// axe results of its stories (a11y-results.json), whether a Keyboard story
// passed, and the agent-filled checklist (components/<Name>/a11y.json).
// Pure functions; the wording follows SPEC 7.6 ("checked by axe",
// "keyboard tested", "reviewed by agent on <date>"), never a conformance
// claim.
import type { StoryGroup } from './stories';
import type {
  A11yResults,
  Impact,
  StoryResult,
  Violation,
} from '../../../../scripts/design-system/a11y-results';

export type { A11yResults, Impact, StoryResult, Violation };

export type CriterionResult = 'pass' | 'fail' | 'n/a' | 'needs-human';

export type Criterion = {
  id: string;
  name: string;
  result: CriterionResult;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
  note: string;
};

export type Checklist = {
  component: string;
  reviewedAt: string | null;
  reviewer: string;
  criteria: Criterion[];
};

export const IMPACT_ORDER: Impact[] = [
  'critical',
  'serious',
  'moderate',
  'minor',
];

export const IMPACT_LABEL: Record<Impact, string> = {
  critical: 'Critical',
  serious: 'Serious',
  moderate: 'Moderate',
  minor: 'Minor',
};

// Fails first, then what a person has to look at, then the rest.
export const RESULT_ORDER: CriterionResult[] = [
  'fail',
  'needs-human',
  'pass',
  'n/a',
];

export const RESULT_LABEL: Record<CriterionResult, string> = {
  fail: 'Fail',
  'needs-human': 'Needs a person',
  pass: 'Pass',
  'n/a': 'n/a',
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// `2026-10-23` (or a full ISO time) as `23 Oct 2026`, without the
// browser's locale or time zone.
export const formatDate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1] ?? m[2]} ${m[1]}`;
};

const criterionKey = (id: string) => id.split('.').map(Number);

const byId = (a: Criterion, b: Criterion) => {
  const x = criterionKey(a.id);
  const y = criterionKey(b.id);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d) return d;
  }
  return 0;
};

// Rows in result order (fails first), by criterion number within each.
export const sortCriteria = (criteria: Criterion[]) =>
  [...criteria].sort(
    (a, b) =>
      RESULT_ORDER.indexOf(a.result) - RESULT_ORDER.indexOf(b.result) ||
      byId(a, b)
  );

export type ChecklistCounts = Record<CriterionResult, number>;

export const checklistCounts = (c: Checklist): ChecklistCounts => {
  const counts: ChecklistCounts = {
    pass: 0,
    fail: 0,
    'needs-human': 0,
    'n/a': 0,
  };
  c.criteria.forEach((r) => counts[r.result]++);
  return counts;
};

const needsPerson = (n: number) =>
  `${n} ${n === 1 ? 'needs' : 'need'} a person`;

// "Reviewed by agent on 23 Oct 2026, 8 pass, 1 fail, 0 need a person";
// null when the checklist is still a stub.
export const reviewedLine = (c: Checklist): string | null => {
  if (!c.reviewedAt || c.criteria.length === 0) return null;
  const n = checklistCounts(c);
  return `Reviewed by ${c.reviewer} on ${formatDate(c.reviewedAt)}, ${
    n.pass
  } pass, ${n.fail} fail, ${needsPerson(n['needs-human'])}`;
};

// The checklist next to the group's component file.
export const checklistOf = (
  checklists: Record<string, Checklist>,
  group: Pick<StoryGroup, 'file'>
): Checklist | null => {
  if (!group.file) return null;
  const dir = group.file.replace(/\/[^/]+$/, '');
  return checklists[dir] ?? null;
};

// Glob keys (`../../../../app/component-library/components/X/a11y.json`)
// to repo-relative component directories.
export const checklistsByDir = (
  modules: Record<string, unknown>
): Record<string, Checklist> =>
  Object.fromEntries(
    Object.entries(modules).flatMap(([key, mod]) => {
      const m = /(app\/component-library\/.+)\/a11y\.json$/.exec(key);
      const value = (mod as { default?: unknown }).default ?? mod;
      return m && isChecklist(value) ? [[m[1], value]] : [];
    })
  );

const isChecklist = (v: unknown): v is Checklist =>
  !!v &&
  typeof v === 'object' &&
  Array.isArray((v as Checklist).criteria) &&
  typeof (v as Checklist).component === 'string';

export const worstImpact = (violations: Violation[]): Impact | null =>
  IMPACT_ORDER.find((i) => violations.some((v) => v.impact === i)) ?? null;

export type AxeSummary = {
  // Stories of the group with results.
  checked: number;
  stories: number;
  // Stories with at least one violation of each impact.
  byImpact: Record<Impact, number>;
  // Rules that fail somewhere in the group, worst first, with the stories
  // they fail in.
  rules: { id: string; impact: Impact | null; help: string; stories: number }[];
  worst: Impact | null;
  errors: number;
  // Latest checkedAt of the group's stories.
  checkedAt: string | null;
};

export const axeSummary = (
  results: A11yResults | null,
  group: Pick<StoryGroup, 'stories'>
): AxeSummary => {
  const byImpact: Record<Impact, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };
  const rules = new Map<string, AxeSummary['rules'][number]>();
  let checked = 0;
  let errors = 0;
  let checkedAt: string | null = null;
  for (const s of group.stories) {
    const r = results?.stories[s.id];
    if (!r) continue;
    if (r.error) {
      errors++;
      continue;
    }
    checked++;
    if (!checkedAt || r.checkedAt > checkedAt) checkedAt = r.checkedAt;
    IMPACT_ORDER.forEach((i) => {
      if (r.violations.some((v) => v.impact === i)) byImpact[i]++;
    });
    r.violations.forEach((v) => {
      const rule = rules.get(v.id) ?? {
        id: v.id,
        impact: v.impact,
        help: v.help,
        stories: 0,
      };
      rule.stories++;
      rules.set(v.id, rule);
    });
  }
  const rank = (i: Impact | null) =>
    i === null ? IMPACT_ORDER.length : IMPACT_ORDER.indexOf(i);
  return {
    checked,
    stories: group.stories.length,
    byImpact,
    rules: [...rules.values()].sort(
      (a, b) =>
        rank(a.impact) - rank(b.impact) ||
        b.stories - a.stories ||
        a.id.localeCompare(b.id)
    ),
    worst: IMPACT_ORDER.find((i) => byImpact[i] > 0) ?? null,
    errors,
    checkedAt,
  };
};

// tested: a story named Keyboard ran its play function and it passed.
// failing: it ran and threw. untested: the component has something to
// tab to and no passing Keyboard story. none: nothing to tab to, so no
// badge. unknown: no axe results for the group.
export type KeyboardStatus =
  | 'tested'
  | 'failing'
  | 'untested'
  | 'none'
  | 'unknown';

export const KEYBOARD_STORY = 'Keyboard';

export const keyboardStatus = (
  results: A11yResults | null,
  group: Pick<StoryGroup, 'stories'>
): KeyboardStatus => {
  const runs = group.stories
    .map((s) => ({ s, r: results?.stories[s.id] }))
    .filter((x): x is { s: (typeof x)['s']; r: StoryResult } => !!x.r);
  if (runs.length === 0) return 'unknown';
  const kb = runs.find((x) => x.s.exportName === KEYBOARD_STORY);
  if (kb?.r.play === 'passed') return 'tested';
  if (kb?.r.play === 'failed') return 'failing';
  return runs.some((x) => x.r.focusable > 0) ? 'untested' : 'none';
};

export const KEYBOARD_LABEL: Record<KeyboardStatus, string> = {
  tested: 'Keyboard tested',
  failing: 'Keyboard test fails',
  untested: 'Keyboard: untested',
  none: 'Nothing to tab to',
  unknown: 'Keyboard: not run',
};

// Short line for the axe badge's title.
export const axeTitle = (a: AxeSummary) => {
  if (a.checked === 0) return 'Not checked by axe yet';
  const parts = IMPACT_ORDER.filter((i) => a.byImpact[i] > 0).map(
    (i) => `${a.byImpact[i]} with ${i}`
  );
  const of = `${a.checked} of ${a.stories} stories`;
  return parts.length
    ? `Checked by axe: ${of}, ${parts.join(', ')} violations`
    : `Checked by axe: ${of}, no violations`;
};
