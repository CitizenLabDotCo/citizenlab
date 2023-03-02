import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { IInitiativeVote } from './types';
import initiativesKeys from 'api/initiatives/keys';

const deleteInitiativeVote = async ({
  initiativeId,
  voteId,
}: {
  initiativeId: string;
  voteId: string;
}) =>
  fetcher<IInitiativeVote>({
    path: `/initiatives/${initiativeId}/votes/${voteId}`,
    action: 'delete',
  });

const useDeleteInitiativeVote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInitiativeVote,
    onSuccess: (_data, { initiativeId }) => {
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.item(initiativeId),
      });
    },
  });
};

export default useDeleteInitiativeVote;
