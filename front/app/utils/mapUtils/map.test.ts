import { calculateScaleFromZoom, getMapZoom, zoomToScale } from './map';

describe('calculateScaleFromZoom', () => {
  it('returns correct scale for known zoom level', () => {
    expect(calculateScaleFromZoom(0)).toBe(zoomToScale[0]);
    expect(calculateScaleFromZoom(12)).toBe(zoomToScale[12]);
  });

  it('returns default of 18 for unknown zoom levels', () => {
    expect(calculateScaleFromZoom(-1)).toBe(zoomToScale[18]);
    expect(calculateScaleFromZoom(99)).toBe(zoomToScale[18]);
  });
});

describe('getMapZoom', () => {
  it('returns the input zoom (mapZoom argument) if greater than 0', () => {
    expect(getMapZoom(5, 100000)).toBe('5');
  });

  it('returns the closest zoom level based on scale when zoom is 0', () => {
    // Should match zoom level 12 (scale ~144447.638572)
    expect(getMapZoom(0, 144447.638572)).toBe('12');

    // Should match zoom level 6 (scale ~9244648.868618)
    expect(getMapZoom(0, 9000000)).toBe('6');
  });

  it('returns zoom level 0 when scale is extremely high', () => {
    expect(getMapZoom(0, 999999999)).toBe('0');
  });

  it('returns zoom level 23 when scale is extremely low', () => {
    expect(getMapZoom(0, 10)).toBe('23');
  });

  it('still returns the closest zoom level when near a midpoint', () => {
    // Slightly closer to zoom 13 than 12
    const scaleBetween = (zoomToScale[12] + zoomToScale[13]) / 2 - 100;
    expect(getMapZoom(0, scaleBetween)).toBe('13');
  });
});
