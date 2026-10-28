import fs from 'fs';
import path from 'path';

import { NAMED_COLOR_NAMES } from './namedColors';
import { nearestToken, scanFile, scanFileResult } from './findings';
import { Finding, FindingCategory, TokenMeta } from './schema';

const FIXTURES = path.join(__dirname, '..', 'fixtures', 'findings');

const tok = (name: string, category: string, value: string): TokenMeta => ({
  name,
  category,
  tier: 1,
  value,
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
      // 12px, 1px, and '3px' under the CSS key borderRadius in `theme`.
      px: 3,
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

describe('token API reads', () => {
  it('counts t.<group>.<key> from the generated tokens module as token-var', () => {
    const src = [
      "import { t as tk } from 'design-system/tokens/tokens';",
      "import { t } from '../../design-system/tokens/tokens';",
      'export const X = () => (',
      '  <Box borderRadius={tk.radius.panel} p={t.space[4]} m={`${t.space[2]} 0`} />',
      ');',
      // A local `t` (a translation function, say) is not the token API.
      'const u = (t: any) => t.radius.panel;',
    ].join('\n');
    const f = scanFile('token-api.tsx', src, TOKENS);
    expect(
      f.filter((x) => x.category === 'token-var').map((x) => x.raw)
    ).toEqual(['tk.radius.panel', 't.space[4]', 't.space[2]']);
  });

  it('ignores a t imported from anywhere else', () => {
    const src = [
      "import { t } from 'i18n';",
      'export const X = () => <Box p={t.space[4]} />;',
    ].join('\n');
    expect(scanFile('other-t.tsx', src, TOKENS)).toEqual([]);
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

describe('px on style props and CSS strings', () => {
  const run = (lines: string[]) =>
    scanFile('style-props.tsx', lines.join('\n'), TOKENS).map(
      (x) => `${x.category}:${x.raw}:${x.line}:${x.col}`
    );

  it('accepts px and colours only as the fallback of a --gv- token variable', () => {
    expect(
      run([
        "const a = { borderRadius: 'var(--gv-radius-control, 3px)' };",
        'const B = styled.div`',
        '  border-radius: var(--gv-radius-control, 3px);',
        '  color: var(--gv-colour-text, var(--gv-colour-ink, #333));',
        '  padding: var(--other, 4px) var(--gv-space-2, 8px) 5px;',
        '`;',
        'export const C = () => <Box width="var(--gv-size-panel, 380px)" h="7px" />;',
      ]).filter((x) => /^(px|hex|rgba|named-color):/.test(x))
    ).toEqual(['px:4px:5:25', 'px:5px:5:53', 'px:7px:7:68']);
  });

  it('counts px on non-spacing props of primitives as px, spacing stays layout-spacing', () => {
    expect(
      run([
        'export const A = () => (',
        '  <Box width="380px" h="7px" p="8px" borderRadius="12px">',
        '    <Image maxWidth="200px" alt="" />',
        '    <Text fontSize="14px" lineHeight="20px" top="1px" color="red" />',
        '    <Card width="300px" />',
        '  </Box>',
        ');',
      ])
    ).toEqual([
      'px:380px:2:15',
      'px:7px:2:25',
      'layout-spacing:8px:2:33',
      'px:12px:2:52',
      'px:200px:3:22',
      'px:14px:4:21',
      'px:20px:4:39',
      'px:1px:4:50',
    ]);
  });

  it('reads template literals on style props (border shorthands)', () => {
    expect(
      run([
        'export const A = () => (',
        '  <Box borderBottom={`1px solid ${c}`} mt={`${n}px`} />',
        ');',
      ])
    ).toEqual(['px:1px:2:23']);
  });

  it('reads both branches of a conditional prop value', () => {
    expect(
      run([
        'export const A = () => (',
        "  <Box left={a ? '0px' : undefined} borderBottom={b ? 'none' : `1px solid ${c}`} mb={d && '4px'} />",
        ');',
      ])
    ).toEqual(['px:0px:2:19', 'px:1px:2:65', 'layout-spacing:4px:2:92']);
  });

  it('scans plain strings that hold CSS declarations, once', () => {
    expect(
      run([
        'const segment = `',
        '  padding: 5px 14px;',
        '  color: red;',
        '`;',
        "const label = 'Width: see docs';",
        "const one = 'margin: 2px;';",
        'const Tagged = styled.div`gap: 3px;`;',
      ])
    ).toEqual([
      'px:5px:2:12',
      'px:14px:2:16',
      'named-color:red:3:10',
      'px:2px:6:22',
      'styled-block:styled.div:7:16',
      'px:3px:7:32',
    ]);
  });

  it('scans px strings under CSS-property keys of plain objects, not inside style={{}}', () => {
    expect(
      run([
        "const cell = { py: '8px', paddingTop: '6px', iconSize: '120px' };",
        "export const A = () => <div style={{ width: '9px' }} />;",
      ])
    ).toEqual(['px:6px:1:40', 'px:9px:2:46']);
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
  it('suggests only tokens of the same alpha for a colour', () => {
    const pool = [
      ...TOKENS,
      tok('--gv-scrim', 'color', 'rgba(0,0,0,0.7)'),
      tok('--gv-half', 'color', '#00000080'),
    ];
    // Opaque black is no suggestion for a translucent black.
    expect(nearestToken('rgba(0,0,0,0.18)', 'rgba', pool)).toBeUndefined();
    expect(nearestToken('rgba(0, 0, 0, 0.7)', 'rgba', pool)).toEqual({
      token: '--gv-scrim',
      distance: 0,
    });
    // Within half an 8-bit step: #00000080 is 0.502.
    expect(nearestToken('rgba(0, 0, 0, 0.5)', 'rgba', pool)?.token).toBe(
      '--gv-half'
    );
    expect(nearestToken('rgb(0 0 0 / 50%)', 'rgba', pool)?.token).toBe(
      '--gv-half'
    );
    expect(nearestToken('#0000004d', 'hex', pool)).toBeUndefined();
    // An alpha of 1 is opaque.
    expect(nearestToken('rgba(0, 0, 0, 1)', 'rgba', pool)?.token).toBe(
      '--gv-black'
    );
  });
  it('prefers tier-1 primitives on equal distance, then name', () => {
    const t = (name: string, tier: 1 | 2): TokenMeta => ({
      ...tok(name, 'space', '8px'),
      tier,
    });
    expect(
      nearestToken('8px', 'px', [t('--gv-a-semantic', 2), t('--gv-z-prim', 1)])
        ?.token
    ).toBe('--gv-z-prim');
    expect(
      nearestToken('8px', 'px', [t('--gv-z-prim', 1), t('--gv-a-semantic', 2)])
        ?.token
    ).toBe('--gv-z-prim');
    expect(
      nearestToken('8px', 'px', [t('--gv-b', 1), t('--gv-a', 1)])?.token
    ).toBe('--gv-a');
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
