import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import signOut from 'api/authentication/sign_in_out/signOut';
import { HighestRole, IUser } from 'api/users/types';

import { getJwt, decode } from 'utils/auth/jwt';
import fetcher from 'utils/cl-react-query/fetcher';
import { rolesExceedHighestRole } from 'utils/permissions/roles';

import meKeys from './keys';
import { MeKeys } from './types';

export const fetchMe = async () => {
  const data = await fetcher<IUser | null>({
    path: `/users/me`,
    action: 'get',
  });

  if (!data) return null;

  // Without a token the request above was unauthenticated, so there is nothing to trust.
  const jwt = getJwt();
  if (!jwt) return null;

  let highestRole: HighestRole;

  try {
    highestRole = decode(jwt).highest_role;
  } catch {
    signOut();
    return null;
  }

  /*
    A user can rewrite the response body in their own browser but not the signed token,
    so both role fields are checked against it: highest_role directly, and the roles
    array for a tier above what the token claims. A session that disagrees is signed
    out to force a fresh login. The scopes within a tier, which the array carries and
    the token does not, stay unchecked here — the API re-authorizes those on every
    request.
  */
  if (
    data.data.attributes.highest_role !== highestRole ||
    rolesExceedHighestRole(data.data.attributes.roles, highestRole)
  ) {
    signOut();
    return null;
  }

  return data;
};

const useAuthUser = () => {
  return useQuery<IUser | null, CLErrors, IUser | null, MeKeys>({
    queryKey: meKeys.all(),
    queryFn: () => fetchMe(),
  });
};

export default useAuthUser;
