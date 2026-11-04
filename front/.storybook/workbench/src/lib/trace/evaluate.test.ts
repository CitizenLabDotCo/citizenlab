import { alignRules } from './align';
import {
  flatten,
  flattenRules,
  flattenWithOrigins,
  splitString,
  textOf,
} from './evaluate';
import { buttonFixture, FRONT, buttonRenderer, STYLE_UTILS } from './fixture';
import { execContext } from './internals';
import type { Context } from './internals';
import type { Loc, Read, Template } from './types';

const renderButton = buttonRenderer();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const values = require(`${FRONT}/${STYLE_UTILS}`);
const fx = buttonFixture(values);

// What getButtonStyle returned on this render: the Container's rule 5
// (`${(props) => getButtonStyle(props)}`) run with its own context.
const runtimeOf = (props: Record<string, unknown>) => {
  const b = renderButton(props);
  const context = execContext(b.fiber) as Context;
  const fn = b.style.rules[5] as (c: Context) => unknown;
  return { ...b, context, result: fn(context) as string };
};

describe('the string template split (getButtonStyle, lines 400-517)', () => {
  it.each([
    ['primary', '3px', '9px 18px', '16px'],
    ['bo-primary', '8px', '0 16px', '14px'],
  ])('%s', (buttonStyle, radius, padding, fontSize) => {
    const { context, result } = runtimeOf({ buttonStyle });
    const t = fx.string;
    expect(t.loc.line).toBe(400);
    expect(t.exprs).toHaveLength(64);
    const split = splitString(t, result, context);
    // The styled components and the helpers (isRtl, focusRing) do not
    // evaluate from the index, so the split is the pinned regex.
    expect(split).toMatchObject({ ok: true, method: 'regex' });
    if (!split.ok) return;
    expect(t.quasis.map((q, k) => q + (split.values[k] ?? '')).join('')).toBe(
      result
    );
    expect(split.values[8]).toBe(radius);
    expect(split.values[14]).toBe(padding);
    expect(split.values[34]).toBe(fontSize);
    expect(split.values[31]).toMatch(/^\.sc-/);
    expect(split.values.slice(15, 31)).toEqual(Array(16).fill(''));
  });
});

describe('splitString on small templates', () => {
  const loc: Loc = { start: 0, end: 1, line: 1, col: 0, endLine: 1, endCol: 1 };
  const template = (quasis: string[], reads: Read[]): Template => ({
    id: 'x:1:0',
    file: 'x',
    loc,
    kind: 'string',
    quasis,
    exprs: reads.map((read) => ({ loc, text: '', shape: 'unknown', read })),
    decls: [],
  });
  const lit = (value: string): Read => ({ k: 'literal', value, loc });
  const unknown: Read = { k: 'unknown', text: 'f()', loc };

  it('evaluates every expression when it can', () => {
    const t = template(['a: ', '; b: ', ';'], [lit('1'), lit('2')]);
    expect(splitString(t, 'a: 1; b: 2;', {})).toEqual({
      ok: true,
      method: 'eval',
      values: ['1', '2'],
    });
  });

  it('pins a value that holds the next quasi, so the split is still unique', () => {
    const t = template(['a: ', '; b: ', ';'], [lit('x; b: y'), unknown]);
    expect(splitString(t, 'a: x; b: y; b: z;', {})).toEqual({
      ok: true,
      method: 'regex',
      values: ['x; b: y', 'z'],
    });
  });

  it('gives up when two splits fit', () => {
    const t = template(['a: ', '; b: ', ';'], [unknown, unknown]);
    expect(splitString(t, 'a: x; b: y; b: z;', {})).toEqual({ ok: false });
  });
});

describe('flatten, copied from 5.3.9', () => {
  it('writes a style object as css() does', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { css } = require('styled-components');
    const obj = {
      fontSize: 12,
      lineHeight: 1.5,
      margin: 0,
      paddingTop: '',
      msFlex: 1,
      '&:hover': { color: 'red', zIndex: 2 },
    };
    expect(textOf(flatten(obj, {}))).toBe(css(obj).join(''));
  });

  it('calls functions with the context and drops falsish values', () => {
    const rules = [
      'a: ',
      (c: Context) => c.x,
      ';',
      false,
      (c: Context) => [c.y, null, 'z'],
    ];
    const nodes = flattenRules(rules, { x: 1, y: 'w' });
    expect(nodes.map((n) => (n ? textOf(n) : undefined))).toEqual([
      'a: ',
      '1',
      ';',
      undefined,
      'wz',
    ]);
  });
});

describe('flattenWithOrigins on the Container', () => {
  it('labels the radius with expression 8 of the string template, through line 561', async () => {
    const { style, context } = runtimeOf({ buttonStyle: 'primary' });
    const client = fx.client();
    await client.load(fx.container.id);
    const alignment = alignRules(style.rules, fx.container, client.get);
    expect(alignment).toBeDefined();
    if (!alignment) return;
    const pieces = await flattenWithOrigins(
      style.rules,
      context,
      alignment,
      client
    );
    expect(pieces.map((p) => p.text).join('')).toBe(
      flattenRules(style.rules, context)
        .map((n) => (n ? textOf(n) : ''))
        .join('')
    );
    const radius = pieces.find(
      (p) =>
        p.origin?.kind === 'expr' &&
        p.origin.template.id === fx.string.id &&
        p.origin.k === 8
    );
    expect(radius?.text).toBe('3px');
    expect(
      radius?.origin?.path.map((h) => [
        h.template.name,
        h.template.exprs[h.expr].loc.line,
      ])
    ).toEqual([['Container', 561]]);
  });
});
