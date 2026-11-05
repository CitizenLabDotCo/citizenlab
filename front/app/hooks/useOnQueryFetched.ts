import { useEffect, useRef } from 'react';

interface QueryFetchState {
  isFetching: boolean;
  isSuccess: boolean;
}

/**
 * Runs `callback` each time the query's *own* fetch completes successfully,
 * and only then (react-query v4's `onSuccess` semantics). Cached data, whether
 * it was already there on mount or is written later by `setQueryData` (for
 * example the `included` resources `fetcher` seeds from other responses), does
 * not trigger it.
 *
 * Prefer this over `useOnQuerySuccess` when the callback invalidates queries
 * whose responses side-load this query's own resource type: with
 * `useOnQuerySuccess` that seeding bumps `dataUpdatedAt`, re-fires the
 * callback, and the two queries refetch each other forever.
 */
const useOnQueryFetched = (
  { isFetching, isSuccess }: QueryFetchState,
  callback?: () => void
) => {
  const callbackRef = useRef(callback);
  const wasFetchingRef = useRef(isFetching);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (wasFetchingRef.current && !isFetching && isSuccess) {
      callbackRef.current?.();
    }
    wasFetchingRef.current = isFetching;
  }, [isFetching, isSuccess]);
};

export default useOnQueryFetched;
