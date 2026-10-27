import { fnv1a32 } from './hash';

describe('fnv1a32', () => {
  it('matches the index builder on its pinned values', () => {
    expect(fnv1a32('')).toBe('811c9dc5');
    expect(fnv1a32('a')).toBe('e40c292c');
  });
});
