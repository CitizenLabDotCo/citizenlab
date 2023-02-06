import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import inputKeys from './keys';
import { IInsightsInputs, InfiniteQueryParameters, InputKeys } from './types';

const defaultPageSize = 20;
const fetchInfiniteInputs = (
  viewId: string,
  { pageNumber, pageSize, ...queryParams }: InfiniteQueryParameters
) =>
  fetcher<IInsightsInputs>({
    path: `/insights/views/${viewId}/inputs`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || defaultPageSize,
      ...queryParams,
    },
  });

const useInfiniteInputs = (
  viewId: string,
  queryParams: InfiniteQueryParameters
) => {
  return useInfiniteQuery<
    IInsightsInputs,
    CLErrors,
    IInsightsInputs,
    InputKeys
  >({
    queryKey: inputKeys.infiniteList(viewId, queryParams),
    queryFn: ({ pageParam }) =>
      fetchInfiniteInputs(viewId, { ...queryParams, pageNumber: pageParam }),
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    keepPreviousData: true,
  });
};

export default useInfiniteInputs;
