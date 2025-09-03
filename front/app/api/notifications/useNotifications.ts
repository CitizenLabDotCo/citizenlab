import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import notificationsKeys from './keys';
import { INotifications, IQueryParameters, NotificationsKeys } from './types';

const defaultPageSize = 12;

const fetchInfiniteNotifications = (queryParameters: IQueryParameters) =>
  fetcher<INotifications>({
    path: `/notifications`,
    action: 'get',
    queryParams: {
      'page[number]': queryParameters.pageNumber || 1,
      'page[size]': queryParameters.pageSize || defaultPageSize,
    },
  });

const useInfiniteNotifications = (queryParams: IQueryParameters) => {
  return useInfiniteQuery<
    INotifications,
    CLErrors,
    INotifications,
    NotificationsKeys
  >({
    queryKey: notificationsKeys.list(queryParams),
    queryFn: ({ pageParam }) =>
      fetchInfiniteNotifications({ ...queryParams, pageNumber: pageParam }),
    getNextPageParam: (lastPage) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
  });
};

export default useInfiniteNotifications;
