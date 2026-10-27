import fs from 'fs';
import path from 'path';

import { legacyValues, STYLE_UTILS_FILE } from '../scan/values';

import { designClass, designCounts, isDesignProp } from './designCounts';
import { Template } from './schema';
import { IndexContext, styleUtilsOf, templatesOf } from './templates';

const FRONT = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(FRONT, rel), 'utf8');
const STYLE_UTILS = read(STYLE_UTILS_FILE);
const VALUES = legacyValues(STYLE_UTILS);
const CTX: IndexContext = {
  values: VALUES,
  styleUtils: styleUtilsOf(STYLE_UTILS, VALUES),
};

describe('isDesignProp', () => {
  it('takes colours, spaces, radii, type, shadows, border widths and their shorthands', () => {
    [
      'color',
      'background',
      'background-color',
      'fill',
      'stroke',
      'border-color',
      'border-left-color',
      'outline-color',
      'text-decoration-color',
      'padding',
      'padding-inline-start',
      'margin-top',
      'gap',
      'row-gap',
      'column-gap',
      'border-radius',
      'border-top-left-radius',
      'font-size',
      'font-weight',
      'font-family',
      'line-height',
      'letter-spacing',
      'box-shadow',
      'border-width',
      'border-bottom-width',
      'border',
      'border-top',
      'outline',
      'font',
      'border-${0}-color',
    ].forEach((p) => expect([p, isDesignProp(p)]).toEqual([p, true]));
  });

  it('leaves out positions, sizes and the rest', () => {
    [
      'inset',
      'top',
      'right',
      'bottom',
      'left',
      'width',
      'z-index',
      'border-style',
      'outline-offset',
      'background-image',
      '${0}',
    ].forEach((p) => expect([p, isDesignProp(p)]).toEqual([p, false]));
  });
});

describe('designClass', () => {
  const code = [
    "import styled, { css } from 'styled-components';",
    "import { colors } from 'utils/styleUtils';",
    "import { darken } from 'polished';",
    "import { OTHER } from './other';",
    'const A = styled.div<any>`',
    '  color: var(--gv-grey-800);', // token: static text
    "  border-color: ${(p) => p.c || 'var(--gv-red-500)'};", // token leaf
    "  background: ${(p) => p.bg || colors.primary || 'red'};", // legacy over literal and prop
    '  padding: 4px;', // literal: static text
    '  margin: ${(p) => p.m || 0};', // literal over prop
    '  gap: ${(p) => p.gap};', // prop
    '  fill: ${(p) => p.on && css`x: y;`};', // prop over the template leaf
    '  stroke: ${OTHER};', // unknown
    '  outline-color: ${() => darken(0.1, colors.primary)};', // a call without returns
    '  border-${(p) => p.side}-color: ${(p) => p.c};', // prop over the property hole
    '  border-${(p) => p.side}-width: 1px;', // literal over the property hole
    '  width: ${(p) => p.w};', // not a design property
    '  ${(p) => p.mixin}', // nor is a statement hole
    '`;',
  ].join('\n');
  const [t] = templatesOf('x.tsx', code, CTX);

  it('gives each design declaration one class', () => {
    expect(t.decls.map((d) => [d.loc.line, designClass(d, t)])).toEqual([
      [6, 'token'],
      [7, 'token'],
      [8, 'legacy'],
      [9, 'literal'],
      [10, 'literal'],
      [11, 'prop'],
      [12, 'prop'],
      [13, 'unknown'],
      [14, 'unknown'],
      [15, 'prop'],
      [16, 'literal'],
      [17, undefined],
      [18, undefined],
    ]);
    expect(designCounts([t])).toEqual({
      templates: 1,
      decls: 13,
      design: { token: 2, legacy: 1, literal: 3, prop: 3, unknown: 2 },
    });
  });
});

describe('designCounts, Button/index.tsx', () => {
  it('counts its templates, declarations and design classes', () => {
    const file = 'app/component-library/components/Button/index.tsx';
    const templates: Template[] = templatesOf(file, read(file), CTX);
    expect(designCounts(templates)).toEqual({
      templates: 9,
      decls: 101,
      design: { token: 0, legacy: 15, literal: 20, prop: 0, unknown: 0 },
    });
  });
});
