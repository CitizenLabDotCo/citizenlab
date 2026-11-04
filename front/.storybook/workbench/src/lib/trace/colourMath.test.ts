// colourMathOn on the real Button's index (fixture.ts): line 146 is the
// primary fill, darkened at line 283 for the hover; line 147, the primary
// text colour, feeds a darken at line 304 that primary never reaches.
import { colourMathOn, colourMathWords } from './colourMath';
import { BUTTON, buttonFixture, FRONT, STYLE_UTILS } from './fixture';
import type { Read } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const values = require(`${FRONT}/${STYLE_UTILS}`);
const fx = buttonFixture(values);

const codeAt = (line: number, k: Read['k']) => {
  let found: Read | undefined;
  const visit = (r: unknown) => {
    if (!r || typeof r !== 'object' || found) return;
    const n = r as Read;
    if (n.k === k && n.loc?.line === line) found = n;
    for (const v of Object.values(r)) visit(v);
  };
  for (const t of fx.templates) for (const e of t.exprs) visit(e.read);
  if (!found) throw new Error(`no ${k} read at line ${line}`);
  return { file: BUTTON, start: found.loc.start, end: found.loc.end };
};

const context = (buttonStyle: string) => ({
  buttonStyle,
  theme: { colors: { tenantPrimary: '#163A7D' }, borderRadius: '3px' },
});

describe('colourMathOn', () => {
  it('primary fill: darken at line 283', () => {
    const m = colourMathOn(
      codeAt(146, 'theme'),
      fx.templates,
      [],
      context('primary')
    );
    expect(m).toEqual({ callee: 'darken', line: 283 });
    expect(m && colourMathWords(m)).toBe(
      'darken at line 283 works out another colour from it'
    );
  });

  it('primary text colour: its darken is never reached', () => {
    expect(
      colourMathOn(codeAt(147, 'literal'), fx.templates, [], context('primary'))
    ).toBeUndefined();
  });

  it('the radius: no colour maths', () => {
    expect(
      colourMathOn(codeAt(344, 'theme'), fx.templates, [], context('primary'))
    ).toBeUndefined();
  });

  it("another template's call counts, its context unknown", () => {
    expect(
      colourMathOn(codeAt(147, 'literal'), [], fx.templates, context('primary'))
    ).toEqual({ callee: 'darken', line: 304 });
  });
});
