import {
  A11yResults,
  countByImpact,
  criticalFailures,
  mergeResults,
  parseA11yArgs,
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
