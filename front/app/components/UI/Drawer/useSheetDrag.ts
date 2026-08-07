import { useRef, useState } from 'react';

const SWIPE_THRESHOLD = 50;

type UseSheetDragParams = {
  clampOffset: (delta: number) => number;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
};

const useSheetDrag = ({
  clampOffset,
  onSwipeUp,
  onSwipeDown,
  onTap,
}: UseSheetDragParams) => {
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const hasDragged = useRef(false);
  // Touch interactions also fire synthetic mouse events — dedupe them.
  const touchHandled = useRef(false);

  const handleDragStart = (y: number) => {
    dragStartY.current = y;
    hasDragged.current = false;
  };

  const handleDragMove = (currentY: number) => {
    if (dragStartY.current === null) return;

    hasDragged.current = true;
    setDragOffset(clampOffset(currentY - dragStartY.current));
  };

  const handleDragEnd = (endY: number) => {
    if (dragStartY.current === null) return;

    const delta = endY - dragStartY.current;
    const hadDragged = hasDragged.current;

    setDragOffset(null);
    dragStartY.current = null;
    hasDragged.current = false;

    if (hadDragged && Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta < 0) {
        onSwipeUp?.();
      } else {
        onSwipeDown?.();
      }
    } else if (!hadDragged) {
      onTap?.();
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchHandled.current = true;
    handleDragStart(e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) =>
    handleDragMove(e.touches[0].clientY);
  const onTouchEnd = (e: React.TouchEvent) =>
    handleDragEnd(e.changedTouches[0].clientY);

  const onMouseDown = (e: React.MouseEvent) => {
    if (touchHandled.current) {
      touchHandled.current = false;
      return;
    }
    e.preventDefault();
    handleDragStart(e.clientY);

    const onMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
    const onUp = (ev: MouseEvent) => {
      handleDragEnd(ev.clientY);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return {
    dragOffset,
    isDragging: dragOffset !== null,
    dragHandlers: { onTouchStart, onTouchMove, onTouchEnd, onMouseDown },
  };
};

export default useSheetDrag;
