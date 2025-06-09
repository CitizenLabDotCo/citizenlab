import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import miniProjectsKeys from './keys';
import { ProjectsMiniAdmin, ProjectsMiniAdminKeys, Parameters } from './types';

const fetchProjectsMiniAdmin = (queryParameters: Parameters) =>
  fetcher<ProjectsMiniAdmin>({
    path: `/projects/for_admin`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      'page[size]': queryParameters['page[size]'] ?? 6,
      'page[number]': queryParameters['page[number]'] ?? 1,
    },
  });

const useProjectsMiniAdmin = (
  queryParams: Parameters,
  { enabled = true }: { enabled: boolean } = { enabled: true }
) => {
  return useInfiniteQuery<
    ProjectsMiniAdmin,
    CLErrors,
    ProjectsMiniAdmin,
    ProjectsMiniAdminKeys
  >({
    queryKey: miniProjectsKeys.list(queryParams),
    queryFn: ({ pageParam }) => {
      return fetchProjectsMiniAdmin({
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

export default useProjectsMiniAdmin;
