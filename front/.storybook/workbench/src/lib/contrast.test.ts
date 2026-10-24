import fs from 'fs';
import path from 'path';

import {
  checkPair,
  parseTokenCss,
  passes,
  ratio,
  resolveTokens,
  toConcreteColour,
} from './contrast';

const css = fs.readFileSync(
  path.resolve(__dirname, '../../../../app/design-system/tokens/tokens.css'),
  'utf8'
);

describe('ratio and passes', () => {
  it('black on white is 21', () => {
    expect(ratio('#000', '#fff')).toBe(21);
    expect(ratio('#fff', '#000')).toBe(21);
  });

  it('#767676 on white is about 4.54 and passes AA for normal text', () => {
    const r = ratio('#767676', '#fff');
    expect(r).toBeCloseTo(4.54, 2);
    expect(passes(r, { large: false }).aa).toBe(true);
    expect(passes(r, { large: false }).aaa).toBe(false);
  });

  // The plan expected #999999 to pass for large text; it is 2.84:1, under
  // the 3:1 large-text minimum, so it fails both. #949494 (3.03:1) is the
  // grey that fails normal text and passes large text.
  it('#999999 on white fails AA, normal and large', () => {
    const r = ratio('#999999', '#ffffff');
    expect(r).toBeCloseTo(2.84, 2);
    expect(passes(r, { large: false }).aa).toBe(false);
    expect(passes(r, { large: true }).aa).toBe(false);
  });

  it('#949494 on white fails AA normal and passes AA large', () => {
    const r = ratio('#949494', '#ffffff');
    expect(passes(r, { large: false }).aa).toBe(false);
    expect(passes(r, { large: true }).aa).toBe(true);
  });

  it('reads rgb() and composites translucent colours', () => {
    expect(ratio('rgb(0, 0, 0)', 'rgb(255,255,255)')).toBe(21);
    // 87% black on white is darker than #333 but lighter than black.
    const r = ratio('rgba(0,0,0,0.87)', '#fff');
    expect(r).toBeGreaterThan(ratio('#333333', '#fff'));
    expect(r).toBeLessThan(21);
    // A transparent background is white.
    expect(ratio('#000', 'rgba(0,0,0,0)')).toBe(21);
  });

  it('never rounds a failing ratio up to a pass', () => {
    // #777777 on white is 4.478...
    expect(ratio('#777777', '#fff')).toBe(4.47);
    expect(passes(4.49, { large: false }).aa).toBe(false);
  });

  it('is NaN for unreadable colours', () => {
    expect(ratio('red', '#fff')).toBeNaN();
  });
});

describe('token resolution', () => {
  const defs = parseTokenCss(css);

  it('reads the :root block of tokens.css', () => {
    expect(Object.keys(defs).length).toBeGreaterThan(150);
    expect(defs['--gv-text-primary']).toBe('var(--gv-grey-800)');
  });

  it('follows var() chains and tenant fallbacks', () => {
    const r = resolveTokens(defs);
    expect(r['--gv-text-primary']).toBe('#333333');
    expect(r['--gv-color-tenant-primary']).toBe('#ef0071');
    expect(r['--gv-color-text-heading']).toBe('#333333');
  });

  it('applies overrides to every reader', () => {
    const r = resolveTokens(defs, { '--gv-grey-800': '#111111' });
    expect(r['--gv-text-primary']).toBe('#111111');
  });

  it('falls back when a var() target is missing, empty on a cycle', () => {
    const r = resolveTokens({
      '--gv-a': 'var(--gv-missing, 4px)',
      '--gv-b': 'var(--gv-c)',
      '--gv-c': 'var(--gv-b)',
      '--gv-d': 'var(--gv-b, #fff)',
    });
    expect(r['--gv-a']).toBe('4px');
    expect(r['--gv-b']).toBe('');
    // A defined but invalid target uses the fallback, as the browser does.
    expect(r['--gv-d']).toBe('#fff');
  });

  it('turns color-mix with transparent into a translucent colour', () => {
    expect(
      toConcreteColour('color-mix(in srgb, #ef0071 25%, transparent)')
    ).toBe('rgba(239, 0, 113, 0.25)');
    expect(
      toConcreteColour('color-mix(in oklch, #044D6C 10%, transparent)')
    ).toBe('rgba(4, 77, 108, 0.1)');
    expect(toConcreteColour('#fff')).toBe('#fff');
    expect(toConcreteColour('nonsense')).toBeNull();
  });
});

describe('checkPair', () => {
  const defs = parseTokenCss(css);
  const base = resolveTokens(defs);

  it('passes text-primary on white', () => {
    const c = checkPair('--gv-text-primary', '--gv-white', base, base);
    expect(c.aa).toBe(true);
    expect(c.broken).toBe(false);
  });

  it('flags a pair an override breaks', () => {
    const current = resolveTokens(defs, { '--gv-grey-800': '#dddddd' });
    const c = checkPair(
      '--gv-text-primary',
      '--gv-white',
      base,
      current
    );
    expect(c.aa).toBe(false);
    expect(c.baseRatio).toBeGreaterThan(4.5);
    expect(c.broken).toBe(true);
  });

  it('does not flag a pair that already failed', () => {
    const current = resolveTokens(defs, { '--gv-grey-600': '#eeeeee' });
    const c = checkPair(
      '--gv-placeholder',
      '--gv-white',
      base,
      current
    );
    // #999999 on white fails normal and large text before the edit.
    expect(passes(c.baseRatio, { large: true }).aa).toBe(false);
    expect(c.aa).toBe(false);
    expect(c.broken).toBe(false);
  });
});
