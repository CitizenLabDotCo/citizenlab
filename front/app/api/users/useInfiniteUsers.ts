import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import projectsKeys from './keys';
import { IQueryParameters, IUsers, UsersKeys } from './types';

const fetchUsers = ({ pageNumber, pageSize, ...rest }: IQueryParameters) =>
  fetcher<IUsers>({
    path: `/users`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber ?? 1,
      'page[size]': pageSize ?? 250,
      ...rest,
    },
  });

const useInfiniteUsers = (queryParameters: IQueryParameters) => {
  return useInfiniteQuery<IUsers, CLErrors, IUsers, UsersKeys>({
    queryKey: projectsKeys.list(queryParameters),
    queryFn: ({ pageParam }) =>
      fetchUsers({ ...queryParameters, pageNumber: pageParam }),
    getNextPageParam: (lastPage) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
  });
};

export default useInfiniteUsers;
