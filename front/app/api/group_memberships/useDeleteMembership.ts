import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: membershipsKeys.lists(),
      });
    },
  });
};

export default useDeleteMembership;
