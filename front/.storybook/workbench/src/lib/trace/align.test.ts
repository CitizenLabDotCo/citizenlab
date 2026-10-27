import { alignOutcome, alignRules, lookupKeys } from './align';
import { buttonFixture, FRONT, buttonRenderer, STYLE_UTILS } from './fixture';
import type { Expr, Loc, Read, Template } from './types';

const renderButton = buttonRenderer();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const values = require(`${FRONT}/${STYLE_UTILS}`);
const fx = buttonFixture(values);

describe('alignRules on the Button Container (lines 548-570)', () => {
  it("places each of the 11 rules of the Container's componentStyle", () => {
    const { style } = renderButton({ buttonStyle: 'primary' });
    expect(style.rules).toHaveLength(11);
    const a = alignRules(style.rules, fx.container, () => undefined);
    expect(a?.template).toBe(fx.container);
    expect(
      a?.slots.map((s) => (s.kind === 'quasi' ? `q${s.k}` : `e${s.k}`))
    ).toEqual([
      'q0',
      'e0',
      'q1',
      'e1',
      'q2',
      'e2',
      'q3',
      'e3',
      'q4',
      'e4',
      'q5',
    ]);
  });

  it('does not align with another template', () => {
    const { style } = renderButton({ buttonStyle: 'primary' });
    expect(alignOutcome(style.rules, fx.string, () => undefined)).toEqual({
      ok: false,
      why: 'no-match',
    });
  });
});

describe('alignOutcome', () => {
  const loc: Loc = { start: 0, end: 1, line: 1, col: 0, endLine: 1, endCol: 1 };
  const read: Read = { k: 'unknown', text: 'x', loc };
  const expr = (e: Partial<Expr>): Expr => ({
    loc,
    text: 'x',
    shape: 'unknown',
    read,
    ...e,
  });
  const template = (
    id: string,
    quasis: string[],
    exprs: Expr[],
    kind: Template['kind'] = 'styled'
  ): Template => ({
    id,
    file: 'f.tsx',
    loc,
    kind,
    quasis,
    exprs,
    decls: [],
  });

  it("takes css()'s shortcut for a template with no holes", () => {
    const t = template('t', ['color: red;'], []);
    expect(alignOutcome(['color: red;'], t, () => undefined)).toMatchObject({
      ok: true,
    });
  });

  it('refuses a template the rules fit two ways', () => {
    const t = template('t', ['a', '', 'b'], [expr({}), expr({})]);
    expect(alignOutcome(['a', 'x', 'b'], t, () => undefined)).toEqual({
      ok: false,
      why: 'ambiguous',
    });
  });

  it('drops a static empty value and inlines a css template', () => {
    const inner = template(
      'i',
      ['color: ', ';'],
      [expr({ shape: 'fn' })],
      'css'
    );
    const t = template(
      't',
      ['a', '', 'b'],
      [expr({ shape: 'value', value: '' }), expr({ shape: 'css', css: 'i' })]
    );
    const fn = () => 'red';
    const a = alignRules(['a', 'color: ', fn, 'b'], t, (id) =>
      id === 'i' ? inner : undefined
    );
    expect(a).toBeUndefined();
    const b = alignRules(['a', 'color: ', fn, ';', 'b'], t, (id) =>
      id === 'i' ? inner : undefined
    );
    expect(
      b?.slots.map((s) => [s.template.id, s.kind, s.k, s.path.length])
    ).toEqual([
      ['t', 'quasi', 0, 0],
      ['i', 'quasi', 0, 1],
      ['i', 'expr', 0, 1],
      ['i', 'quasi', 1, 1],
      ['t', 'quasi', 2, 0],
    ]);
  });

  it("aligns a helper's wrapper and remembers the call site for its function", () => {
    const wrapper = template(
      'w',
      ['\n  ', '\n'],
      [expr({ shape: 'fn' })],
      'css'
    );
    const site = template('s', ['text-align: right;'], [], 'css');
    const t = template(
      't',
      ['a', 'b'],
      [expr({ shape: 'helper', wrapper: 'w', slot: 's' })]
    );
    const fn = () => '';
    const a = alignRules(['a', '\n  ', fn, '\n', 'b'], t, (id) =>
      id === 'w' ? wrapper : id === 's' ? site : undefined
    );
    expect(a?.slots[2]).toMatchObject({ kind: 'expr', k: 0, slot: 's' });
  });

  it('looks up the first 30 string entries', () => {
    const rules = Array.from({ length: 40 }, (_, i) =>
      i % 2 ? () => i : `s${i}`
    );
    expect(lookupKeys(rules)).toHaveLength(20);
    expect(
      lookupKeys(Array.from({ length: 40 }, (_, i) => `s${i}`))
    ).toHaveLength(30);
  });
});
