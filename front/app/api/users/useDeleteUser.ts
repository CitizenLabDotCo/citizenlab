import { useMutation, useQueryClient } from '@tanstack/react-query';

import groupsKeys from 'api/groups/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import userCountKeys from 'api/users_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import usersKeys from './keys';

interface QueryParams {
  userId: string;
  deleteParticipationData: boolean;
}

const deleteUser = ({ userId, deleteParticipationData }: QueryParams) =>
  fetcher({
    path: `/users/${userId}`,
    action: 'delete',
    body: { delete_participation_data: deleteParticipationData },
  });

const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: userCountKeys.items(),
      });
      invalidateSeatsCache();

      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupsKeys.all() });
    },
  });
};

export default useDeleteUser;
