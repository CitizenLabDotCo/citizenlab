import type {
  GetNextPageParamFunction,
  QueryFunction,
  QueryKey,
} from '@tanstack/react-query';

/**
 * Lets one definition of `queryKey` + `queryFn` be shared by a `useQuery` hook
 * and by a router loader calling `queryClient.ensureQueryData`. If the two ever
 * build the key separately they can drift, and a drifted key means the loader
 * warms a cache entry the hook never reads — two requests instead of one.
 *
 * React Query 4 has no `queryOptions()`; this is the v5 helper's shape, so the
 * v5 upgrade replaces this import with the real one and leaves call sites alone.
 *
 * Observer options (`enabled`, `refetchOnWindowFocus`, `select`) are
 * deliberately absent: `ensureQueryData` ignores them, so accepting them here
 * would suggest a loader honours `enabled: false` when it never does.
 */
export interface SharedQueryOptions<
  TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> {
  queryKey: TQueryKey;
  queryFn: QueryFunction<TQueryFnData, TQueryKey>;
}

const queryOptions = <TQueryFnData, TQueryKey extends QueryKey>(
  options: SharedQueryOptions<TQueryFnData, TQueryKey>
): SharedQueryOptions<TQueryFnData, TQueryKey> => options;

/**
 * The `useInfiniteQuery` counterpart. `getNextPageParam` has to be shared too:
 * a loader prefetching without it stores a page the hook then treats as having
 * no next page, which silently breaks "load more".
 */
export interface SharedInfiniteQueryOptions<
  TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> extends SharedQueryOptions<TQueryFnData, TQueryKey> {
  getNextPageParam: GetNextPageParamFunction<TQueryFnData>;
}

export const infiniteQueryOptions = <TQueryFnData, TQueryKey extends QueryKey>(
  options: SharedInfiniteQueryOptions<TQueryFnData, TQueryKey>
): SharedInfiniteQueryOptions<TQueryFnData, TQueryKey> => options;

export default queryOptions;
