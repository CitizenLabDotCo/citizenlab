import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import signOut from 'api/authentication/sign_in_out/signOut';
import { IUser } from 'api/users/types';

import { getJwt, decode } from 'utils/auth/jwt';
import fetcher from 'utils/cl-react-query/fetcher';

import meKeys from './keys';
import { MeKeys } from './types';

export const fetchMe = async () => {
  const data = await fetcher<IUser | null>({
    path: `/users/me`,
    action: 'get',
  });

  if (!data) return null;

  // For any elevated roles check that the highest role in the JWT and the API response are in sync.
  // If not, return null to force a new login and refetch of the user data
  if (data.data.attributes.highest_role !== 'user') {
    const jwt = getJwt();
    if (jwt) {
      try {
        const decoded = decode(jwt);
        if (decoded.highest_role !== data.data.attributes.highest_role) {
          signOut();
          return null;
        }
      } catch {
        signOut();
        return null;
      }
    }
  }

  return data;
};

const useAuthUser = () => {
  return useQuery<IUser | null, CLErrors, IUser, MeKeys>({
    queryKey: meKeys.all(),
    queryFn: () => fetchMe(),
  });
};

export default useAuthUser;
