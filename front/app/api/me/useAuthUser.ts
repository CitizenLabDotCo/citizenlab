import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IUser } from 'api/users/types';

import fetcher from 'utils/cl-react-query/fetcher';

import meKeys from './keys';
import { MeKeys } from './types';

export const fetchMe = () =>
  fetcher<IUser>({
    path: `/users/me`,
    action: 'get',
  });

const useAuthUser = () => {
  return useQuery<IUser, CLErrors, IUser, MeKeys>({
    queryKey: meKeys.all(),
    queryFn: () => fetchMe(),
  });
};

export default useAuthUser;
