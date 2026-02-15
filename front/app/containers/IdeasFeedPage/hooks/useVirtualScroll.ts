import { useCallback, useEffect, useRef, useState } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';

interface UseVirtualScrollParams {
  itemCount: number;
  peekHeight: number;
  overscan?: number;
  onHeightResize?: (centeredIndex: number) => void;
}

interface UseVirtualScrollReturn {
  parentRef: React.RefObject<HTMLDivElement>;
  virtualItems: ReturnType<
    ReturnType<typeof useVirtualizer>['getVirtualItems']
  >;
  getTotalSize: () => number;
  measureElement: (node: Element | null) => void;
  centeredIndex: number;
  itemHeight: number;
  handleScroll: (
    e: React.UIEvent<HTMLElement>,
    callbacks: {
      onIndexChange?: (index: number) => void;
      onNearEnd?: () => void;
    }
  ) => void;
}

const useVirtualScroll = ({
  itemCount,
  peekHeight,
  overscan = 2,
  onHeightResize,
}: UseVirtualScrollParams): UseVirtualScrollReturn => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [centeredIndex, setCenteredIndex] = useState(0);
  const centeredIndexRef = useRef(centeredIndex);

  useEffect(() => {
    centeredIndexRef.current = centeredIndex;
  }, [centeredIndex]);

  useEffect(() => {
    let previousHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      setWindowHeight(currentHeight);

      if (currentHeight !== previousHeight) {
        previousHeight = currentHeight;
        onHeightResize?.(centeredIndexRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onHeightResize]);

  const itemHeight = windowHeight - peekHeight;

  const { getVirtualItems, getTotalSize, measureElement } = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  const virtualItems = getVirtualItems();

  const handleScroll = useCallback(
    (
      e: React.UIEvent<HTMLElement>,
      callbacks: {
        onIndexChange?: (index: number) => void;
        onNearEnd?: () => void;
      }
    ) => {
      const scrollTop = e.currentTarget.scrollTop;
      const newIndex = Math.round(scrollTop / itemHeight);
      const ideasLength = itemCount - 1; // Subtract 1 for loader row

      if (
        newIndex >= 0 &&
        newIndex < ideasLength &&
        newIndex !== centeredIndex
      ) {
        setCenteredIndex(newIndex);
        callbacks.onIndexChange?.(newIndex);
      }

      // Check if near end
      if (virtualItems.length > 0) {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (lastItem.index >= ideasLength - 1) {
          callbacks.onNearEnd?.();
        }
      }
    },
    [itemHeight, itemCount, centeredIndex, virtualItems]
  );

  return {
    parentRef,
    virtualItems,
    getTotalSize,
    measureElement,
    centeredIndex,
    itemHeight,
    handleScroll,
  };
};

export default useVirtualScroll;
