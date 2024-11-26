import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import ideasKeys from './keys';
import { IIdeas, IIdeaQueryParameters, IdeasKeys } from './types';

const defaultPageSize = 12;

const fetchInfiniteIdeas = (queryParameters: IIdeaQueryParameters) =>
  fetcher<IIdeas>({
    path: `/ideas`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      'page[number]': queryParameters['page[number]'] || 1,
      'page[size]': queryParameters['page[size]'] || defaultPageSize,
    },
  });

const useInfiniteIdeas = (queryParams: IIdeaQueryParameters) => {
  return useInfiniteQuery<IIdeas, CLErrors, IIdeas, IdeasKeys>({
    queryKey: ideasKeys.list(queryParams),
    queryFn: ({ pageParam }) =>
      fetchInfiniteIdeas({ ...queryParams, 'page[number]': pageParam }),
    getNextPageParam: (lastPage) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
  });
};

export default useInfiniteIdeas;
