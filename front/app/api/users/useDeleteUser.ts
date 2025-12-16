import { useMutation, useQueryClient } from '@tanstack/react-query';

import emailBansKeys from 'api/email_bans/keys';
import groupsKeys from 'api/groups/keys';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import userCountKeys from 'api/users_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import usersKeys from './keys';

interface QueryParams {
  userId: string;
  deleteParticipationData?: boolean;
  banEmail?: boolean;
  banReason?: string;
}

const deleteUser = ({
  userId,
  deleteParticipationData,
  banEmail,
  banReason,
}: QueryParams) =>
  fetcher({
    path: `/users/${userId}`,
    action: 'delete',
    body: {
      delete_participation_data: deleteParticipationData,
      ban_email: banEmail,
      ban_reason: banReason,
    },
  });

const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: userCountKeys.items(),
      });
      invalidateSeatsCache();

      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupsKeys.all() });

      if (variables.banEmail) {
        queryClient.invalidateQueries({ queryKey: emailBansKeys.all() });
      }
    },
  });
};

export default useDeleteUser;
