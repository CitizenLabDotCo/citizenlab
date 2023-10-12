import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import usersKeys from './keys';
import groupsKeys from 'api/groups/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import { getJwt, removeJwt, decode } from 'utils/auth/jwt';
import clHistory from 'utils/cl-router/history';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import userCountKeys from 'api/users_count/keys';
import logoutUrl from 'api/authentication/sign_in_out/logoutUrl';

const deleteUser = (id?: string) =>
  fetcher({
    path: `/users/${id}`,
    action: 'delete',
  });

const useDeleteSelf = () => {
  const queryClient = useQueryClient();
  const jwt = getJwt();
  const decodedJwt = jwt ? decode(jwt) : null;
  let cachedLogoutUrl: string;

  return useMutation({
    mutationFn: async () => {
      cachedLogoutUrl = await logoutUrl(decodedJwt);
      return deleteUser(decodedJwt?.sub);
    },
    onSuccess: async () => {
      if (!decodedJwt) return;
      removeJwt();
      if (decodedJwt.logout_supported) {
        window.location.href = cachedLogoutUrl;
      } else {
        invalidateQueryCache();
      }
      clHistory.push('/');

      queryClient.invalidateQueries({
        queryKey: userCountKeys.items(),
      });

      invalidateSeatsCache();

      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupsKeys.all() });
    },
  });
};

export default useDeleteSelf;
