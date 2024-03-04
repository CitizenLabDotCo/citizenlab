import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import groupsKeys from 'api/groups/keys';
import meKeys from 'api/me/keys';
import usersKeys from 'api/users/keys';

import membershipsKeys from './keys';

const deleteMembership = ({
  groupId,
  userId,
}: {
  userId: string;
  groupId: string;
}) =>
  fetcher({
    path: `/groups/${groupId}/memberships/by_user_id/${userId}`,
    action: 'delete',
  });

const useDeleteMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMembership,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: membershipsKeys.lists(),
      });
      queryClient.invalidateQueries({ queryKey: groupsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: meKeys.all() });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

export default useDeleteMembership;
