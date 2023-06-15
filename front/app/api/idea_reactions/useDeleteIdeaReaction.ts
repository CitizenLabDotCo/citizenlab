import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { IIdeaReaction } from './types';
import ideaKeys from 'api/ideas/keys';

export const deleteIdeaReaction = async ({
  ideaId: _ideaId,
  reactionId,
}: {
  ideaId: string;
  reactionId: string;
}) =>
  fetcher<IIdeaReaction>({
    path: `/reactions/${reactionId}`,
    action: 'delete',
  });

const useDeleteIdeaReaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIdeaReaction,
    onSuccess: (_data, { ideaId }) => {
      queryClient.invalidateQueries({
        queryKey: ideaKeys.item({ id: ideaId }),
      });
    },
  });
};

export default useDeleteIdeaReaction;
