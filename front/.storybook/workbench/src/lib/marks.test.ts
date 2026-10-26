import { badgeLevel, levelOf, marksByFile } from './marks';

import type { Finding } from './data';

const f = (over: Partial<Finding>): Finding => ({
  file: 'app/a.tsx',
  line: 1,
  col: 1,
  raw: '13px',
  category: 'px',
  confidence: 'high',
  ...over,
});

describe('levelOf', () => {
  it('marks local markup strong', () => {
    expect(levelOf(f({ category: 'styled-block' }))).toBe('strong');
  });

  it('marks a value no token equals strong, an equal one faint', () => {
    expect(
      levelOf(f({ suggestion: { token: '--gv-space-3', distance: 1 } }))
    ).toBe('strong');
    expect(levelOf(f({}))).toBe('strong');
    expect(
      levelOf(
        f({ raw: '16px', suggestion: { token: '--gv-space-4', distance: 0 } })
      )
    ).toBe('faint');
  });

  it('marks legacy reads faint and ignores token reads', () => {
    expect(levelOf(f({ category: 'legacy-colors' }))).toBe('faint');
    expect(levelOf(f({ category: 'token-var' }))).toBeNull();
  });
});

describe('marksByFile', () => {
  it('counts per file, strong first', () => {
    const m = marksByFile([
      f({ line: 2, category: 'legacy-theme' }),
      f({ line: 9 }),
      f({ file: 'app/b.tsx', category: 'token-var' }),
    ]);
    const a = m.get('app/a.tsx')!;
    expect([a.strong, a.faint]).toEqual([1, 1]);
    expect(a.findings.map((x) => x.line)).toEqual([9, 2]);
    expect(m.has('app/b.tsx')).toBe(false);
  });
});

describe('badgeLevel', () => {
  it('is strong, faint for cleanup or no story, else none', () => {
    const strong = { findings: [], strong: 1, faint: 0 };
    const faint = { findings: [], strong: 0, faint: 2 };
    expect(badgeLevel(strong, true)).toBe('strong');
    expect(badgeLevel(faint, true)).toBe('faint');
    expect(badgeLevel(undefined, false)).toBe('faint');
    expect(badgeLevel(undefined, true)).toBeNull();
  });
});
