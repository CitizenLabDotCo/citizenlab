import fs from 'fs';
import path from 'path';

import { scanFile } from './findings';
import { legacyValues, lookup, STYLE_UTILS_FILE } from './values';

// The shapes of app/component-library/utils/styleUtils.ts, small.
const STYLE_UTILS = [
  "import { transparentize } from 'polished';",
  "const BO_FONT_SIZE = '13px';",
  "export const themeColors = { grey800: '#333333', grey300: '#E0E0E0' };",
  'export const semanticColors = {',
  '  textPrimary: themeColors.grey800,',
  "  divider: themeColors['grey300'],",
  '};',
  'export const colors = {',
  '  ...semanticColors,',
  '  ...themeColors,',
  "  tenantPrimary: '#ef0071',",
  "  faded: transparentize(0.5, '#000000'),",
  '};',
  'export const fontSizes = { base: 16, xl: 21 };',
  'export const bo = {',
  "  colors: { textHeading: '#474747' },",
  "  borderRadius: '8px',",
  '  headerFontSize: BO_FONT_SIZE,',
  "  buttonMedium: { height: '32px', fontSize: BO_FONT_SIZE },",
  '};',
  'export const stylingConsts = {',
  '  menuHeight: 78,',
  "  borderRadius: '3px',",
  '  border: `1px solid ${colors.divider}`,',
  '};',
].join('\n');

const VALUES = legacyValues(STYLE_UTILS);

describe('legacyValues', () => {
  it('reads the objects statically and the theme as getTheme() builds it', () => {
    const grey = {
      textPrimary: '#333333',
      divider: '#E0E0E0',
      grey800: '#333333',
      grey300: '#E0E0E0',
    };
    // The value maps; viewportWidths and defs have their own tests below.
    const { viewportWidths: _w, defs: _d, ...maps } = VALUES;
    expect(maps).toEqual({
      theme: {
        // No tenant colours: they are the city's.
        colors: grey,
        fontSizes: { base: '16', xl: '21' },
        menuHeight: '78',
        borderRadius: '3px',
        border: '1px solid #E0E0E0',
      },
      // `faded` is a call: no value.
      colors: { ...grey, tenantPrimary: '#ef0071' },
      bo: {
        colors: { textHeading: '#474747' },
        borderRadius: '8px',
        headerFontSize: '13px',
        buttonMedium: { height: '32px', fontSize: '13px' },
      },
    });
  });

  it('never keeps a value that a later spread or key may override', () => {
    const v = legacyValues(
      [
        "import { other } from 'x';",
        "const base = { a: '1px', c: make() };",
        "export const colors = { c: '#000000', ...base, d: '#111111' };",
        "export const bo = { a: '1px', ...other, b: '2px', [k]: '3px', d: '4px' };",
      ].join('\n')
    );
    expect(v.colors).toEqual({ a: '1px', d: '#111111' });
    expect(v.bo).toEqual({ d: '4px' });
  });

  it('reads an empty map for an object it does not find', () => {
    expect(legacyValues('export const x = 1;')).toEqual({
      theme: { colors: {}, fontSizes: {} },
      colors: {},
      bo: {},
      viewportWidths: {},
      defs: {},
    });
  });

  it('places each value at the property that wrote it, through spreads', () => {
    const at = (line: number, col = 2) => ({
      file: STYLE_UTILS_FILE,
      line,
      col,
    });
    // Lines of STYLE_UTILS above, 1-based; columns 0-based.
    expect(VALUES.defs['theme.borderRadius']).toEqual(at(23));
    expect(VALUES.defs['stylingConsts.borderRadius']).toEqual(at(23));
    expect(VALUES.defs['bo.borderRadius']).toEqual(at(17));
    // A key spread into colors is placed where its own object wrote it, and
    // a value read through a member is placed at the key that read it.
    expect(VALUES.defs['colors.grey800']).toEqual(at(3, 29));
    expect(VALUES.defs['colors.textPrimary']).toEqual(at(5));
    expect(VALUES.defs['theme.colors.textPrimary']).toEqual(at(5));
    expect(VALUES.defs['theme.fontSizes.base']).toEqual(at(14, 27));
    expect(VALUES.defs['fontSizes.base']).toEqual(at(14, 27));
    expect(VALUES.defs['bo.buttonMedium.fontSize']).toEqual(at(19, 34));
    // No value, no place: a tenant colour, a call.
    expect(VALUES.defs['theme.colors.tenantPrimary']).toBeUndefined();
    expect(VALUES.defs['colors.faded']).toBeUndefined();
    // Every value returned has a place, and nothing else does.
    const paths = (map: object, prefix: string): string[] =>
      Object.entries(map).flatMap(([key, v]) =>
        typeof v === 'string' ? [prefix + key] : paths(v, `${prefix}${key}.`)
      );
    expect(
      [
        ...paths(VALUES.theme, 'theme.'),
        ...paths(VALUES.colors, 'colors.'),
        ...paths(VALUES.bo, 'bo.'),
        ...paths(VALUES.theme.fontSizes as object, 'fontSizes.'),
        'stylingConsts.menuHeight',
        'stylingConsts.borderRadius',
        'stylingConsts.border',
      ].sort()
    ).toEqual(Object.keys(VALUES.defs));
  });

  it('drops the place of a key a later unknown spread may override', () => {
    const v = legacyValues(
      [
        "import { other } from 'x';",
        "export const bo = { a: '1px', ...other, b: '2px' };",
      ].join('\n')
    );
    expect(v.defs).toEqual({
      'bo.b': { file: STYLE_UTILS_FILE, line: 2, col: 40 },
    });
  });

  it('reads the real styleUtils.ts: values and their definition lines', () => {
    const real = legacyValues(
      fs.readFileSync(
        path.join(__dirname, '..', '..', '..', STYLE_UTILS_FILE),
        'utf8'
      )
    );
    const line = (key: string) => real.defs[key]?.line;
    expect([
      lookup(real.theme, ['borderRadius']),
      line('theme.borderRadius'),
    ]).toEqual(['3px', 242]);
    expect([
      lookup(real.bo, ['borderRadius']),
      line('bo.borderRadius'),
    ]).toEqual(['8px', 220]);
    expect([
      lookup(real.theme, ['fontSizes', 'base']),
      line('theme.fontSizes.base'),
    ]).toEqual(['16', 153]);
    expect(real.viewportWidths).toEqual({
      phone: '769',
      tablet: '1200',
      smallDesktop: '1366',
    });
    expect(line('viewportWidths.phone')).toBe(15);
  });

  it('looks up own keys down to a value only', () => {
    expect(lookup(VALUES.theme, ['colors', 'grey800'])).toBe('#333333');
    expect(lookup(VALUES.theme, ['colors'])).toBeUndefined();
    expect(lookup(VALUES.theme, ['borderRadius', 'length'])).toBeUndefined();
    expect(lookup(VALUES.theme, ['constructor'])).toBeUndefined();
  });
});

