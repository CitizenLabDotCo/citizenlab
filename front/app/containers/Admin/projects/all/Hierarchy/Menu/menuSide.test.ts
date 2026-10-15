import { getFlyoutSide, getMenuSide } from './menuSide';

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

describe('getFlyoutSide', () => {
  it('opens on the right where the window has room', () => {
    expect(getFlyoutSide(380, 1024)).toBe('right');
  });

  it('opens on the left of a menu near the right edge', () => {
    expect(getFlyoutSide(955, 1024)).toBe('left');
  });
});
