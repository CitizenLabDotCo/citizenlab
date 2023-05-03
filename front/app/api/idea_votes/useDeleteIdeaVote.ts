import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { IIdeaVote } from './types';
import ideaKeys from 'api/ideas/keys';

export const deleteIdeaVote = async ({
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

const useDeleteIdeaVote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIdeaVote,
    onSuccess: (_data, { ideaId }) => {
      queryClient.invalidateQueries({
        queryKey: ideaKeys.item({ id: ideaId }),
      });
    },
  });
};

export default useDeleteIdeaVote;
