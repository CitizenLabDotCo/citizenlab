import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import miniProjectsKeys from './keys';
import { MiniProjects, MiniProjectsKeys, Parameters } from './types';

const fetchProjectsMini = ({ endpoint, ...queryParameters }: Parameters) =>
  fetcher<MiniProjects>({
    path: `/projects/${endpoint}`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      'page[size]': queryParameters['page[size]'] ?? 6,
      'page[number]': queryParameters['page[number]'] ?? 1,
    },
  });

const useProjectsMini = (
  queryParams: Parameters,
  { enabled = true }: { enabled: boolean } = { enabled: true }
) => {
  return useInfiniteQuery<
    MiniProjects,
    CLErrors,
    MiniProjects,
    MiniProjectsKeys
  >({
    queryKey: miniProjectsKeys.list(queryParams),
    queryFn: ({ pageParam }) => {
      return fetchProjectsMini({
        ...queryParams,
        'page[number]': pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      const links = lastPage.links;
      if (!links) return null;
      const hasNextPage = links.next;
      const pageNumber = getPageNumberFromUrl(links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    enabled,
  });
};

export default useProjectsMini;
