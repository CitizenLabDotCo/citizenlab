import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import usersKeys from './keys';
import { IQueryParameters, IUsers, UsersKeys } from './types';

const fetchUsers = ({ pageNumber, pageSize, ...rest }: IQueryParameters) =>
  fetcher<IUsers>({
    path: `/users`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber ?? 1,
      'page[size]': pageSize ?? 20,
      ...rest,
    },
  });

const useUsers = (queryParameters: IQueryParameters) => {
  return useQuery<IUsers, CLErrors, IUsers, UsersKeys>({
    queryKey: usersKeys.list(queryParameters),
    queryFn: () => fetchUsers(queryParameters),
  });
};

export default useUsers;
