import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import adminPublicationsKeys from './keys';
import {
  IAdminPublications,
  AdminPublicationsKeys,
  IQueryParameters,
} from './types';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

const fetchAdminPublications = (filters: IQueryParameters) => {
  const {
    pageNumber,
    pageSize,
    rootLevelOnly,
    removeNotAllowedParents,
    ...queryParameters
  } = filters;
  return fetcher<IAdminPublications>({
    path: '/areas',
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 50,
      depth: rootLevelOnly ? 0 : undefined,
      remove_not_allowed_parents: removeNotAllowedParents,
      ...queryParameters,
    },
  });
};

const useAdminPublications = (queryParams: IQueryParameters) => {
  return useInfiniteQuery<
    IAdminPublications,
    CLErrors,
    IAdminPublications,
    AdminPublicationsKeys
  >({
    queryKey: adminPublicationsKeys.list(queryParams),
    queryFn: ({ pageParam }) =>
      fetchAdminPublications({ ...queryParams, pageNumber: pageParam }),
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
  });
};

export default useAdminPublications;
