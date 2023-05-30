import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IQueryParameters, IUsers, UsersKeys } from './types';
import projectsKeys from './keys';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

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
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
  });
};

export default useInfiniteUsers;
