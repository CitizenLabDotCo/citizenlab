import type { EvalOk } from './readEval';
import { drillTo } from './trace';
import type { Read } from './types';

const loc = { start: 0, end: 1, line: 1, col: 0, endLine: 1, endCol: 1 };
const leaf = (r: Partial<Read> & { k: Read['k'] }) => ({ loc, ...r } as Read);
const res = (value: unknown, l: Read, parts?: EvalOk['parts']): EvalOk => ({
  ok: true,
  value,
  leaf: l,
  via: [],
  ...(parts ? { parts } : {}),
});

// Text's bodyM line: `\n font-size: ${fontSize ? … : fontSizes.m}px;\n`
const m = res(16, leaf({ k: 'const', name: 'fontSizes.m' } as any));
const head = res('\n font-size: ', leaf({ k: 'literal', value: '' } as any));
const tail = res('px;\n', leaf({ k: 'literal', value: '' } as any));
const line = res(
  '\n font-size: 16px;\n',
  leaf({ k: 'concat', parts: [] } as any),
  [
    { start: 0, end: 13, result: head },
    { start: 13, end: 15, result: m },
    { start: 15, end: 19, result: tail },
  ]
);

describe('drillTo', () => {
  it('drills a value with its unit into the one expression, and says so', () => {
    expect(drillTo(line, 13, 17)).toEqual({ r: m, from: 0, to: 2, unit: true });
  });

  it('stays on a concat that is the whole value (`${fontSizes.base}px`)', () => {
    const whole = res('16px', leaf({ k: 'concat', parts: [] } as any), [
      { start: 0, end: 2, result: m },
      { start: 2, end: 4, result: tail },
    ]);
    expect(drillTo(whole, 0, 4)).toEqual({ r: whole, from: 0, to: 4 });
  });

  it('stays on the string when more than a unit follows', () => {
    expect(drillTo(line, 13, 18)).toEqual({ r: line, from: 13, to: 18 });
    expect(drillTo(line, 12, 17)).toEqual({ r: line, from: 12, to: 17 });
  });
});
