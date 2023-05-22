import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import membershipsKeys from './keys';
import groupsKeys from 'api/groups/keys';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import meKeys from 'api/me/keys';

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
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users`],
      });
    },
  });
};

export default useDeleteMembership;
