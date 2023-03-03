import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import ideasKeys from './keys';
import { IIdeas, IQueryParameters, IdeasKeys } from './types';

const defaultPageSize = 12;

const fetchInfiniteIdeas = (queryParameters: IQueryParameters) =>
  fetcher<IIdeas>({
    path: `/ideas`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      'page[number]': queryParameters['page[number]'] || 1,
      'page[size]': queryParameters['page[size]'] || defaultPageSize,
    },
  });

const useInfiniteIdeas = (queryParams: IQueryParameters) => {
  return useInfiniteQuery<IIdeas, CLErrors, IIdeas, IdeasKeys>({
    queryKey: ideasKeys.infiniteList(queryParams),
    queryFn: ({ pageParam }) =>
      fetchInfiniteIdeas({ ...queryParams, 'page[number]': pageParam }),
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
  });
};

export default useInfiniteIdeas;
