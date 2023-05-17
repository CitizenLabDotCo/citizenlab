import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_PATH, AUTH_PATH } from 'containers/App/constants';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
import usersKeys from './keys';
import groupsKeys from 'api/groups/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import { getJwt, removeJwt, decode } from 'utils/auth/jwt';
import clHistory from 'utils/cl-router/history';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

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
        await streams.reset();
        await resetQueryCache();
      }
      clHistory.push('/');

      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/stats/users_count`],
      });

      invalidateSeatsCache();

      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupsKeys.all() });
    },
  });
};

export default useDeleteSelf;
