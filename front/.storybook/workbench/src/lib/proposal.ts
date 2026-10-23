// The Proposal page's numbers: the migration order, the trend series and
// its chart geometry, the heal example and the cost line. Pure functions
// over the scan, the summary, trend.json and design-changes.json.
import { offSpecCount } from '../../../../scripts/design-system/scan/score';

import type { DesignChanges } from './review';
import type {
  ComponentScore,
  Totals,
} from '../../../../scripts/design-system/scan/schema';
import type {
  HealExample,
  Trend,
  TrendPoint,
  TrendTotals,
} from '../../../../scripts/design-system/trend';


export type { HealExample, Trend, TrendPoint, TrendTotals };

// ------------------------------------------------------------ migration

export type MigrationRow = {
  component: string;
  file: string;
  usage: number;
  offSpec: number;
  weight: number;
};

/** Components by usageCount x off-spec values, highest first. */
export const migrationOrder = (
  components: ComponentScore[],
  limit = 20
): MigrationRow[] =>
  components
    .map((c) => {
      const offSpec = offSpecCount(c.counts);
      return {
        component: c.component,
        file: c.file,
        usage: c.usageCount,
        offSpec,
        weight: c.usageCount * offSpec,
      };
    })
    .filter((r) => r.weight > 0)
    .sort(
      (a, b) => b.weight - a.weight || a.component.localeCompare(b.component)
    )
    .slice(0, limit);

// ---------------------------------------------------------------- trend

export type SeriesPoint = {
  sha: string | null;
  date: string;
  subject: string;
  area: string;
  value: number;
};

const sameTotals = (a: TrendTotals, b: Partial<Totals>) =>
  (Object.keys(a) as (keyof TrendTotals)[]).every((k) => a[k] === b[k]);

/**
 * One measure across the trend, plus the build's own summary as a last
 * point (`sha` null) when it differs from the last committed one.
 */
export const seriesOf = (
  trend: Trend | null,
  summary: Partial<Totals> | null,
  key: keyof TrendTotals
): SeriesPoint[] => {
  const points: SeriesPoint[] = (trend?.points ?? []).map((p) => ({
    sha: p.sha,
    date: p.date,
    subject: p.subject,
    area: p.area,
    value: p.totals[key],
  }));
  const last = trend?.points[trend.points.length - 1];
  const now = summary?.[key];
  if (
    typeof now === 'number' &&
    (!last || !sameTotals(last.totals, summary ?? {}))
  ) {
    points.push({
      sha: null,
      date: '',
      subject: 'This build',
      area: 'now',
      value: now,
    });
  }
  return points;
};

export type ChartBox = {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type Chart = {
  min: number;
  max: number;
  ticks: number[];
  x: number[];
  y: number[];
  path: string;
};

const NICE = [1, 2, 2.5, 5, 10];

const niceStep = (span: number, count: number) => {
  const raw = span / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  return (NICE.find((n) => n * mag >= raw) ?? 10) * mag;
};

/**
 * Point positions and y ticks for a line over the values, evenly spaced on
 * x (one step per commit). The y range is rounded out to whole ticks; a
 * flat series gets a range around its value.
 */
export const chartOf = (values: number[], box: ChartBox, ticks = 4): Chart => {
  const lo = values.length ? Math.min(...values) : 0;
  const hi = values.length ? Math.max(...values) : 1;
  const span = hi - lo || Math.max(1, Math.abs(hi) * 0.1);
  const step = niceStep(span, ticks);
  let min = Math.floor(lo / step) * step;
  let max = Math.ceil(hi / step) * step;
  if (min === max) {
    min -= step;
    max += step;
  }
  if (lo >= 0 && min < 0) min = 0;
  const tickList: number[] = [];
  for (let t = min; t <= max + step / 2; t += step) tickList.push(t);
  const innerW = box.width - box.left - box.right;
  const innerH = box.height - box.top - box.bottom;
  const n = values.length;
  const x = values.map((_, i) =>
    n === 1 ? box.left + innerW / 2 : box.left + (innerW * i) / (n - 1)
  );
  const y = values.map(
    (v) => box.top + innerH - ((v - min) / (max - min)) * innerH
  );
  const path = x
    .map((px, i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${y[i].toFixed(1)}`)
    .join(' ');
  return { min, max, ticks: tickList, x, y, path };
};

// ------------------------------------------------------------------ heal

/** The latest heal with screenshots and a code example. */
export const healExample = (
  trend: Trend | null
): (TrendPoint & { heal: HealExample }) | undefined =>
  [...(trend?.points ?? [])]
    .reverse()
    .find(
      (p): p is TrendPoint & { heal: HealExample } =>
        p.area === 'heal' && !!p.heal?.shots
    );

// ------------------------------------------------------------------ cost

export type Cost = {
  commits: number;
  heals: number;
  lifts: number;
  stories: number;
  tokens: number;
};

export const costOf = (changes: Partial<DesignChanges> | null): Cost => {
  const commits = Array.isArray(changes?.commits) ? changes!.commits : [];
  const count = (kind: string) => commits.filter((c) => c.kind === kind).length;
  return {
    commits: commits.length,
    heals: count('heal'),
    lifts: count('lift'),
    stories: count('story'),
    tokens: count('token'),
  };
};

/** `8232` as `8,232`, fixed to en so it reads the same everywhere. */
export const formatNumber = (n: number) => n.toLocaleString('en-US');
