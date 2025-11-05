import { useState, useMemo } from 'react';

interface UseSeeMoreReturn<T> {
  visibleItems: T[];
  showSeeMore: boolean;
  seeMore: boolean;
  toggleSeeMore: () => void;
  hiddenCount: number;
}

export function useSeeMore<T>(
  items: T[],
  itemLimit: number = 12
): UseSeeMoreReturn<T> {
  const [seeMore, setSeeMore] = useState(false);

  const visibleItems = useMemo(
    () => (seeMore ? items : items.slice(0, itemLimit)),
    [items, seeMore, itemLimit]
  );

  const showSeeMore = items.length > itemLimit;
  const hiddenCount = items.length - itemLimit;
  const toggleSeeMore = () => setSeeMore(!seeMore);

  return {
    visibleItems,
    showSeeMore,
    seeMore,
    toggleSeeMore,
    hiddenCount,
  };
}
