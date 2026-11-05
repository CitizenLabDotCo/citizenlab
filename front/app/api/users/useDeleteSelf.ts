import { useMutation, useQueryClient } from '@tanstack/react-query';

import groupsKeys from 'api/groups/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import userCountKeys from 'api/users_count/keys';
import useAuthUser from 'api/me/useAuthUser';

import fetcher from 'utils/cl-react-query/fetcher';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import clHistory from 'utils/cl-router/history';

import usersKeys from './keys';

const useDeleteSelf = () => {
  const queryClient = useQueryClient();
  const { data: authUser } = useAuthUser();

  const deleteUser = () =>
    fetcher({
      path: `/users/${authUser?.data.id}`,
      action: 'delete',
    });

  return useMutation({
    mutationFn: async () => {
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
