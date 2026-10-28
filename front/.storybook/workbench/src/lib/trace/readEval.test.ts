import { buttonFixture, FRONT, STYLE_UTILS } from './fixture';
import { EvalOk, readEval } from './readEval';
import type { Loc, Read } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const values = require(`${FRONT}/${STYLE_UTILS}`);
const theme = values.getTheme(null);
const fx = buttonFixture(values);
// `border-radius: ${borderRadius};` (Button/index.tsx:412)
const radius = fx.string.exprs[8];

const leafOf = (props: Record<string, unknown>) => {
  const r = readEval(radius.read, { ...props, theme });
  expect(r.ok).toBe(true);
  return r as EvalOk;
};

describe('readEval on the Button radius', () => {
  it('reads the template expression at line 412 through const borderRadius', () => {
    expect(radius.loc.line).toBe(412);
    expect(radius.read.consts?.map((c) => [c.name, c.loc.line])).toEqual([
      ['borderRadius', 341],
    ]);
  });

  it("primary: the theme's borderRadius, line 344", () => {
    const r = leafOf({ buttonStyle: 'primary' });
    expect(r.value).toBe('3px');
    expect(r.leaf).toMatchObject({ k: 'theme', path: ['borderRadius'] });
    expect(r.leaf.loc.line).toBe(344);
    expect(r.via.map((v) => v.k)).toEqual(['or']);
    expect(r.mapKey).toBeUndefined();
  });

  it('bo-primary: bo.borderRadius in BO_GEOMETRY, line 75, shared by the bo- styles that keep it', () => {
    const r = leafOf({ buttonStyle: 'bo-primary' });
    expect(r.value).toBe('8px');
    expect(r.leaf).toMatchObject({
      k: 'const',
      source: 'bo',
      path: ['borderRadius'],
      value: '8px',
    });
    expect(r.leaf.loc.line).toBe(75);
    expect(r.leaf.consts?.map((c) => c.name)).toEqual(['BO_GEOMETRY']);
    expect(r.via.map((v) => v.k)).toEqual(['or', 'map']);
    expect(r.mapKey).toBe('bo-primary');
    expect(r.sharedBy).toEqual([
      'bo-primary',
      'bo-secondary',
      'bo-text',
      'bo-delete',
      'bo-status',
    ]);
  });

  it("bo-picker: its own '999px', line 87", () => {
    const r = leafOf({ buttonStyle: 'bo-picker' });
    expect(r.leaf).toMatchObject({ k: 'literal', value: '999px' });
    expect(r.leaf.loc.line).toBe(87);
    expect(r.sharedBy).toEqual(['bo-picker']);
  });

  it('a borderRadius prop: the prop, line 342', () => {
    const r = leafOf({ buttonStyle: 'bo-primary', borderRadius: '5px' });
    expect(r.value).toBe('5px');
    expect(r.leaf).toMatchObject({ k: 'prop', name: 'borderRadius' });
    expect(r.leaf.loc.line).toBe(342);
  });
});

describe('readEval semantics', () => {
  const loc: Loc = { start: 0, end: 1, line: 1, col: 0, endLine: 1, endCol: 1 };
  const lit = (value: string): Read => ({ k: 'literal', value, loc });
  const prop = (name: string): Read => ({ k: 'prop', name, loc });
  const call: Read = { k: 'call', callee: 'darken', args: [], loc };

  it('follows || && ?? as JS does', () => {
    const or: Read = { k: 'or', items: [prop('a'), prop('b'), lit('x')], loc };
    expect(readEval(or, { b: 0 })).toMatchObject({ ok: true, value: 'x' });
    expect(readEval(or, { b: 'y' })).toMatchObject({ ok: true, value: 'y' });
    const nullish: Read = { k: 'nullish', items: [prop('a'), lit('x')], loc };
    expect(readEval(nullish, { a: 0 })).toMatchObject({ ok: true, value: 0 });
    const and: Read = { k: 'and', items: [prop('a'), lit('x')], loc };
    expect(readEval(and, { a: '' })).toMatchObject({ ok: true, value: '' });
  });

  it('an unevaluable || item is the leaf only when the rest cannot give the value', () => {
    const or: Read = { k: 'or', items: [prop('a'), call, lit('none')], loc };
    expect(readEval(or, {}, 'rgb(1, 2, 3)')).toMatchObject({
      ok: false,
      at: call,
      leafPosition: true,
    });
    expect(readEval(or, {}, 'none')).toMatchObject({
      ok: false,
      leafPosition: false,
    });
    expect(readEval(or, {})).toMatchObject({ ok: false, leafPosition: false });
    const last: Read = { k: 'or', items: [prop('a'), call], loc };
    expect(readEval(last, {})).toMatchObject({ ok: false, leafPosition: true });
  });

  it('does not compare a literal with a number or a boolean', () => {
    const sw: Read = {
      k: 'switch',
      on: prop('n'),
      cases: [{ value: '1', then: lit('one') }],
      default: lit('other'),
      loc,
    };
    expect(readEval(sw, { n: 1 })).toMatchObject({
      ok: false,
      leafPosition: false,
    });
    expect(readEval(sw, { n: '1' })).toMatchObject({ ok: true, value: 'one' });
    expect(readEval(sw, {})).toMatchObject({ ok: true, value: 'other' });
    const eq: Read = { k: 'eq', left: prop('n'), right: lit('1'), loc };
    expect(readEval(eq, { n: 1 })).toMatchObject({ ok: false });
    expect(readEval(eq, { n: '1' })).toMatchObject({ ok: true, value: true });
  });

  it('places each part of a concat in its value', () => {
    const concat: Read = {
      k: 'concat',
      parts: [
        { k: 'const', source: 'fontSizes', path: ['base'], value: '16', loc },
        lit('px'),
      ],
      loc,
    };
    const r = readEval(concat, {}) as EvalOk;
    expect(r.value).toBe('16px');
    expect(r.parts?.map((p) => [p.start, p.end])).toEqual([
      [0, 2],
      [2, 4],
    ]);
  });
});
