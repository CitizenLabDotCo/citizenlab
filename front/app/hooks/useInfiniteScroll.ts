import { useEffect, useRef } from 'react';

import { useInView } from 'react-intersection-observer';

interface UseInfiniteScrollOptions {
  /** Are we already loading more? */
  isLoading: boolean;
  /** Do we still have more pages? */
  hasNextPage: boolean;
  /** Called to fetch the next page */
  onLoadMore: () => void;
  /** How far from the bottom to trigger */
  rootMargin?: string;
  /** Intersection threshold */
  threshold?: number;
}

const useInfiniteScroll = ({
  isLoading,
  hasNextPage,
  onLoadMore,
  rootMargin = '0px 0px 100px 0px',
  threshold = 0,
}: UseInfiniteScrollOptions) => {
  const didFetchRef = useRef(false);
  const { ref, inView } = useInView({ rootMargin, threshold });

  useEffect(() => {
    if (inView && hasNextPage && !isLoading && !didFetchRef.current) {
      didFetchRef.current = true;
      onLoadMore();
    } else if (!inView) {
      // reset when sentinel leaves view
      didFetchRef.current = false;
    }
  }, [inView, hasNextPage, isLoading, onLoadMore]);

  return { loadMoreRef: ref };
};

export default useInfiniteScroll;
