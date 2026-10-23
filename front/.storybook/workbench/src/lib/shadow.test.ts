import { formatShadow, parseShadow, sameShadow, ShadowLayer } from './shadow';

const layer = (over: Partial<ShadowLayer>): ShadowLayer => ({
  inset: false,
  x: 0,
  y: 0,
  blur: 0,
  spread: 0,
  color: '#000000',
  alpha: 100,
  ...over,
});

describe('parseShadow', () => {
  it('reads a token shadow, rgba as hex and opacity', () => {
    expect(parseShadow('0px 2px 4px -1px rgba(0,0,0,0.06)')).toEqual([
      layer({ y: 2, blur: 4, spread: -1, alpha: 6 }),
    ]);
  });

  it('reads several layers and inset, in any keyword order', () => {
    expect(
      parseShadow('inset 0 1px 2px #ff000080, 0 0 0 3px rgba(214, 22, 7, 0.35)')
    ).toEqual([
      layer({ inset: true, y: 1, blur: 2, color: '#ff0000', alpha: 50.1961 }),
      layer({ spread: 3, color: '#d61607', alpha: 35 }),
    ]);
    expect(parseShadow('#fff 0 2px inset')).toEqual([
      layer({ inset: true, y: 2, color: '#ffffff' }),
    ]);
  });

  it('defaults an omitted blur and spread to 0', () => {
    expect(parseShadow('1px 2px #333')).toEqual([
      layer({ x: 1, y: 2, color: '#333333' }),
    ]);
    expect(parseShadow('1px 2px 3px #333')).toEqual([
      layer({ x: 1, y: 2, blur: 3, color: '#333333' }),
    ]);
  });

  it('reads none as no layer', () => {
    expect(parseShadow('none')).toEqual([]);
    expect(formatShadow([])).toBe('none');
  });

  it('falls back (null) on what the fields cannot show', () => {
    expect(parseShadow('0 0 0 var(--gv-focus-offset) #fff')).toBeNull();
    expect(parseShadow('0 2px 4px var(--gv-black)')).toBeNull();
    expect(parseShadow('0 0.5rem 1rem #000')).toBeNull();
    expect(parseShadow('0 2px 4px')).toBeNull();
    expect(parseShadow('0 2px 4px red')).toBeNull();
    expect(parseShadow('0 2px -4px #000')).toBeNull();
    expect(parseShadow('0 2px #000 4px')).toBeNull();
    expect(parseShadow('1 2px #000')).toBeNull();
    expect(parseShadow('0 2px 4px rgba(0,0,0')).toBeNull();
  });
});

describe('formatShadow', () => {
  it('writes hex when opaque and rgba() else', () => {
    expect(
      formatShadow([
        layer({ y: 2, blur: 4, spread: -1, alpha: 6 }),
        layer({ inset: true, spread: 2, color: '#ffffff' }),
      ])
    ).toBe('0 2px 4px -1px rgba(0,0,0,0.06), inset 0 0 0 2px #ffffff');
  });

  it('round-trips every shape it reads', () => {
    [
      '0px 2px 4px -1px rgba(0,0,0,0.06)',
      '0 0 0 3px rgba(214,22,7,0.35)',
      '0 0 0 2px #fff',
      '-2px 0px 1px 0px rgba(0,0,0,0.06)',
      'inset 0 1px 2px #ff000080, 0px 4px 12px -1px rgba(0,0,0,0.12)',
      '1px 2px #333',
    ].forEach((value) => {
      const layers = parseShadow(value);
      expect(layers).not.toBeNull();
      const written = formatShadow(layers as ShadowLayer[]);
      expect(parseShadow(written)).toEqual(layers);
      expect(formatShadow(parseShadow(written) as ShadowLayer[])).toBe(written);
    });
  });
});

describe('opacity precision', () => {
  it('keeps the opacity it parsed when another field changes', () => {
    const [l] = parseShadow('0 2px 4px rgba(0,0,0,0.0625)') as ShadowLayer[];
    expect(l.alpha).toBe(6.25);
    expect(formatShadow([{ ...l, x: 1 }])).toBe(
      '1px 2px 4px 0 rgba(0,0,0,0.0625)'
    );
  });
});

describe('sameShadow', () => {
  it('reads 0px as 0 and rgba as its hex', () => {
    expect(
      sameShadow('0px 2px 4px -1px rgba(0,0,0,1)', '0 2px 4px -1px #000')
    ).toBe(true);
    expect(sameShadow('0 2px 4px #000', '0 2px 5px #000')).toBe(false);
    expect(sameShadow('0 0 0 var(--gv-x) #fff', '0 0 0 var(--gv-x) #fff')).toBe(
      false
    );
  });
});
