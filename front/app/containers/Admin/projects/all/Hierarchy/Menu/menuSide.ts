// The side a menu's dropdown is pinned to, so its edge lines up with its
// button's. The shared dropdown swaps its sides in right-to-left languages,
// but the back office layout isn't mirrored: swapping them back keeps the menu
// under its button.
export const getMenuSide = (align: 'left' | 'right', isRtl: boolean) => {
  if (!isRtl) return align;
  return align === 'right' ? 'left' : 'right';
};
