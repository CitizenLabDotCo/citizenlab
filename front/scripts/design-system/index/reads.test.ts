import fs from 'fs';
import path from 'path';

import { legacyValues, STYLE_UTILS_FILE } from '../scan/values';

import { isKnown, staticValue } from './reads';
import { Read, Template } from './schema';
import { indexFile, IndexContext, styleUtilsOf } from './templates';

const FRONT = path.resolve(__dirname, '../../..');
const STYLE_UTILS = fs.readFileSync(path.join(FRONT, STYLE_UTILS_FILE), 'utf8');
const VALUES = legacyValues(STYLE_UTILS);
const CTX: IndexContext = {
  values: VALUES,
  styleUtils: styleUtilsOf(STYLE_UTILS, VALUES),
};

// A read with each Loc reduced to its line.
const lines = (r: unknown): any =>
  JSON.parse(
    JSON.stringify(r, (k, v) =>
      k === 'loc' && v && typeof v === 'object' && 'line' in v ? v.line : v
    )
  );

const FIXTURE = [
  "import styled from 'styled-components';", // 1
  "import { colors, viewportWidths as vw } from 'utils/styleUtils';",
  "import { darken } from 'polished';",
  "import get from 'lodash/get';",
  "import { OTHER } from './other';",
  '',
  "const GAP = '12px';", // 7
  "const BASE = { color: colors.primary, pad: '1px' };",
  "const VARIANTS = { a: { ...BASE, pad: '2px' }, b: { ...BASE }, c: { color: 'red' } };",
  "const pick = (props: any) => (props.small ? '4px' : '8px');", // 10
  'function shade(c: string) { return darken(0.1, c); }',
  'const helper = (x: any) => x.size;',
  '',
  'const A = styled.div<any>`', // 14
  '  color: ${(props) => props.color};', // 15
  '  background: ${({ theme }) => theme.colors.tenantPrimary};',
  '  border-radius: ${(props) => props.theme.borderRadius};',
  '  gap: ${GAP};',
  '  width: ${vw.phone}px;',
  '  outline: ${OTHER};', // 20
  "  padding: ${(p) => p.a || p.b || (p.c ?? '1px')};",
  "  opacity: ${(p) => (p.x === 'y' ? 1 : 0)};",
  "  display: ${(p) => !p.shown && 'none'};",
  "  margin: ${(p) => (p.on ? null : '4px')};",
  "  box-shadow: ${(p) => '0 0 ' + p.blur};", // 25
  "  fill: ${'var(--gv-grey-800)'};",
  '  stroke: ${`1px var(--gv-red-500)`};',
  '  line-height: ${(p) => get(VARIANTS, `${p.v}.pad`)};',
  '  row-gap: ${pick};',
  '  column-gap: ${(p) => shade(p.c)};', // 30
  '  z-index: ${(p) => p.depth * 2};',
  "  top: ${(p) => (p.x == 'y' ? 1 : 0)};",
  '  left: ${({ size = 2 }) => size};',
  '  right: ${(p) => helper(p)};',
  '  font-size: ${() => darken(0.1, null)};', // 35
  '`;',
].join('\n');

const [A] = indexFile('x.tsx', FIXTURE, CTX).templates as Template[];
// The read of the expression on `line`.
const at = (line: number): any =>
  lines(A.exprs.find((e) => e.loc.line === line)?.read);
const lit = (value: string, loc: number) => ({ k: 'literal', value, loc });
const prop = (name: string, loc: number) => ({ k: 'prop', name, loc });

