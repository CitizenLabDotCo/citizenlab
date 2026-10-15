import { getMenuSide } from './menuSide';

describe('getMenuSide', () => {
  it('keeps the side in left-to-right languages', () => {
    expect(getMenuSide('right', false)).toBe('right');
    expect(getMenuSide('left', false)).toBe('left');
  });

  it('swaps it in right-to-left ones, which the dropdown swaps back', () => {
    expect(getMenuSide('right', true)).toBe('left');
    expect(getMenuSide('left', true)).toBe('right');
  });
});
