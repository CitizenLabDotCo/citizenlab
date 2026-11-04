import {
  A11yResults,
  countByImpact,
  criticalFailures,
  erroredStories,
  knownFrom,
  mergeResults,
  parseA11yArgs,
  splitKnown,
  StoryResult,
  summariseViolations,
} from './a11y-results';

const story = (
  title: string,
  over: Partial<StoryResult> = {}
): StoryResult => ({
  title,
  checkedAt: '2026-10-23T00:00:00.000Z',
  violations: [],
  passes: 10,
  incomplete: 0,
  focusable: 1,
  ...over,
});

const results = (stories: Record<string, StoryResult>): A11yResults => ({
  generatedAt: '2026-10-23T00:00:00.000Z',
  axe: '4.10.2',
  tags: [],
  stories,
});

describe('summariseViolations', () => {
  it('counts nodes, drops the help URL query and sorts by impact', () => {
    expect(
      summariseViolations([
        { id: 'region', impact: 'moderate', nodes: [1], help: 'R' },
        {
          id: 'label',
          impact: 'critical',
          nodes: [1, 2],
          help: 'L',
          helpUrl:
            'https://dequeuniversity.com/rules/axe/4.10/label?application=axeAPI',
        },
        { id: 'odd', impact: 'unknown', nodes: [], help: 'O' },
      ])
    ).toEqual([
      {
        id: 'label',
        impact: 'critical',
        nodes: 2,
        help: 'L',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/label',
      },
      { id: 'region', impact: 'moderate', nodes: 1, help: 'R' },
      { id: 'odd', impact: null, nodes: 0, help: 'O' },
    ]);
  });
});

describe('mergeResults', () => {
  const old = results({ a: story('A'), b: story('B') });
  const next = results({ b: story('B', { passes: 3 }) });

  it('keeps the other stories after a partial run', () => {
    const merged = mergeResults(old, next, false);
    expect(Object.keys(merged.stories)).toEqual(['a', 'b']);
    expect(merged.stories.b.passes).toBe(3);
  });

  it('drops stories that are gone after a full run', () => {
    expect(Object.keys(mergeResults(old, next, true).stories)).toEqual(['b']);
  });
});

describe('criticalFailures', () => {
  const critical = {
    id: 'label',
    impact: 'critical' as const,
    nodes: 1,
    help: 'L',
  };

  it('fails only critical violations under Components/', () => {
    const r = results({
      'components-input--default': story('Components/Forms/Input', {
        violations: [critical, { ...critical, id: 'x', impact: 'serious' }],
      }),
      'pages-x--default': story('Pages/X', { violations: [critical] }),
    });
    expect(criticalFailures(r)).toEqual([
      { id: 'components-input--default', rule: 'label', nodes: 1, help: 'L' },
    ]);
  });

  it('counts stories per impact', () => {
    const r = results({
      a: story('A', { violations: [critical] }),
      b: story('B'),
      c: story('C', { error: 'boom' }),
    });
    expect(countByImpact(r)).toMatchObject({
      stories: 3,
      clean: 1,
      critical: 1,
      errors: 1,
    });
  });
});

describe('splitKnown', () => {
  const f = (id: string, rule: string) => ({ id, rule, nodes: 1, help: '' });

  it('splits new criticals from known ones and lists fixed ones', () => {
    const known = knownFrom([f('b--x', 'label'), f('a--x', 'button-name')]);
    expect(known).toEqual([
      { id: 'a--x', rule: 'button-name' },
      { id: 'b--x', rule: 'label' },
    ]);
    const split = splitKnown(
      [f('a--x', 'button-name'), f('a--x', 'label'), f('c--x', 'label')],
      known
    );
    expect(split.known.map((k) => k.rule)).toEqual(['button-name']);
    expect(split.fresh.map((k) => `${k.id} ${k.rule}`)).toEqual([
      'a--x label',
      'c--x label',
    ]);
    expect(split.fixed).toEqual([{ id: 'b--x', rule: 'label' }]);
    expect(split.unchecked).toEqual([]);
  });

  it('keeps a known critical whose story errored out of fixed', () => {
    const r = results({
      'a--x': story('Components/A', { error: 'Timeout 15000ms exceeded' }),
      'b--x': story('Components/B'),
    });
    const errored = erroredStories(r);
    expect(errored).toEqual({ 'a--x': 'Timeout 15000ms exceeded' });
    const split = splitKnown(
      criticalFailures(r),
      [
        { id: 'a--x', rule: 'button-name' },
        { id: 'b--x', rule: 'label' },
      ],
      errored
    );
    expect(split.fixed).toEqual([{ id: 'b--x', rule: 'label' }]);
    expect(split.unchecked).toEqual([
      { id: 'a--x', rule: 'button-name', error: 'Timeout 15000ms exceeded' },
    ]);
  });
});

describe('parseA11yArgs', () => {
  it('reads the options', () => {
    expect(
      parseA11yArgs(['--url', 'http://x/', '--stories', 'a*', '--workers', '2'])
    ).toMatchObject({
      url: 'http://x',
      stories: 'a*',
      workers: 2,
      check: false,
    });
    expect(parseA11yArgs(['--check']).check).toBe(true);
    expect(() => parseA11yArgs(['--nope'])).toThrow('Unknown argument');
  });
});
