import {
  accessors,
  applyTokenPatch,
  CSS_IMPORT,
  ensureCssImport,
  ensureTImport,
  inversePatch,
  isPatch,
  T_IMPORT,
  writeStyle,
} from './writes';

const source = `${JSON.stringify(
  { semantic: { radius: { panel: { $type: 'dimension', $value: '8px' } } } },
  null,
  2
)}\n`;
const ptr = '/semantic/radius/panel/$value';

describe('applyTokenPatch', () => {
  it('replaces after a passing test, keeping the file format', () => {
    const out = applyTokenPatch(source, [
      { op: 'test', path: ptr, value: '8px' },
      { op: 'replace', path: ptr, value: '12px' },
    ]);
    expect(JSON.parse(out).semantic.radius.panel.$value).toBe('12px');
    expect(out.endsWith('}\n')).toBe(true);
    expect(out.split('\n')[1]).toBe('  "semantic": {');
  });

  it('refuses when the source moved on', () => {
    expect(() =>
      applyTokenPatch(source, [
        { op: 'test', path: ptr, value: '4px' },
        { op: 'replace', path: ptr, value: '12px' },
      ])
    ).toThrow(/moved on/);
  });

  it('never adds a token', () => {
    expect(() =>
      applyTokenPatch(source, [
        { op: 'replace', path: '/semantic/radius/card/$value', value: '1px' },
      ])
    ).toThrow(/No/);
  });

  it('inverts back to the original', () => {
    const ops = [
      { op: 'test', path: ptr, value: '8px' },
      { op: 'replace', path: ptr, value: '12px' },
    ] as const;
    const out = applyTokenPatch(source, [...ops]);
    expect(applyTokenPatch(out, inversePatch([...ops]))).toBe(source);
  });

  it('checks the patch shape', () => {
    expect(isPatch([{ op: 'replace', path: ptr, value: '1px' }])).toBe(true);
    expect(isPatch([{ op: 'remove', path: ptr }])).toBe(false);
    expect(isPatch([])).toBe(false);
  });
});

describe('accessors', () => {
  it('maps token names to t paths', () => {
    const map = accessors({
      space: { '3': 'var(--gv-space-3)' },
      color: { background: 'var(--gv-background)' },
    });
    expect(map.get('--gv-space-3')).toBe('t.space[3]');
    expect(map.get('--gv-background')).toBe('t.color.background');
  });
});

const file = (body: string) =>
  `import React from 'react';\n\nimport styled from 'styled-components';\n\n${body}`;

describe('writeStyle', () => {
  it('writes a JSX string attribute as an expression', () => {
    const text = file('const A = () => <Box mb="12px" />;\n');
    const line = 5;
    const col = text.split('\n')[4].indexOf('12px') + 1;
    const r = writeStyle(
      text,
      { line, col, raw: '12px', category: 'layout-spacing' },
      't.space[3]'
    );
    expect(r.ok && r.text).toContain('<Box mb={t.space[3]} />');
    expect(r.ok && r.text).toContain(T_IMPORT);
    expect(r.ok && r.from).toBe('"12px"');
  });

  it('writes a value in a styled template as an interpolation', () => {
    const text = file('const A = styled.div`\n  margin-left: 20px;\n`;\n');
    const r = writeStyle(
      text,
      { line: 6, col: 16, raw: '20px', category: 'px' },
      't.space[5]'
    );
    expect(r.ok && r.text).toContain('margin-left: ${t.space[5]};');
  });

  it('swaps a legacy read for the token', () => {
    const text = file(
      'const A = styled.div`\n  fill: ${colors.textSecondary};\n`;\n'
    );
    const r = writeStyle(
      text,
      {
        line: 6,
        col: 11,
        raw: 'colors.textSecondary',
        category: 'legacy-colors',
      },
      't.color.textSecondary'
    );
    expect(r.ok && r.text).toContain('fill: ${t.color.textSecondary};');
  });

  it('finds the value one line down after an import was added', () => {
    const text = `${T_IMPORT}\n${file(
      'const A = styled.div`\n  margin-left: 20px;\n`;\n'
    )}`;
    const r = writeStyle(
      text,
      { line: 6, col: 16, raw: '20px', category: 'px' },
      't.space[5]'
    );
    expect(r.ok).toBe(true);
  });

  it('writes a plain value without an import', () => {
    const text = file('const A = styled.div`\n  margin-left: 20px;\n`;\n');
    const r = writeStyle(
      text,
      { line: 6, col: 16, raw: '20px', category: 'px' },
      '24px',
      true
    );
    expect(r.ok && r.text).toContain('margin-left: 24px;');
    expect(r.ok && r.text).not.toContain(T_IMPORT);
  });

  it('refuses part of a longer string', () => {
    const text = file('const A = () => <Box p="0 12px" />;\n');
    const col = text.split('\n')[4].indexOf('12px') + 1;
    const r = writeStyle(
      text,
      { line: 5, col, raw: '12px', category: 'px' },
      't.space[3]'
    );
    expect(r.ok).toBe(false);
  });

  it('refuses a file that binds t', () => {
    const text = file(
      'const A = () => {\n  const t = 1;\n  return <Box mb="12px" />;\n};\n'
    );
    const col = text.split('\n')[6].indexOf('12px') + 1;
    const r = writeStyle(
      text,
      { line: 7, col, raw: '12px', category: 'px' },
      't.space[3]'
    );
    expect(!r.ok && r.error).toMatch(/name t/);
  });

  it('refuses when the value moved away', () => {
    const text = file('const A = () => <Box />;\n');
    const r = writeStyle(
      text,
      { line: 5, col: 3, raw: '12px', category: 'px' },
      't.space[3]'
    );
    expect(!r.ok && r.error).toMatch(/scan again/);
  });
});

describe('imports', () => {
  it('merges t into an import of tokens', () => {
    const text =
      "import { cssVar } from 'design-system/tokens/tokens';\n\nconst a = 1;\n";
    expect(ensureTImport(text)).toContain(
      "import { cssVar, t } from 'design-system/tokens/tokens';"
    );
  });

  it('adds after a multi-line import', () => {
    const text = "import {\n  a,\n  b,\n} from 'x';\n\nconst c = 1;\n";
    const out = ensureCssImport(text);
    expect(out.split('\n')[4]).toBe(CSS_IMPORT);
    expect(ensureCssImport(out)).toBe(out);
  });
});
