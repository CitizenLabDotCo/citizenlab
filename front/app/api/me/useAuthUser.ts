import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IUser } from 'api/users/types';

import fetcher from 'utils/cl-react-query/fetcher';

import meKeys from './keys';
import { MeKeys } from './types';

// The API authenticates the request with the HttpOnly auth cookie, which this code
// can't read. Without a valid one, there is no signed-in user and we get null.
export const fetchMe = () =>
  fetcher<IUser | null>({
    path: `/users/me`,
    action: 'get',
  });

const useAuthUser = () => {
  return useQuery<IUser | null, CLErrors, IUser | null, MeKeys>({
    queryKey: meKeys.all(),
    queryFn: () => fetchMe(),
  });
};

export default useAuthUser;
