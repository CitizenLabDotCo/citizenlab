import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import useDebouncedValue from 'hooks/useDebouncedValue';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import adminPublicationsKeys from './keys';
import {
  IAdminPublications,
  AdminPublicationsKeys,
  IQueryParameters,
} from './types';

export const fetchAdminPublications = (filters: IQueryParameters) => {
  const {
    pageNumber,
    pageSize,
    rootLevelOnly,
    removeNotAllowedParents,
    publicationStatusFilter,
    childrenOfId,
    topicIds,
    areaIds,
    onlyProjects,
    ...queryParameters
  } = filters;
  return fetcher<IAdminPublications>({
    path: '/admin_publications',
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 1000,
      depth: rootLevelOnly ? 0 : undefined,
      remove_not_allowed_parents: removeNotAllowedParents,
      publication_statuses: publicationStatusFilter,
      folder: childrenOfId,
      topics: topicIds,
      areas: areaIds,
      only_projects: onlyProjects,
      ...queryParameters,
    },
  });
};

const useAdminPublications = (
  queryParams: IQueryParameters,
  { enabled = true } = {}
) => {
  const debouncedSearch = useDebouncedValue(queryParams.search, 350);
  const debouncedQueryParams = {
    ...queryParams,
    search: debouncedSearch,
  };

  return useInfiniteQuery<
    IAdminPublications,
    CLErrors,
    IAdminPublications,
    AdminPublicationsKeys
  >({
    queryKey: adminPublicationsKeys.list(debouncedQueryParams),
    queryFn: ({ pageParam }) =>
      fetchAdminPublications({
        ...debouncedQueryParams,
        pageNumber: pageParam,
      }),
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    enabled,
  });
};

export default useAdminPublications;
