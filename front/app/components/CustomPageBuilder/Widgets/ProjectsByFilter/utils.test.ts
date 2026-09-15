import { hasTitle } from './utils';

describe('hasTitle', () => {
  it('is false when no heading has been written', () => {
    expect(hasTitle({}, 'en')).toBe(false);
    expect(hasTitle(undefined, 'en')).toBe(false);
  });

  // Otherwise a stray space would show the grid's homepage-phrased fallback heading.
  it('is false for a heading that is only whitespace', () => {
    expect(hasTitle({ en: '   ' }, 'en')).toBe(false);
  });

  it('is true once the visitor’s own locale carries a heading', () => {
    expect(hasTitle({ en: 'Projects', 'nl-BE': 'Projecten' }, 'en')).toBe(true);
  });

  // The grid falls straight back to its own message when the visitor's locale is missing, so a
  // heading written only in another locale has to leave the whole thing hidden.
  it('is false when only another locale carries a heading', () => {
    expect(hasTitle({ en: '', 'nl-BE': 'Projecten' }, 'en')).toBe(false);
    expect(hasTitle({ 'nl-BE': 'Projecten' }, 'en')).toBe(false);
  });
});
