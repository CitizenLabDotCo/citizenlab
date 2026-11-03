const EDGE_MARGIN = 20;
const MIN_HEIGHT = 120;

export interface PopoverPlacement {
  openUp: boolean;
  alignRight: boolean;
  maxHeight?: number;
}

const getVisibleBounds = (element: HTMLElement) => {
  let top = 0;
  let bottom = window.innerHeight;
  let right = window.innerWidth;

  for (
    let ancestor = element.parentElement;
    ancestor && ancestor !== document.body;
    ancestor = ancestor.parentElement
  ) {
    const { overflowX, overflowY } = getComputedStyle(ancestor);
    const rect = ancestor.getBoundingClientRect();
    if (overflowY !== 'visible') {
      const clientTop = rect.top + ancestor.clientTop;
      top = Math.max(top, clientTop);
      bottom = Math.min(bottom, clientTop + ancestor.clientHeight);
    }
    if (overflowX !== 'visible') {
      const clientLeft = rect.left + ancestor.clientLeft;
      right = Math.min(right, clientLeft + ancestor.clientWidth);
    }
  }

  return { top, bottom, right };
};

const getPopoverPlacement = (
  trigger: HTMLElement,
  popover: { height: number; width: number },
  gap: number
): PopoverPlacement => {
  const triggerRect = trigger.getBoundingClientRect();
  const bounds = getVisibleBounds(trigger);
  const spaceBelow = bounds.bottom - triggerRect.bottom - gap;
  const spaceAbove = triggerRect.top - bounds.top - gap;
  const fitsBelow = popover.height <= spaceBelow;
  const fitsAbove = popover.height <= spaceAbove;

  return {
    openUp: !fitsBelow && (fitsAbove || spaceAbove > spaceBelow),
    alignRight: triggerRect.left + popover.width > bounds.right - gap,
    maxHeight:
      fitsBelow || fitsAbove
        ? undefined
        : Math.max(Math.max(spaceAbove, spaceBelow) - EDGE_MARGIN, MIN_HEIGHT),
  };
};

export default getPopoverPlacement;
