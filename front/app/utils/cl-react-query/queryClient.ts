import { keepPreviousData, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      placeholderData: keepPreviousData,
      retry: false,
    },
  },
});

/**
 * Pass as `placeholderData` to opt a query out of the `keepPreviousData`
 * default above, so it reports no data at all while a new query key loads
 * instead of the previous key's data.
 */
export const NO_PLACEHOLDER_DATA = undefined;
