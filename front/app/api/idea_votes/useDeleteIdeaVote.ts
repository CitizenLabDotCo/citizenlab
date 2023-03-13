import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { IIdeaVote } from './types';
import ideaKeys from 'api/ideas/keys';

const deleteVote = async ({
  ideaId: _ideaId,
  voteId,
}: {
  ideaId: string;
  voteId: string;
}) =>
  fetcher<IIdeaVote>({
    path: `/votes/${voteId}`,
    action: 'delete',
  });

const useDeleteVote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVote,
    onSuccess: (_data, { ideaId }) => {
      queryClient.invalidateQueries({
        queryKey: ideaKeys.itemId(ideaId),
      });
    },
  });
};

export default useDeleteVote;
