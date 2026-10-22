import fs from 'fs';
import path from 'path';

import { NAMED_COLOR_NAMES } from './namedColors';
import { nearestToken, scanFile, scanFileResult } from './findings';
import { Finding, FindingCategory, TokenMeta } from './schema';

const FIXTURES = path.join(__dirname, '..', 'fixtures', 'findings');

const tok = (name: string, category: string, today: string): TokenMeta => ({
  name,
  category,
  tier: 1,
  values: { today, redesign: today },
  legacy: [],
});

const TOKENS: TokenMeta[] = [
  ...Array.from({ length: 24 }, (_, i) =>
    tok(`--gv-space-${i + 1}`, 'space', `${(i + 1) * 4}px`)
  ),
  tok('--gv-radius-1', 'radius', '4px'),
  tok('--gv-radius-2', 'radius', '8px'),
  tok('--gv-radius-3', 'radius', '12px'),
  tok('--gv-black', 'color', '#000000'),
  tok('--gv-white', 'color', '#ffffff'),
  tok('--gv-grey-800', 'color', '#333333'),
  tok('--gv-grey-700', 'color', '#767676'),
  tok('--gv-grey-300', 'color', '#E0E0E0'),
  tok('--gv-red-500', 'color', '#FF0000'),
];

const run = (name: string): Finding[] =>
  scanFile(name, fs.readFileSync(path.join(FIXTURES, name), 'utf8'), TOKENS);

const counts = (fs_: Finding[]) => {
  const out: Partial<Record<FindingCategory, number>> = {};
  fs_.forEach((f) => {
    out[f.category] = (out[f.category] ?? 0) + 1;
  });
  return out;
};

describe('scanFile', () => {
  it('finds literals and legacy reads in styled templates', () => {
    const f = run('styled-literals.tsx');
    expect(counts(f)).toEqual({
      'styled-block': 1,
      px: 2,
      hex: 1,
      rgba: 1,
      'named-color': 1,
      'legacy-theme': 1,
      'legacy-colors': 1,
    });
    const hex = f.find((x) => x.category === 'hex')!;
    expect(hex.raw.toLowerCase()).toBe('#1e1e1e');
    expect(hex.suggestion?.token).toBe('--gv-grey-800');
    expect(hex.suggestion!.distance).toBeGreaterThan(0);
    const theme = f.find((x) => x.category === 'legacy-theme')!;
    expect(theme.raw).toBe('theme.borderRadius');
    expect(f.find((x) => x.category === 'legacy-colors')!.raw).toBe(
      'colors.divider'
    );
    const px = f.find((x) => x.raw === '12px')!;
    expect(px.line).toBe(6 + 1);
    expect(px.col).toBe(12);
    expect(px.suggestion).toEqual({ token: '--gv-space-3', distance: 0 });
  });

  it('matches named colours on word boundaries only', () => {
    const f = run('named-colors.tsx');
    expect(counts(f)).toEqual({ 'styled-block': 1, 'named-color': 1 });
    expect(f.find((x) => x.category === 'named-color')!.raw).toBe('red');
  });

  it('flags layout-spacing props on Box with spacing suggestions', () => {
    const f = run('box-props.tsx');
    expect(counts(f)).toEqual({ 'layout-spacing': 2 });
    const [a, b] = f;
    expect(a.suggestion).toEqual({ token: '--gv-space-3', distance: 0 });
    expect(b.suggestion).toEqual({ token: '--gv-space-2', distance: 0 });
    expect(a.component).toBe('Box');
  });

  it('classifies bo reads as legacy-bo', () => {
    expect(counts(run('bo-reads.tsx'))).toEqual({
      'styled-block': 1,
      'legacy-bo': 1,
    });
  });

  it('counts only --gv- variable reads as token-var', () => {
    const f = run('var-reads.tsx');
    expect(counts(f)).toEqual({ 'styled-block': 1, 'token-var': 1 });
    expect(f.find((x) => x.category === 'token-var')!.raw).toBe(
      'var(--gv-radius-2)'
    );
  });

  it('ignores third-party variables', () => {
    expect(run('third-party.tsx')).toEqual([]);
  });

  it('scans style objects', () => {
    expect(counts(run('style-object.tsx'))).toEqual({
      px: 2,
      hex: 1,
      'named-color': 2,
    });
  });

  it('ignores urls, strings and comments; classifies theme chains once', () => {
    const f = run('tightened.tsx');
    expect(counts(f)).toEqual({ 'styled-block': 1, 'legacy-theme': 2 });
    expect(
      f.filter((x) => x.category === 'legacy-theme').map((x) => x.raw)
    ).toEqual(['theme?.colors?.main', 'props.theme.colors.grey']);
  });

  it('counts colors/bo only when imported, ignoring array methods', () => {
    const f = run('imported-reads.tsx');
    expect(f.map((x) => [x.category, x.raw])).toEqual([
      ['legacy-colors', 'c.divider'],
    ]);
  });

  it('is deterministic and tolerates unparsable source', () => {
    expect(run('styled-literals.tsx')).toEqual(run('styled-literals.tsx'));
    expect(scanFile('bad.tsx', 'const = ;;<', TOKENS)).toEqual([]);
  });

  it('reports parse errors through scanFileResult', () => {
    const r = scanFileResult('bad.tsx', 'const = ;;<', TOKENS);
    expect(r.findings).toEqual([]);
    expect(r.parseError?.line).toBe(1);
    expect(r.parseError?.message).toMatch(/Unexpected|expected/i);
  });

  it('parses .ts files with type assertions', () => {
    const r = scanFileResult(
      'ts-assertion.ts',
      fs.readFileSync(path.join(FIXTURES, 'ts-assertion.ts'), 'utf8'),
      TOKENS
    );
    expect(r.parseError).toBeUndefined();
  });
});

