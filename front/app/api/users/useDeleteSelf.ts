import { useMutation, useQueryClient } from '@tanstack/react-query';

// import logoutUrl from 'api/authentication/sign_in_out/logoutUrl';
import groupsKeys from 'api/groups/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import userCountKeys from 'api/users_count/keys';

// import { getJwt, removeJwt, decode } from 'utils/auth/jwt';
import fetcher from 'utils/cl-react-query/fetcher';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import clHistory from 'utils/cl-router/history';

import usersKeys from './keys';

const deleteUser = (id?: string) =>
  fetcher({
    path: `/users/${id}`,
    action: 'delete',
  });

const useDeleteSelf = () => {
  const queryClient = useQueryClient();
  // const jwt = getJwt();
  // const decodedJwt = jwt ? decode(jwt) : null;
  // let cachedLogoutUrl: string;

  return useMutation({
    mutationFn: async () => {
      // cachedLogoutUrl = await logoutUrl(decodedJwt);
      return deleteUser();
    },
    onSuccess: async () => {
      invalidateQueryCache();
      clHistory.push('/', { scrollToTop: true });
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
