import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { getPageNumberFromUrl } from 'utils/paginationUtils';

import projectLibraryProjectsKeys from './keys';
import {
  Parameters,
  ProjectLibraryProjects,
  ProjectLibraryProjectsKeys,
} from './types';
import { fetchLibraryProjects } from './useProjectLibraryProjects';

const useInfiniteProjectLibraryProjects = (
  queryParams: Parameters,
  { enabled = true } = {}
) => {
  return useInfiniteQuery<
    ProjectLibraryProjects,
    CLErrors,
    ProjectLibraryProjects,
    ProjectLibraryProjectsKeys
  >({
    queryKey: projectLibraryProjectsKeys.list(queryParams),
    queryFn: ({ pageParam }) =>
      fetchLibraryProjects({
        ...queryParams,
        'page[number]': pageParam,
      }),
    enabled,
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    keepPreviousData: true,
  });
};

export default useInfiniteProjectLibraryProjects;
