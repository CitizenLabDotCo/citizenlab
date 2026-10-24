import { paramOf, storyHash } from './hash';

describe('story hashes', () => {
  it('reads a parameter', () => {
    expect(paramOf('#/components/c--d?state=hover&o=x', 'state')).toBe(
      'hover'
    );
    expect(paramOf('#/components/c--d', 'state')).toBeNull();
  });

  it('writes a story hash without the empty parameters', () => {
    expect(storyHash('components', 'c--d')).toBe('#/components/c--d');
    expect(storyHash('patterns', 'c--d', { state: 'x', other: null })).toBe(
      '#/patterns/c--d?state=x'
    );
  });
});