describe('legacy finding values', () => {
  const SOURCE = [
    "import styled from 'styled-components';",
    "import { colors as c, bo } from '@citizenlab/cl2-component-library';",
    "import { colors as chart } from 'components/admin/Graphs/styling';",
    'const Button = styled.button`',
    '  border-radius: ${(props) => props.theme.borderRadius};',
    '  color: ${({ theme }) => theme.colors.tenantPrimary};',
    '  font-size: ${({ theme }) => theme.fontSizes.base}px;',
    '  background: ${c.grey800};',
    '  border-color: ${(props) => props.theme.colors[props.color]};',
    '  height: ${bo.buttonMedium.height};',
    '  border-radius: ${bo.borderRadius};',
    '  outline-color: ${chart.grey800};',
    '  fill: ${({ theme }) => theme.colors};',
    '`;',
  ].join('\n');

  const valuesOf = (values?: typeof VALUES) =>
    scanFile('Button.tsx', SOURCE, [], values)
      .filter((f) => f.category.startsWith('legacy-'))
      .map((f) => [f.raw, f.value]);

  it('carries the value a legacy read renders with the default theme', () => {
    expect(valuesOf(VALUES)).toEqual([
      ['props.theme.borderRadius', '3px'],
      // A tenant colour is the city's.
      ['theme.colors.tenantPrimary', undefined],
      ['theme.fontSizes.base', '16'],
      ['c.grey800', '#333333'],
      // A computed link.
      ['props.theme.colors[props.color]', undefined],
      ['bo.buttonMedium.height', '32px'],
      ['bo.borderRadius', '8px'],
      // The admin graph styling's own palette, not the style utils' colors.
      ['chart.grey800', undefined],
      // A map, not a value.
      ['theme.colors', undefined],
    ]);
  });

  it('leaves the property out when there is no value or no maps', () => {
    const withMaps = scanFile('Button.tsx', SOURCE, [], VALUES);
    withMaps
      .filter((f) => f.value === undefined)
      .forEach((f) => expect(f).not.toHaveProperty('value'));
    const without = scanFile('Button.tsx', SOURCE, []);
    expect(without.length).toBe(withMaps.length);
    without.forEach((f) => expect(f).not.toHaveProperty('value'));
  });
});