describe('readOf, by rule', () => {
  it('1: reads a function as what it returns, its first parameter as the props', () => {
    expect(at(15)).toEqual(prop('color', 15));
    // A destructured parameter is the props too.
    expect(at(16)).toEqual({
      k: 'theme',
      path: ['colors', 'tenantPrimary'],
      loc: 16,
    });
  });

  it('2: follows consts (recorded in consts) and styleUtils imports, aliased', () => {
    expect(at(18)).toEqual({
      ...lit('12px', 7),
      consts: [{ name: 'GAP', loc: 7 }],
    });
    expect(at(19)).toEqual({
      k: 'const',
      source: 'viewportWidths',
      path: ['phone'],
      value: VALUES.viewportWidths.phone,
      loc: 19,
    });
    // Any other import is unknown, with where it comes from.
    expect(at(20)).toEqual({
      k: 'unknown',
      text: "OTHER (import from './other')",
      loc: 20,
    });
  });

  it('3: gives a theme path its value from styleUtils, when it has one', () => {
    expect(at(17)).toEqual({
      k: 'theme',
      path: ['borderRadius'],
      value: '3px',
      loc: 17,
    });
    // The tenant's colours are only known at run time.
    expect(at(16).value).toBeUndefined();
  });

  it('4: reads operators, flattening chains', () => {
    expect(at(21)).toEqual({
      k: 'or',
      items: [
        prop('a', 21),
        prop('b', 21),
        { k: 'nullish', items: [prop('c', 21), lit('1px', 21)], loc: 21 },
      ],
      loc: 21,
    });
    expect(at(22)).toEqual({
      k: 'cond',
      test: { k: 'eq', left: prop('x', 22), right: lit('y', 22), loc: 22 },
      then: lit('1', 22),
      else: lit('0', 22),
      loc: 22,
    });
    expect(at(23)).toEqual({
      k: 'and',
      items: [{ k: 'not', left: prop('shown', 23), loc: 23 }, lit('none', 23)],
      loc: 23,
    });
    // Loose equality is not read.
    expect(at(32).test).toEqual({ k: 'unknown', text: "p.x == 'y'", loc: 32 });
  });

  it("reads null as '' where styled-components flattens it, else unknown", () => {
    expect(at(24).then).toEqual(lit('', 24));
    expect(at(35).args[1]).toEqual({ k: 'unknown', text: 'null', loc: 35 });
  });

  it('5: reads concatenation and tokens', () => {
    expect(at(25)).toEqual({
      k: 'concat',
      parts: [lit('0 0 ', 25), prop('blur', 25)],
      loc: 25,
    });
    expect(at(26)).toEqual({ k: 'token', name: '--gv-grey-800', loc: 26 });
    expect(at(27)).toEqual({
      k: 'concat',
      parts: [lit('1px ', 27), { k: 'token', name: '--gv-red-500', loc: 27 }],
      loc: 27,
    });
  });

  it('6: reads lodash get as a map; later keys win, keys without the field are absent', () => {
    expect(at(28)).toEqual({
      k: 'map',
      key: prop('v', 28),
      field: 'pad',
      table: {
        a: lit('2px', 9),
        b: { ...lit('1px', 8), consts: [{ name: 'BASE', loc: 8 }] },
      },
      loc: 28,
    });
  });

  it('7: reads same-file calls with what they return, other calls by their args', () => {
    expect(at(29)).toEqual({
      k: 'cond',
      test: prop('small', 10),
      then: lit('4px', 10),
      else: lit('8px', 10),
      loc: 10,
      consts: [{ name: 'pick', loc: 10 }],
    });
    expect(at(30)).toEqual({
      k: 'call',
      callee: 'shade',
      args: [prop('c', 30)],
      returns: {
        k: 'call',
        callee: 'darken',
        args: [lit('0.1', 11), prop('c', 11)],
        loc: 11,
      },
      loc: 30,
    });
    // The props passed on: the callee's first parameter is the props.
    expect(at(34).returns).toEqual(prop('size', 12));
  });

  it('9: reads anything else as unknown, with its source text', () => {
    expect(at(31)).toEqual({ k: 'unknown', text: 'p.depth * 2', loc: 31 });
    // A destructuring default: the value is not the prop's alone.
    expect(at(33)).toEqual({
      k: 'unknown',
      text: 'size (parameter)',
      loc: 33,
    });
  });
});

describe('isKnown and staticValue', () => {
  it('knows a read with no unknown in it', () => {
    const known = A.exprs.filter((e) => isKnown(e.read)).map((e) => e.loc.line);
    // Not 30: shade returns darken(...), a call with no returns.
    expect(known).toEqual([
      15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 34,
    ]);
  });

  it('gives the static string of literals, tokens, consts and their concat', () => {
    const r = (line: number) =>
      A.exprs.find((e) => e.loc.line === line)?.read as Read;
    expect(staticValue(r(18))).toBe('12px');
    expect(staticValue(r(27))).toBe('1px var(--gv-red-500)');
    expect(staticValue(r(19))).toBe(VALUES.viewportWidths.phone);
    expect(staticValue(r(15))).toBeUndefined();
  });
});
