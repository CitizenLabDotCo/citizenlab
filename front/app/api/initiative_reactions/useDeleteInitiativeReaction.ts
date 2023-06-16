import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { IInitiativeReaction } from './types';
import initiativesKeys from 'api/initiatives/keys';

const deleteInitiativeReaction = async ({
  initiativeId: _initiativeId,
  reactionId,
}: {
  initiativeId: string;
  reactionId: string;
}) =>
  fetcher<IInitiativeReaction>({
    path: `/reactions/${reactionId}`,
    action: 'delete',
  });

const useDeleteInitiativeReaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInitiativeReaction,
    onSuccess: (_data, { initiativeId }) => {
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.item({ id: initiativeId }),
      });
    },
  });
};

export default useDeleteInitiativeReaction;
