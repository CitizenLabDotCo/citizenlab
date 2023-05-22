import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import meKeys from './keys';
import { IUser } from 'services/users';
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
    retry: false,
    keepPreviousData: false,
    staleTime: 0,
    cacheTime: 0,
  });
};

export default useAuthUser;
