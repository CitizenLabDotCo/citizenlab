import { Placement } from '@craftjs/core';

export const INDICATOR_THICKNESS = 4;

export type IndicatorRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  vertical: boolean;
};

// A canvas laying its children out side by side needs a vertical bar between
// two columns rather than a horizontal one between two rows.
const stacksHorizontally = (element: HTMLElement) => {
  const parent = element.parentElement;
  if (!parent) return false;

  const { display, flexDirection } = window.getComputedStyle(parent);

  if (display === 'grid' || display === 'inline-grid') return true;

  return (
    (display === 'flex' || display === 'inline-flex') &&
    flexDirection.startsWith('row')
  );
};

// Mirrors craft.js' own movePlaceholder, which we cannot import: it lives in
// @craftjs/utils, which is not one of our direct dependencies.
const getIndicatorRect = (placement: Placement): IndicatorRect | null => {
  const target = placement.currentNode?.dom;

  if (target) {
    const rect = target.getBoundingClientRect();

    if (stacksHorizontally(target)) {
      return {
        top: rect.top,
        left:
          (placement.where === 'before' ? rect.left : rect.right) -
          INDICATOR_THICKNESS / 2,
        width: INDICATOR_THICKNESS,
        height: rect.height,
        vertical: true,
      };
    }

    return {
      // Straddle the boundary between the two widgets instead of biting into
      // the one that follows it.
      top:
        (placement.where === 'before' ? rect.top : rect.bottom) -
        INDICATOR_THICKNESS / 2,
      left: rect.left,
      width: rect.width,
      height: INDICATOR_THICKNESS,
      vertical: false,
    };
  }

  const parentDom = placement.parent.dom;
  if (!parentDom) return null;

  // Empty canvas: the bar sits at the top of the parent's content box.
  const rect = parentDom.getBoundingClientRect();
  const { paddingTop, paddingLeft, paddingRight } =
    window.getComputedStyle(parentDom);

  return {
    top: rect.top + parseFloat(paddingTop),
    left: rect.left + parseFloat(paddingLeft),
    width: rect.width - parseFloat(paddingLeft) - parseFloat(paddingRight),
    height: INDICATOR_THICKNESS,
    vertical: false,
  };
};

export default getIndicatorRect;
