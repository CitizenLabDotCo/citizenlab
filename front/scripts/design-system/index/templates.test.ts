import fs from 'fs';
import path from 'path';

import { legacyValues, STYLE_UTILS_FILE } from '../scan/values';

import { Read, Template } from './schema';
import {
  indexFile,
  IndexContext,
  styleUtilsOf,
  templatesOf,
} from './templates';

const FRONT = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(FRONT, rel), 'utf8');

const STYLE_UTILS = read(STYLE_UTILS_FILE);
const VALUES = legacyValues(STYLE_UTILS);
const CTX: IndexContext = {
  values: VALUES,
  styleUtils: styleUtilsOf(STYLE_UTILS, VALUES),
};

/** A read with each Loc reduced to its line, for readable expectations. */
const lines = (r: unknown): any =>
  JSON.parse(
    JSON.stringify(r, (k, v) =>
      k === 'loc' && v && typeof v === 'object' && 'line' in v ? v.line : v
    )
  );

const declAt = (t: Template, line: number) => {
  const d = t.decls.find((x) => x.loc.line === line);
  if (!d) throw new Error(`no decl at line ${line}`);
  return d;
};

// The read of the one hole in the value of the decl at `line`.
const valueRead = (t: Template, line: number): Read => {
  const d = declAt(t, line);
  const holes = d.value.filter((v): v is number => typeof v === 'number');
  expect(holes).toHaveLength(1);
  return t.exprs[holes[0]].read;
};

