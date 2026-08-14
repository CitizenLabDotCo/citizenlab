import { useEffect, useRef } from 'react';

interface QuerySuccessState {
  isSuccess: boolean;
  isPlaceholderData: boolean;
  dataUpdatedAt: number;
}

/**
 * Runs `callback` whenever a query has data for the parameters it was called
 * with, including data that came straight from the cache.
 *
 * Placeholder data is skipped on purpose: the `keepPreviousData` default in
 * `queryClient` reports a success status while a new query key loads, so
 * without this gate the callback would run against data fetched for the
 * previous parameters.
 */
const useOnQuerySuccess = (
  { isSuccess, isPlaceholderData, dataUpdatedAt }: QuerySuccessState,
  callback?: () => void
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (isSuccess && !isPlaceholderData) {
      callbackRef.current?.();
    }
  }, [isSuccess, isPlaceholderData, dataUpdatedAt]);
};

export default useOnQuerySuccess;