describe('style objects with computed or numeric keys', () => {
  it('skips keys that are not plain names instead of throwing', () => {
    const src = [
      'const a = { b: "c" };',
      'export const X = () => (',
      '  <div style={{ [a.b]: "1px", 1: "2px", color: "red" }} />',
      ');',
    ].join('\n');
    const f = scanFile('computed.tsx', src, TOKENS);
    expect(f.map((x) => `${x.category}:${x.raw}`)).toEqual(['named-color:red']);
  });
});

describe('typedStyled', () => {
  it('scans typedStyled(Component) templates like styled ones', () => {
    const src = [
      "import Link, { typedStyled } from 'utils/cl-router/Link';",
      'const Row = typedStyled(Link)`',
      '  padding: 12px 0;',
      '`;',
    ].join('\n');
    const f = scanFile('typed.tsx', src, TOKENS);
    expect(f.map((x) => `${x.category}:${x.raw}:${x.line}`)).toEqual([
      'styled-block:typedStyled(Link):2',
      'px:12px:3',
    ]);
  });
});

describe('nearestToken', () => {
  it('prefers exact px matches then the closest', () => {
    expect(nearestToken('8px', 'px', TOKENS)).toEqual({
      token: '--gv-space-2',
      distance: 0,
    });
    expect(nearestToken('13px', 'px', TOKENS)).toEqual({
      token: '--gv-space-3',
      distance: 1,
    });
  });
  it('uses CIE76 for colours', () => {
    expect(nearestToken('#fff', 'hex', TOKENS)).toEqual({
      token: '--gv-white',
      distance: 0,
    });
    expect(nearestToken('rgb(0, 0, 0)', 'rgba', TOKENS)?.token).toBe(
      '--gv-black'
    );
    expect(nearestToken('red', 'named-color', TOKENS)?.token).toBe(
      '--gv-red-500'
    );
  });
  it('returns undefined when there is nothing to compare', () => {
    expect(nearestToken('12px', 'px', [])).toBeUndefined();
    expect(nearestToken('${x}', 'hex', TOKENS)).toBeUndefined();
  });
});

describe('namedColors', () => {
  it('has 148 names and no keywords', () => {
    expect(NAMED_COLOR_NAMES).toHaveLength(148);
    ['transparent', 'inherit', 'currentcolor'].forEach((k) =>
      expect(NAMED_COLOR_NAMES).not.toContain(k)
    );
  });
});
