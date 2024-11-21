import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import adminPublicationsKeys from './keys';
import { IAdminPublications, AdminPublicationsKeys } from './types';

interface Params {
  ids: string[];
  pageNumber?: number;
  pageSize?: number;
}

const fetchAdminPublicationsByIds = ({ pageNumber, pageSize, ids }: Params) => {
  return fetcher<IAdminPublications>({
    path: '/admin_publications/select_and_order_by_ids',
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 1000,
      ids,
    },
  });
};

const useAdminPublicationsByIds = (
  queryParams: Params,
  { enabled = true } = {}
) => {
  return useInfiniteQuery<
    IAdminPublications,
    CLErrors,
    IAdminPublications,
    AdminPublicationsKeys
  >({
    queryKey: adminPublicationsKeys.list(queryParams),
    queryFn: ({ pageParam }) =>
      fetchAdminPublicationsByIds({ ...queryParams, pageNumber: pageParam }),
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    enabled,
  });
};

export default useAdminPublicationsByIds;
