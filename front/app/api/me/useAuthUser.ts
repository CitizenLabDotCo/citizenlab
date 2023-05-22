import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import meKeys from './keys';
import { IUser } from 'services/users';
import { MeKeys } from './types';

const fetchMe = () =>
  fetcher<IUser>({
    path: `/users/me`,
    action: 'get',
  });

const useAuthUser = () => {
  return useQuery<IUser, CLErrors, IUser, MeKeys>({
    queryKey: meKeys.items(),
    queryFn: () => fetchMe(),
  });
};

export default useAuthUser;