describe('Button/index.tsx', () => {
  const FILE = 'app/component-library/components/Button/index.tsx';
  const templates = templatesOf(FILE, read(FILE), CTX);
  const container = templates.find((t) => t.name === 'Container') as Template;
  const string = templates.find((t) => t.kind === 'string') as Template;
  // A line-reduced read (see `lines`) through the BO_GEOMETRY const.
  const BO = (line: number, value: object) => ({
    ...value,
    loc: line,
    consts: [{ name: 'BO_GEOMETRY', loc: 72 }],
  });

  it('has the Container and the string template getButtonStyle returns', () => {
    expect(container).toMatchObject({
      id: `${FILE}:548:51`,
      kind: 'styled',
      tag: 'Box',
      loc: { line: 548 },
    });
    expect(string).toMatchObject({
      id: `${FILE}:400:9`,
      kind: 'string',
      name: 'getButtonStyle',
      loc: { line: 400 },
    });
    expect(templates.filter((t) => t.kind === 'string')).toHaveLength(1);
    expect(templates.map((t) => t.loc.start)).toEqual(
      [...templates.map((t) => t.loc.start)].sort((a, b) => a - b)
    );
  });

  it('reads border-radius (line 412) through the borderRadius const', () => {
    const d = declAt(string, 412);
    expect(d.prop).toBe('border-radius');
    expect(d.value).toEqual(['', d.value[1], '']);
    const r = lines(valueRead(string, 412));
    const bo = {
      k: 'const',
      source: 'bo',
      path: ['borderRadius'],
      value: '8px',
      loc: 75,
      consts: [{ name: 'BO_GEOMETRY', loc: 72 }],
    };
    expect(r).toEqual({
      k: 'or',
      items: [
        { k: 'prop', name: 'borderRadius', loc: 342 },
        {
          k: 'map',
          key: { k: 'prop', name: 'buttonStyle', loc: 343 },
          field: 'borderRadius',
          table: {
            'bo-primary': bo,
            'bo-secondary': bo,
            'bo-text': bo,
            'bo-delete': bo,
            'bo-status': bo,
            'bo-picker': {
              k: 'literal',
              value: '999px',
              loc: 87,
              consts: [{ name: 'BO_PICKER_GEOMETRY', loc: 83 }],
            },
          },
          loc: 343,
        },
        { k: 'theme', path: ['borderRadius'], value: '3px', loc: 344 },
      ],
      loc: 342,
      consts: [{ name: 'borderRadius', loc: 341 }],
    });
  });

  it('reads padding (line 423) down to getPadding (line 106)', () => {
    expect(declAt(string, 423).prop).toBe('padding');
    const r = lines(valueRead(string, 423));
    expect(r.items.slice(0, 2)).toEqual([
      { k: 'prop', name: 'padding', loc: 358 },
      { k: 'prop', name: 'p', loc: 359 },
    ]);
    expect(r.items[2]).toMatchObject({ k: 'map', field: 'padding' });
    expect(r.items[2].table['bo-primary']).toEqual(
      BO(74, { k: 'literal', value: '0 16px' })
    );
    const lit = (value: string, loc: number) => ({ k: 'literal', value, loc });
    expect(r.items[3]).toMatchObject({
      k: 'call',
      callee: 'getPadding',
      loc: 361,
    });
    expect(r.items[3].returns).toEqual({
      k: 'cond',
      test: { k: 'prop', name: 'padding', loc: 107 },
      then: { k: 'prop', name: 'padding', loc: 108 },
      else: {
        k: 'cond',
        test: { k: 'prop', name: 'p', loc: 109 },
        then: { k: 'prop', name: 'p', loc: 110 },
        else: {
          k: 'switch',
          on: { k: 'prop', name: 'size', loc: 112 },
          cases: [
            { value: 'm', then: lit('11px 22px', 114) },
            { value: 'l', then: lit('13px 24px', 116) },
            { value: 'xl', then: lit('15px 26px', 118) },
          ],
          default: lit('9px 18px', 121),
          loc: 112,
        },
        loc: 109,
      },
      loc: 107,
    });
  });

  it('reads font-size (line 444) under the ButtonText selector', () => {
    const d = declAt(string, 444);
    expect(d.prop).toBe('font-size');
    const k = Number(/^\$\{(\d+)\}$/.exec(d.selectors[0])?.[1]);
    expect(d.selectors).toEqual([`\${${k}}`]);
    const buttonText = templates.find((t) => t.name === 'ButtonText');
    expect(buttonText?.loc.line).toBe(521);
    expect(string.exprs[k]).toMatchObject({
      text: 'ButtonText',
      shape: 'component',
      component: buttonText?.id,
      loc: { line: 441 },
    });
    const r = lines(valueRead(string, 444));
    const px = (size: string, value: string, loc: number) => ({
      k: 'concat',
      parts: [
        { k: 'const', source: 'fontSizes', path: [size], value, loc },
        { k: 'literal', value: 'px', loc },
      ],
      loc,
    });
    expect(r.items[0]).toEqual({ k: 'prop', name: 'fontSize', loc: 363 });
    expect(r.items[1].table['bo-primary']).toEqual(BO(76, px('s', '14', 76)));
    expect(r.items[2]).toMatchObject({ k: 'call', callee: 'getFontSize' });
    expect(r.items[2].returns).toEqual({
      k: 'cond',
      test: { k: 'prop', name: 'fontSize', loc: 92 },
      then: { k: 'prop', name: 'fontSize', loc: 93 },
      else: {
        k: 'switch',
        on: { k: 'prop', name: 'size', loc: 95 },
        cases: [
          { value: 'm', then: px('l', '18', 97) },
          { value: 'l', then: px('xl', '21', 99) },
        ],
        default: px('base', '16', 101),
        loc: 95,
      },
      loc: 92,
    });
  });

  it("reads the Container's own declarations", () => {
    expect(lines(valueRead(container, 551))).toEqual({
      k: 'or',
      items: [
        { k: 'prop', name: 'justifyWrapper', loc: 551 },
        { k: 'literal', value: 'center', loc: 551 },
      ],
      loc: 551,
    });
    const block = container.decls.find((d) => d.loc.line === 561);
    expect(block?.prop).toMatch(/^\$\{\d+\}$/);
    const k = Number(/^\$\{(\d+)\}$/.exec(block?.selectors[0] ?? '')?.[1]);
    expect(container.exprs[k]).toMatchObject({
      text: 'StyledButton',
      shape: 'component',
      loc: { line: 560 },
    });
    const fn = container.exprs.find((e) => e.loc.line === 561);
    expect(fn?.shape).toBe('fn');
    expect(lines(fn?.read)).toMatchObject({
      k: 'call',
      callee: 'getButtonStyle',
      returns: { k: 'template', id: string.id },
    });
  });

  it('flags the conditional declarations of lines 424-439 as property holes', () => {
    const holes = string.decls.filter(
      (d) => d.loc.line >= 424 && d.loc.line <= 439
    );
    expect(holes.length).toBeGreaterThan(0);
    holes.forEach((d) => {
      expect(d.prop).toMatch(/^\$\{\d+\}$/);
      expect(d.value).toEqual([]);
    });
  });
});

