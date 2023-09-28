import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AUTH_PATH } from 'containers/App/constants';
import fetcher from 'utils/cl-react-query/fetcher';
import usersKeys from './keys';
import groupsKeys from 'api/groups/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import { getJwt, removeJwt, decode } from 'utils/auth/jwt';
import clHistory from 'utils/cl-router/history';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import userCountKeys from 'api/users_count/keys';

const deleteUser = (id?: string) =>
  fetcher({
    path: `/users/${id}`,
    action: 'delete',
  });

const useDeleteSelf = () => {
  const queryClient = useQueryClient();
  const jwt = getJwt();
  const decodedJwt = jwt ? decode(jwt) : null;

  return useMutation({
    mutationFn: () => deleteUser(decodedJwt?.sub),
    onSuccess: async () => {
      if (!decodedJwt) return;
      removeJwt();
      if (decodedJwt.logout_supported) {
        const url = `${AUTH_PATH}/${decodedJwt.provider}/logout?user_id=${decodedJwt.sub}`;
        window.location.href = url;
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
