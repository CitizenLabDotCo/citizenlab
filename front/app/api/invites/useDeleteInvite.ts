import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import invitesKeys from './keys';

const deleteInvite = ({ inviteId }: { inviteId: string }) =>
  fetcher({
    path: `/invites/${inviteId}`,
    action: 'delete',
  });

const useDeleteInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitesKeys.lists(),
      });
    },
  });
};

export default useDeleteInvite;
