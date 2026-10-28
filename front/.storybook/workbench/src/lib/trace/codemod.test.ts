import fs from 'fs';
import path from 'path';

import { parse as babelParse } from '@babel/parser';

import { EditTrace, lineEditOf, Parse, quoteOf } from './codemod';

const parse: Parse = (code) =>
  babelParse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
    tokens: true,
  }) as unknown as { tokens?: unknown[] };

const FRONT = path.resolve(__dirname, '../../../../..');
const BUTTON = 'app/component-library/components/Button/index.tsx';
const button = fs.readFileSync(path.join(FRONT, BUTTON), 'utf8');

// The trace's range for `expr` on `line` of `text`, as M2 records it.
const traceAt = (
  text: string,
  line: number,
  expr: string,
  over: Partial<EditTrace> = {}
): EditTrace => {
  const lines = text.split('\n');
  const lineText = lines[line - 1];
  const lineStart = lines
    .slice(0, line - 1)
    .reduce((n, l) => n + l.length + 1, 0);
  const at = lineText.indexOf(expr);
  if (at < 0) throw new Error(`${expr} is not on line ${line}`);
  return {
    commit: 'c',
    file: BUTTON,
    line,
    start: lineStart + at,
    end: lineStart + at + expr.length,
    context: 'js',
    lineText,
    ...over,
  };
};

describe('lineEditOf on the Button (plan M4)', () => {
  it('radius: the theme read becomes the token, line 344', () => {
    expect(
      lineEditOf(
        button,
        traceAt(button, 344, 'props.theme.borderRadius'),
        '--gv-radius-control',
        parse
      )
    ).toEqual({
      line: 344,
      old: '    props.theme.borderRadius;',
      new: "    'var(--gv-radius-control)';",
    });
  });

  it('vertical padding: part 0 of the string, line 121', () => {
    expect(
      lineEditOf(
        button,
        traceAt(button, 121, "'9px 18px'", { part: 0 }),
        '--gv-space-2',
        parse
      )
    ).toEqual({
      line: 121,
      old: "        return '9px 18px';",
      new: "        return 'var(--gv-space-2) 18px';",
    });
  });

  it('label size: the whole template literal, line 101', () => {
    expect(
      lineEditOf(
        button,
        traceAt(button, 101, '`${fontSizes.base}px`'),
        '--gv-fs-base',
        parse
      )
    ).toEqual({
      line: 101,
      old: '        return `${fontSizes.base}px`;',
      new: "        return 'var(--gv-fs-base)';",
    });
  });

  it('back office radius: the map entry, line 75', () => {
    expect(
      lineEditOf(
        button,
        traceAt(button, 75, 'bo.borderRadius'),
        '--gv-radius-2',
        parse
      )
    ).toEqual({
      line: 75,
      old: '  borderRadius: bo.borderRadius,',
      new: "  borderRadius: 'var(--gv-radius-2)',",
    });
  });
});

describe('lineEditOf refuses', () => {
  const t = traceAt(button, 344, 'props.theme.borderRadius');

  it('a line that moved since the trace', () => {
    const moved = `// one more line\n${button}`;
    expect(lineEditOf(moved, t, '--gv-radius-control', parse)).toEqual({
      byHand: 'the code moved since the trace',
    });
    expect(
      lineEditOf(button, { ...t, lineText: 'x' }, '--gv-radius-control', parse)
    ).toEqual({ byHand: 'the code moved since the trace' });
  });

  it('a name that is not a token', () => {
    expect(lineEditOf(button, t, "x'); alert(1); ('", parse)).toEqual({
      byHand: "x'); alert(1); (' is not a token name",
    });
  });

  it('a range that is not a whole expression', () => {
    // Half of `props.theme.borderRadius`: the code around it changes.
    const half = { ...t, end: t.start + 'props.theme'.length };
    expect(lineEditOf(button, half, '--gv-radius-control', parse)).toEqual({
      byHand: 'the range is not a whole value',
    });
  });

  it('a string part that does not exist', () => {
    expect(
      lineEditOf(
        button,
        traceAt(button, 121, "'9px 18px'", { part: 4 }),
        '--gv-space-2',
        parse
      )
    ).toEqual({ byHand: 'the string has no part 4' });
  });
});

describe('lineEditOf in a template', () => {
  const css = [
    'const A = styled.div`',
    '  padding: 4px 8px;',
    '  border-radius: ${(p) => p.theme.borderRadius};',
    '`;',
    '',
  ].join('\n');

  it('replaces static text, one part of it', () => {
    expect(
      lineEditOf(
        css,
        traceAt(css, 2, '4px 8px', { context: 'template', part: 1 }),
        '--gv-space-2',
        parse
      )
    ).toEqual({
      line: 2,
      old: '  padding: 4px 8px;',
      new: '  padding: 4px var(--gv-space-2);',
    });
  });

  it('replaces a whole ${…}', () => {
    expect(
      lineEditOf(
        css,
        traceAt(css, 3, '${(p) => p.theme.borderRadius}', {
          context: 'template',
        }),
        '--gv-radius-control',
        parse
      )
    ).toEqual({
      line: 3,
      old: '  border-radius: ${(p) => p.theme.borderRadius};',
      new: '  border-radius: var(--gv-radius-control);',
    });
  });
});

describe('quoteOf', () => {
  it('follows the quote the file uses more', () => {
    expect(quoteOf("a('x'); b('y'); c(\"z\")")).toBe("'");
    expect(quoteOf('a("x"); b("y")')).toBe('"');
  });
});

describe('a `${…}` with its unit (Badge: font-size: ${fontSizes.xs}px;)', () => {
  const BADGE = 'app/component-library/components/Badge/index.tsx';
  const badge = fs.readFileSync(path.join(FRONT, BADGE), 'utf8');

  it('writes the var() over the expression and the unit', () => {
    const t = traceAt(badge, 8, '${fontSizes.xs}px', {
      file: BADGE,
      context: 'template',
      unit: 'px',
    });
    expect(lineEditOf(badge, t, '--gv-fs-xs', parse)).toEqual({
      line: 8,
      old: '  font-size: ${fontSizes.xs}px;',
      new: '  font-size: var(--gv-fs-xs);',
    });
  });

  it('refuses a range whose unit is not what follows', () => {
    const t = traceAt(badge, 8, '${fontSizes.xs}px', {
      file: BADGE,
      context: 'template',
      unit: 'em',
    });
    expect(lineEditOf(badge, t, '--gv-fs-xs', parse)).toHaveProperty('byHand');
  });
});
