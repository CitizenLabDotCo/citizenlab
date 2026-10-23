import {
  chartOf,
  costOf,
  formatNumber,
  healExample,
  migrationOrder,
  seriesOf,
  Trend,
} from './proposal';

import type { ComponentScore } from './data';

const counts = (px: number, hex = 0, legacy = 0) =>
  ({
    px,
    hex,
    rgba: 0,
    'named-color': 0,
    'layout-spacing': 0,
    'styled-block': 9,
    'legacy-theme': legacy,
    'legacy-colors': 0,
    'legacy-bo': 0,
    'token-var': 0,
    'duplicate-candidate': 0,
  } as ComponentScore['counts']);

const component = (
  name: string,
  usageCount: number,
  c: ComponentScore['counts']
): ComponentScore => ({
  component: name,
  file: `app/${name}.tsx`,
  score: 0,
  counts: c,
  usageCount,
  routes: [],
  status: 'off-tokens',
});

const totals = (offSpec: number, tokenReads: number) => ({
  offSpec,
  legacy: 5,
  tokenReads,
  components: 2,
  onTokens: 1,
});

const TREND: Trend = {
  file: 'x',
  points: [
    {
      sha: 'a1',
      date: '2026-10-22T10:00:00Z',
      subject: 'design-system(scan): first',
      area: 'scan',
      totals: totals(100, 0),
    },
    {
      sha: 'b2',
      date: '2026-10-22T11:00:00Z',
      subject: 'design-system(heal): A 8px',
      area: 'heal',
      totals: totals(99, 1),
      heal: { file: 'f', removed: ['a'], added: ['b'], shots: 'heals/b2' },
    },
    {
      sha: 'c3',
      date: '2026-10-22T12:00:00Z',
      subject: 'design-system(heal): B 4px',
      area: 'heal',
      totals: totals(98, 2),
      heal: { file: 'f', removed: ['a'], added: ['b'] },
    },
  ],
};

describe('migrationOrder', () => {
  it('ranks by usage times off-spec values, without styled blocks or legacy', () => {
    const rows = migrationOrder([
      component('Small', 100, counts(1)),
      component('Big', 10, counts(20, 5, 50)),
      component('Clean', 500, counts(0, 0, 40)),
      component('Tie', 50, counts(2)),
    ]);
    expect(rows.map((r) => [r.component, r.weight])).toEqual([
      ['Big', 250],
      ['Small', 100],
      ['Tie', 100],
    ]);
    expect(rows[0]).toMatchObject({ usage: 10, offSpec: 25 });
  });

  it('keeps the top n', () => {
    const many = Array.from({ length: 30 }, (_, i) =>
      component(`C${i}`, i + 1, counts(1))
    );
    expect(migrationOrder(many)).toHaveLength(20);
    expect(migrationOrder(many, 3).map((r) => r.component)).toEqual([
      'C29',
      'C28',
      'C27',
    ]);
  });
});

describe('seriesOf', () => {
  it('reads one measure per commit', () => {
    expect(seriesOf(TREND, null, 'offSpec').map((p) => p.value)).toEqual([
      100, 99, 98,
    ]);
  });

  it('adds the build as a last point only when it moved', () => {
    expect(seriesOf(TREND, totals(98, 2), 'tokenReads')).toHaveLength(3);
    const moved = seriesOf(TREND, totals(97, 3), 'tokenReads');
    expect(moved).toHaveLength(4);
    expect(moved[3]).toMatchObject({ sha: null, area: 'now', value: 3 });
  });

  it('works without a trend', () => {
    expect(seriesOf(null, totals(5, 1), 'offSpec')).toEqual([
      expect.objectContaining({ value: 5, area: 'now' }),
    ]);
    expect(seriesOf(null, null, 'offSpec')).toEqual([]);
  });
});

describe('chartOf', () => {
  const box = {
    width: 100,
    height: 60,
    left: 10,
    right: 10,
    top: 5,
    bottom: 5,
  };

  it('spaces points evenly and rounds the range out to ticks', () => {
    const c = chartOf([6507, 8250, 8232], box);
    expect(c.x).toEqual([10, 50, 90]);
    expect(c.min).toBeLessThanOrEqual(6507);
    expect(c.max).toBeGreaterThanOrEqual(8250);
    expect(c.ticks[0]).toBe(c.min);
    expect(c.ticks[c.ticks.length - 1]).toBe(c.max);
    // Higher values sit higher (smaller y).
    expect(c.y[1]).toBeLessThan(c.y[0]);
    expect(c.path.startsWith('M10.0 ')).toBe(true);
  });

  it('gives a flat or single series a range, never below zero', () => {
    const flat = chartOf([0, 0], box);
    expect(flat.min).toBe(0);
    expect(flat.max).toBeGreaterThan(0);
    const one = chartOf([42], box);
    expect(one.x).toEqual([50]);
    expect(one.min).toBeLessThan(42);
    expect(one.max).toBeGreaterThan(42);
  });
});

describe('healExample and costOf', () => {
  it('picks the latest heal that has screenshots', () => {
    expect(healExample(TREND)?.sha).toBe('b2');
    expect(healExample(null)).toBeUndefined();
  });

  it('counts the commits by kind', () => {
    const commits = ['heal', 'heal', 'story', 'lift', 'other', 'token'].map(
      (kind, i) => ({ sha: `${i}`, subject: '', body: '', files: [], kind })
    ) as any;
    expect(costOf({ commits })).toEqual({
      commits: 6,
      heals: 2,
      lifts: 1,
      stories: 1,
      tokens: 1,
    });
    expect(costOf(null).commits).toBe(0);
  });

  it('formats numbers the same everywhere', () => {
    expect(formatNumber(8232)).toBe('8,232');
  });
});
