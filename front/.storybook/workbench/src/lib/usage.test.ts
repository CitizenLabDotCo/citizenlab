import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';

import type { Finding, ScanOutput, TokenMeta } from './data';
import {
  buildPairs,
  buildUsage,
  colourRole,
  componentLabel,
  legacyIndex,
  tokensOfFinding,
} from './usage';

const meta = tokensMeta as TokenMeta[];
const byName = (n: string) => meta.find((t) => t.name === n) as TokenMeta;

const f = (partial: Partial<Finding>): Finding => ({
  file: 'app/x/A.tsx',
  line: 1,
  col: 1,
  raw: '',
  category: 'px',
  confidence: 'high',
  ...partial,
});

const scanOf = (
  findings: Finding[],
  routeFiles: Record<string, string[]> = {}
): ScanOutput => ({
  generatedAt: '',
  commit: '',
  findings,
  usages: [],
  routes: [],
  components: [],
  pages: [],
  totals: {
    offSpec: 0,
    legacy: 0,
    tokenReads: 0,
    components: 0,
    onTokens: 0,
    partly: 0,
    offTokens: 0,
    pagesRebuilt: 0,
    pagesPartly: 0,
    pagesLegacy: 0,
  },
  routeFiles,
});

describe('tokensOfFinding', () => {
  const legacy = legacyIndex(meta);
  const known = new Set(meta.map((t) => t.name));

  it('reads --gv- names of a token-var finding', () => {
    expect(
      tokensOfFinding(
        f({ category: 'token-var', raw: 'var(--gv-radius-control, 3px)' }),
        legacy,
        known
      )
    ).toEqual(['--gv-radius-control']);
  });

  it('maps legacy names, including props. and wrapped reads', () => {
    expect(
      tokensOfFinding(
        f({ category: 'legacy-colors', raw: 'colors.textSecondary' }),
        legacy,
        known
      )
    ).toEqual(['--gv-text-secondary']);
    expect(
      tokensOfFinding(
        f({
          category: 'legacy-theme',
          raw: 'props.theme.colors.tenantPrimary',
        }),
        legacy,
        known
      )
    ).toEqual(['--gv-color-tenant-primary']);
    expect(
      tokensOfFinding(
        f({ category: 'legacy-colors', raw: 'colors.nothing' }),
        legacy,
        known
      )
    ).toEqual([]);
  });

  it('uses close literal suggestions only when asked', () => {
    const hex = f({
      category: 'hex',
      raw: '#fff',
      suggestion: { token: '--gv-white', distance: 0 },
    });
    const far = f({
      category: 'hex',
      raw: '#f0f',
      suggestion: { token: '--gv-white', distance: 40 },
    });
    expect(tokensOfFinding(hex, legacy, known)).toEqual([]);
    expect(tokensOfFinding(hex, legacy, known, true)).toEqual(['--gv-white']);
    expect(tokensOfFinding(far, legacy, known, true)).toEqual([]);
  });
});

describe('buildUsage', () => {
  it('counts reads and legacy matches with their reach', () => {
    const scan = scanOf(
      [
        f({
          category: 'legacy-colors',
          raw: 'colors.textSecondary',
          component: 'A',
        }),
        f({
          category: 'legacy-colors',
          raw: 'colors.textSecondary',
          component: 'B',
        }),
        f({
          file: 'app/y/B.tsx',
          category: 'legacy-colors',
          raw: 'colors.textSecondary',
        }),
        // Literals do not count as usage.
        f({
          category: 'hex',
          raw: '#fff',
          suggestion: { token: '--gv-white', distance: 0 },
        }),
      ],
      { admin: ['app/x/A.tsx'], '': ['app/x/A.tsx', 'app/y/B.tsx'] }
    );
    const usage = buildUsage(scan, meta);
    expect(usage.get('--gv-text-secondary')).toEqual({
      count: 3,
      components: 3,
      routes: 2,
    });
    expect(usage.has('--gv-white')).toBe(false);
  });
});

describe('colourRole', () => {
  it('splits by name, legacy name and lightness', () => {
    expect(colourRole(byName('--gv-text-secondary'))).toBe('text');
    expect(colourRole(byName('--gv-on-primary'))).toBe('text');
    expect(colourRole(byName('--gv-background'))).toBe('background');
    expect(colourRole(byName('--gv-bo-sidebar-bg'))).toBe('background');
    expect(colourRole(byName('--gv-error-light'))).toBe('background');
    expect(colourRole(byName('--gv-white'))).toBe('background');
    expect(colourRole(byName('--gv-grey-800'))).toBe('text');
    expect(colourRole(byName('--gv-border-dark'))).toBeNull();
    expect(colourRole(byName('--gv-chart-navy'))).toBeNull();
    expect(colourRole(byName('--gv-radius-2'))).toBeNull();
  });
});

describe('buildPairs', () => {
  it('crosses text and background tokens per component and dedupes', () => {
    const scan = scanOf([
      // Component A reads two texts and one background.
      f({
        component: 'A',
        category: 'legacy-colors',
        raw: 'colors.textSecondary',
      }),
      f({
        component: 'A',
        category: 'legacy-colors',
        raw: 'colors.textPrimary',
      }),
      f({
        component: 'A',
        category: 'hex',
        raw: '#fff',
        suggestion: { token: '--gv-white', distance: 0 },
      }),
      f({
        component: 'A',
        category: 'legacy-colors',
        raw: 'colors.borderDark',
      }),
      // Component B repeats one pair.
      f({
        component: 'B',
        category: 'legacy-colors',
        raw: 'colors.textSecondary',
      }),
      f({ component: 'B', category: 'legacy-colors', raw: 'colors.white' }),
      f({ component: 'B', category: 'legacy-colors', raw: 'colors.white' }),
      // Component C has a text colour only: no pair.
      f({
        component: 'C',
        category: 'legacy-colors',
        raw: 'colors.textSecondary',
      }),
    ]);
    const pairs = buildPairs(scan, meta);
    expect(pairs[0]).toEqual({
      text: '--gv-text-secondary',
      background: '--gv-white',
      components: ['app/x/A.tsx#A', 'app/x/A.tsx#B'],
    });
    // colors.textPrimary is listed by two text tokens.
    expect(pairs.map((p) => `${p.text} on ${p.background}`).sort()).toEqual([
      '--gv-color-text-heading on --gv-white',
      '--gv-text-primary on --gv-white',
      '--gv-text-secondary on --gv-white',
    ]);
  });

  it('is empty for an empty scan', () => {
    expect(buildPairs(scanOf([]), meta)).toEqual([]);
  });
});

describe('componentLabel', () => {
  it('names the component and its file', () => {
    expect(
      componentLabel('app/component-library/components/Button/index.tsx#Wrap')
    ).toBe('Wrap (Button/index.tsx)');
    expect(componentLabel('app/x/A.tsx')).toBe('x/A.tsx');
  });
});