describe('templatesOf, fixtures', () => {
  const FIXTURE = [
    "import styled, { css, createGlobalStyle, keyframes as kf } from 'styled-components';", // 1
    "import { colors, fontSizes, media, isRtl } from '@citizenlab/cl2-component-library';",
    "import Box from 'components/Box';",
    "import { withoutSpacing } from 'utils/textUtils';",
    '',
    "const Input = styled(Box).attrs({ as: 'input' })<{ big: boolean }>`", // 6
    "  padding: ${(p) => (p.big ? '8px' : '4px')};",
    '`;',
    '',
    'const A = styled.div<{ active: boolean }>`', // 10
    "  ${(props) => (props.active ? css`color: ${colors.primary};` : '')}",
    '`;',
    '',
    'const Global = createGlobalStyle`', // 14
    '  body { font-size: ${fontSizes.base}px; }',
    '`;',
    '',
    'const B = styled.div`', // 18
    '  padding: 8px;',
    '  ${media.phone`',
    '    padding: 4px;',
    '  `}',
    '  margin-left: 4px;',
    '  ${isRtl`',
    '    margin-left: 0;',
    '  `}',
    '`;',
    '',
    'const fade = kf`from { opacity: 0; } to { opacity: 1; }`;', // 29
    'const text = withoutSpacing`x`;',
    'const local = { css: (s: any) => s };',
    'const C = local.css`color: red;`;',
  ].join('\n');
  const { templates, unknownTags } = indexFile('x.tsx', FIXTURE, CTX);
  const at = (line: number) => templates.find((t) => t.loc.line === line);

  it('recognises styled(X).attrs(...)<T>`` with its function', () => {
    expect(at(6)).toMatchObject({ kind: 'styled', tag: 'Box', name: 'Input' });
    expect(at(6)?.exprs[0].shape).toBe('fn');
    expect(lines(at(6)?.exprs[0].read)).toEqual({
      k: 'cond',
      test: { k: 'prop', name: 'big', loc: 7 },
      then: { k: 'literal', value: '8px', loc: 7 },
      else: { k: 'literal', value: '4px', loc: 7 },
      loc: 7,
    });
  });

  it('indexes a css`` inside a ternary as its own template', () => {
    const inner = templates.find(
      (t) => t.kind === 'css' && t.loc.line === 11
    ) as Template;
    expect(inner.quasis).toEqual(['color: ', ';']);
    expect(lines(inner.exprs[0].read)).toEqual({
      k: 'const',
      source: 'colors',
      path: ['primary'],
      value: VALUES.colors.primary,
      loc: 11,
    });
    expect(inner.exprs[0]).toMatchObject({
      shape: 'value',
      value: VALUES.colors.primary,
    });
    expect(lines(at(10)?.exprs[0].read)).toEqual({
      k: 'cond',
      test: { k: 'prop', name: 'active', loc: 11 },
      then: { k: 'template', id: inner.id, loc: 11 },
      // '' in a style template is dropped by flatten: kept as literal ''.
      else: { k: 'literal', value: '', loc: 11 },
      loc: 11,
    });
  });

  it('recognises createGlobalStyle and an aliased keyframes', () => {
    expect(at(14)).toMatchObject({ kind: 'global', name: 'Global' });
    expect(at(14)?.decls[0]).toMatchObject({
      prop: 'font-size',
      selectors: ['body'],
      value: ['', 0, 'px'],
    });
    expect(lines(at(14)?.exprs[0].read)).toEqual({
      k: 'const',
      source: 'fontSizes',
      path: ['base'],
      value: '16',
      loc: 15,
    });
    expect(at(29)).toMatchObject({ kind: 'keyframes', name: 'fade' });
    expect(at(29)?.decls.map((d) => d.selectors)).toEqual([['from'], ['to']]);
  });

  it('indexes a media.phone call site with the at-rule of its wrapper', () => {
    const helper = CTX.styleUtils.helpers['media.phone'];
    expect(helper).toEqual({
      wrapper: `${STYLE_UTILS_FILE}:21:42`,
      atRules: [`@media (max-width: ${VALUES.viewportWidths.phone}px)`],
    });
    const slot = templates.find((t) => t.tag === 'media.phone') as Template;
    expect(slot).toMatchObject({ kind: 'css', loc: { line: 20 } });
    expect(slot.decls).toEqual([
      expect.objectContaining({
        prop: 'padding',
        value: ['4px'],
        atRules: helper.atRules,
        loc: expect.objectContaining({ line: 21 }),
      }),
    ]);
    expect(at(18)?.exprs[0]).toMatchObject({
      shape: 'helper',
      wrapper: helper.wrapper,
      slot: slot.id,
      read: { k: 'template', id: slot.id },
    });
    expect(at(18)?.decls[1]).toMatchObject({ prop: '${0}', value: [] });
  });

  it('indexes an isRtl call site, with no at-rule', () => {
    const slot = templates.find((t) => t.tag === 'isRtl') as Template;
    expect(slot).toMatchObject({ kind: 'css', loc: { line: 24 } });
    expect(slot.decls[0]).toMatchObject({ prop: 'margin-left', atRules: [] });
    expect(at(18)?.exprs[1]).toMatchObject({
      shape: 'helper',
      wrapper: CTX.styleUtils.helpers.isRtl.wrapper,
      slot: slot.id,
    });
  });

  it('counts any other tag as unknown', () => {
    expect(unknownTags).toEqual([
      { file: 'x.tsx', line: 30, col: 13, tag: 'withoutSpacing' },
      { file: 'x.tsx', line: 32, col: 10, tag: 'local.css' },
    ]);
    expect(templates).toHaveLength(8);
  });

  it('follows the styled-components binding, not the name', () => {
    const code = [
      "import { css as style } from 'styled-components';",
      'const a = style`color: red;`;',
      'const f = (css: any) => css`color: blue;`;',
    ].join('\n');
    const r = indexFile('y.ts', code, CTX);
    expect(r.templates.map((t) => [t.kind, t.name])).toEqual([['css', 'a']]);
    expect(r.unknownTags.map((t) => t.tag)).toEqual(['css']);
  });
});
