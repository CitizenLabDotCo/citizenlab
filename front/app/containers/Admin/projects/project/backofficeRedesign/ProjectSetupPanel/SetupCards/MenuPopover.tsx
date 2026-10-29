import React, {
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Box, bo, colors } from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';

const MENU_GAP = 4;
const FLYOUT_GAP = 8;
// Lines the flyout's first row up with its anchor row.
const FLYOUT_OFFSET = 7;
const VIEWPORT_MARGIN = 8;

interface Position {
  top: number;
  left: number;
  width?: number;
}

const ITEM_SELECTOR = '[role^="menuitem"]';

export const focusAnchor = (anchor: HTMLElement | null) => {
  const target = anchor?.matches('button')
    ? anchor
    : anchor?.querySelector('button');
  target?.focus();
};

const getNextIndex = (key: string, current: number, count: number) => {
  switch (key) {
    case 'ArrowDown':
      return (current + 1) % count;
    case 'ArrowUp':
      return current <= 0 ? count - 1 : current - 1;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return undefined;
  }
};

const getPosition = (rect: DOMRect, placement: 'below' | 'right'): Position =>
  placement === 'below'
    ? { top: rect.bottom + MENU_GAP, left: rect.left, width: rect.width }
    : { top: rect.top - FLYOUT_OFFSET, left: rect.right + FLYOUT_GAP };

interface Props {
  anchorRef: RefObject<HTMLElement>;
  placement: 'below' | 'right';
  width?: string;
  maxHeight?: string;
  onClose?: () => void;
  onBack?: () => void;
  autoFocus?: boolean;
  children: ReactNode;
}

const MenuPopover = ({
  anchorRef,
  placement,
  width,
  maxHeight = 'min(440px, 62vh)',
  onClose,
  onBack,
  autoFocus = false,
  children,
}: Props) => {
  const [position, setPosition] = useState<Position>();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const place = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (rect) setPosition(getPosition(rect, placement));
    };

    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [anchorRef, placement]);

  useLayoutEffect(() => {
    const popover = popoverRef.current;
    const anchor = anchorRef.current;
    if (!popover || !anchor || !position) return;

    const height = popover.offsetHeight;
    const maxTop = window.innerHeight - height - VIEWPORT_MARGIN;
    if (position.top <= maxTop) return;

    const above = anchor.getBoundingClientRect().top - height - MENU_GAP;
    const top =
      placement === 'below' && above >= VIEWPORT_MARGIN
        ? above
        : Math.max(VIEWPORT_MARGIN, maxTop);
    if (top !== position.top) setPosition({ ...position, top });
  }, [anchorRef, placement, position]);

  const placed = !!position;
  useEffect(() => {
    if (!autoFocus || !placed) return;
    popoverRef.current
      ?.querySelector<HTMLElement>(ITEM_SELECTOR)
      ?.focus({ preventScroll: true });
  }, [autoFocus, placed]);

  useEffect(() => {
    if (!onClose) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-menu-portal]')) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab closes too: the menu sits at the end of the page's tab order.
      if (event.key !== 'Escape' && event.key !== 'Tab') return;
      event.preventDefault();
      onClose();
      focusAnchor(anchorRef.current);
    };

    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [anchorRef, onClose]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (onBack && (event.key === 'Escape' || event.key === 'ArrowLeft')) {
      event.preventDefault();
      event.stopPropagation();
      onBack();
      return;
    }

    const items = Array.from(
      popoverRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []
    );
    if (items.length === 0) return;
    const current = items.findIndex((item) =>
      item.contains(document.activeElement)
    );
    const next = getNextIndex(event.key, current, items.length);
    if (next === undefined) return;

    event.preventDefault();
    items[next].focus();
  };

  if (!position) return null;

  // On the page body so the scrolling panel can't clip it; data-menu-portal
  // marks it as inside for the outside-click check.
  return createPortal(
    <Box
      ref={popoverRef}
      data-menu-portal
      role="menu"
      onKeyDown={handleKeyDown}
      position="fixed"
      top={`${position.top}px`}
      left={`${position.left}px`}
      width={position.width ? `${position.width}px` : width}
      zIndex="1002"
      maxHeight={maxHeight}
      overflowY="auto"
      p="6px"
      background={colors.white}
      border={`1px solid ${colors.grey300}`}
      borderRadius={bo.panelBorderRadius}
    >
      {children}
    </Box>,
    document.body
  );
};

export default MenuPopover;
