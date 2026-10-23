import pixelmatch from 'pixelmatch';

import {
  PIXELMATCH_OPTIONS,
  buildSummary,
  isDiff,
  PLAY_ERROR_EVENT,
  SETTLED_PHASES,
  parseArgs,
  shotName,
  storyIdsFromIndex,
  matchStories,
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

  it('waits past play: only finished, errored and aborted are settled', () => {
    expect(SETTLED_PHASES).toEqual(['finished', 'errored', 'aborted']);
    expect(SETTLED_PHASES).not.toContain('playing');
    expect(SETTLED_PHASES).not.toContain('played');
  });

  // Storybook's core-events name for it (PLAY_FUNCTION_THREW_EXCEPTION).
  it("listens for the preview's play exception event", () => {
    expect(PLAY_ERROR_EVENT).toBe('playFunctionThrewException');
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
      0,
      new Date('2026-01-01T00:00:00Z')
    );
    expect(s.diffs).toEqual([{ id: 'a', viewport: 'mobile', px: 7 }]);
    expect(s.errors).toEqual([
      { id: 'b', viewport: 'desktop', message: 'empty root' },
    ]);
    expect(s.generatedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('filters story ids by comma separated globs', () => {
    const ids = [
      'components-actions-button--default',
      'components-actions-button--hover',
      'components-forms-input--default',
      'pages-workspace--empty',
    ];
    expect(matchStories(ids, undefined)).toEqual(ids);
    expect(matchStories(ids, 'components-actions-button--*')).toEqual([
      'components-actions-button--default',
      'components-actions-button--hover',
    ]);
    expect(matchStories(ids, '*--default, pages-*')).toEqual([
      'components-actions-button--default',
      'components-forms-input--default',
      'pages-workspace--empty',
    ]);
    // Exact ids match only themselves; regex characters are literal.
    expect(matchStories(ids, 'components-forms-input--default')).toEqual([
      'components-forms-input--default',
    ]);
    expect(matchStories(['a.b--x', 'aXb--x'], 'a.b--*')).toEqual(['a.b--x']);
  });

  it('reads --stories and --mode', () => {
    expect(parseArgs(['--compare', 'b'])).toMatchObject({
      mode: 'today',
      stories: undefined,
    });
    expect(
      parseArgs(['--baseline', 'b', '--stories', 'x--*', '--mode', 'redesign'])
    ).toMatchObject({ stories: 'x--*', mode: 'redesign' });
    expect(() => parseArgs(['--compare', 'b', '--mode', 'dark'])).toThrow();
    expect(() => parseArgs(['--compare', 'b', '--stories'])).toThrow();
  });

  it('keeps redesign shots apart from today shots', () => {
    expect(shotName('desktop', 'a--x', 'today')).toBe('desktop__a--x.png');
    expect(shotName('mobile', 'a--x', 'redesign')).toBe(
      'mobile__a--x__redesign.png'
    );
  });

  it('rejects unknown flags', () => {
    expect(() => parseArgs(['--compare', 'b', '--allowpx', '5'])).toThrow();
  });

  // Synthetic anti-aliased rounded squares.
  it('counts a small corner radius change', () => {
    const N = 40;
    const render = (r: number) => {
      const d = new Uint8Array(N * N * 4);
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          let cov = 0;
          for (let sy = 0; sy < 4; sy++)
            for (let sx = 0; sx < 4; sx++) {
              const px = x + (sx + 0.5) / 4;
              const py = y + (sy + 0.5) / 4;
              const cx = Math.min(Math.max(px, 4 + r), N - 4 - r);
              const cy = Math.min(Math.max(py, 4 + r), N - 4 - r);
              const inside =
                px >= 4 &&
                px <= N - 4 &&
                py >= 4 &&
                py <= N - 4 &&
                Math.hypot(px - cx, py - cy) <= r;
              if (inside) cov++;
            }
          const v = 255 - Math.round((cov / 16) * 255);
          const i = (y * N + x) * 4;
          d[i] = d[i + 1] = d[i + 2] = v;
          d[i + 3] = 255;
        }
      return d;
    };
    expect(
      pixelmatch(render(3), render(5), undefined, N, N, PIXELMATCH_OPTIONS)
    ).toBeGreaterThan(0);
    expect(
      pixelmatch(render(3), render(3), undefined, N, N, PIXELMATCH_OPTIONS)
    ).toBe(0);
  });
});
