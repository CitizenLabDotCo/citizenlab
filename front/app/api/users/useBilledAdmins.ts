import { useQuery } from '@tanstack/react-query';
import { CLErrors, Pagination } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import usersKeys from './keys';
import { IUsers, UsersKeys } from './types';

const fetchBilledAdmins = (queryParams: Pagination) =>
  fetcher<IUsers>({
    path: '/users/billed_admins',
    action: 'get',
    queryParams,
  });

const useBilledAdmins = (queryParams: Pagination) => {
  return useQuery<IUsers, CLErrors, IUsers, UsersKeys>({
    queryKey: usersKeys.list({ ...queryParams, endpoint: 'billed_admins' }),
    queryFn: () => fetchBilledAdmins(queryParams),
  });
};

export default useBilledAdmins;
