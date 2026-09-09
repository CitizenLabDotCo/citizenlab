import { hasTitle } from './utils';

describe('hasTitle', () => {
  it('is false when no heading has been written', () => {
    expect(hasTitle({})).toBe(false);
    expect(hasTitle(undefined)).toBe(false);
  });

  // Otherwise a stray space would show the grid's homepage-phrased fallback heading.
  it('is false for a heading that is only whitespace', () => {
    expect(hasTitle({ en: '   ' })).toBe(false);
  });

  it('is true once any locale carries a heading', () => {
    expect(hasTitle({ en: '', 'nl-BE': 'Projecten' })).toBe(true);
  });
});
