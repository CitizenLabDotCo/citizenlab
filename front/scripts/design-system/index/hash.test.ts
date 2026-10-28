import { fnv1a32 } from './hash';

describe('fnv1a32', () => {
  it('matches the reference vectors', () => {
    expect(fnv1a32('')).toBe('811c9dc5');
    expect(fnv1a32('a')).toBe('e40c292c');
    expect(fnv1a32('foobar')).toBe('bf9cf968');
  });
});
