import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import miniProjectsKeys from './keys';
import { MiniProjects, MiniProjectsKeys, QueryParameters } from './types';

const fetchProjectsWithActiveParticipatoryPhase = (
  queryParameters: QueryParameters
) =>
  fetcher<MiniProjects>({
    path: '/projects/with_active_participatory_phase',
    action: 'get',
    queryParams: {
      'page[size]': queryParameters['page[size]'] ?? 6,
      'page[number]': queryParameters['page[number]'] ?? 1,
    },
  });

const useProjectsWithActiveParticipatoryPhase = (
  queryParams: QueryParameters = {},
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
      return fetchProjectsWithActiveParticipatoryPhase({
        ...queryParams,
        'page[number]': pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    enabled,
  });
};

export default useProjectsWithActiveParticipatoryPhase;
