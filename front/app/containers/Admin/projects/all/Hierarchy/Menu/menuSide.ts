// The side a menu's dropdown is pinned to, so its edge lines up with its
// button's. The shared dropdown swaps its sides in right-to-left languages,
// but the back office layout isn't mirrored: swapping them back keeps the menu
// under its button.
export const getMenuSide = (align: 'left' | 'right', isRtl: boolean) => {
  if (!isRtl) return align;
  return align === 'right' ? 'left' : 'right';
};

export const FLYOUT_WIDTH = 240;
export const FLYOUT_GAP = 4;
// Kept between a flyout and the edges of the window.
export const WINDOW_MARGIN = 16;

// The side of its menu a flyout opens on, as in the prototype: the right where
// the window has room for it, else the left, as for a "⋯" at the right of the
// page.
export const getFlyoutSide = (menuRight: number, windowWidth: number) =>
  menuRight + FLYOUT_GAP + FLYOUT_WIDTH <= windowWidth - WINDOW_MARGIN
    ? 'right'
    : 'left';
