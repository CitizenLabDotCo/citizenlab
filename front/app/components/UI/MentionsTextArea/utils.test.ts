import { extractIdsFromValue } from './utils';

describe('extractIdsFromValue', () => {
  it('should extract ids from a string with mentions', () => {
    const value =
      '@[Chalie Charles](57d377ec-21bd-4c7d-9643-5b1bb9923e3a) @[hjkdsd fdsbfjksd](b29ed97d-eeae-4c55-abc2-66e354cfde0a) @h';
    const ids = extractIdsFromValue(value);

    expect(ids).toEqual([
      '57d377ec-21bd-4c7d-9643-5b1bb9923e3a',
      'b29ed97d-eeae-4c55-abc2-66e354cfde0a',
    ]);
  });

  it('should handle a string with no mentions', () => {
    const ids = extractIdsFromValue('This is a test without mentions.');

    expect(ids).toEqual([]);
  });

  it('should handle an empty string', () => {
    const ids = extractIdsFromValue('');

    expect(ids).toEqual([]);
  });
});
