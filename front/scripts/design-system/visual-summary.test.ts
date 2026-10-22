import {
  buildSummary,
  isDiff,
  parseArgs,
  storyIdsFromIndex,
} from './visual-summary';

describe('visual summary', () => {
  it('lists only story ids, sorted', () => {
    expect(
      storyIdsFromIndex({
        entries: {
          b: { id: 'b--x', type: 'story' },
          d: { id: 'a--docs', type: 'docs' },
          a: { id: 'a--x', type: 'story' },
        },
      })
    ).toEqual(['a--x', 'b--x']);
  });

  it('requires exactly one mode', () => {
    expect(() => parseArgs([])).toThrow();
    expect(() => parseArgs(['--baseline', 'a', '--compare', 'b'])).toThrow();
    expect(parseArgs(['--compare', 'b', '--allow-px', '3'])).toMatchObject({
      compare: 'b',
      allowPx: 3,
    });
  });

  it('applies the allowed pixel budget', () => {
    expect(isDiff(0, 0)).toBe(false);
    expect(isDiff(1, 0)).toBe(true);
    expect(isDiff(5, 5)).toBe(false);
  });

  it('separates diffs from errors', () => {
    const s = buildSummary(
      2,
      [
        { id: 'a', viewport: 'desktop', px: 0 },
        { id: 'a', viewport: 'mobile', px: 7 },
        { id: 'b', viewport: 'desktop', error: 'empty root' },
      ],
      0,
      new Date('2026-01-01T00:00:00Z')
    );
    expect(s.diffs).toEqual([{ id: 'a', viewport: 'mobile', px: 7 }]);
    expect(s.errors).toEqual([
      { id: 'b', viewport: 'desktop', message: 'empty root' },
    ]);
    expect(s.generatedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
