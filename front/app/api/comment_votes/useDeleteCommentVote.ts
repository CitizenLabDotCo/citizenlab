import { useMutation, useQueryClient } from '@tanstack/react-query';
import commentKeys from 'api/comments/keys';
import fetcher from 'utils/cl-react-query/fetcher';
import { ICommentReaction } from './types';

export const deleteCommentReaction = async ({
  commentId: _commentId,
  reactionId,
}: {
  commentId: string;
  reactionId: string;
}) =>
  fetcher<ICommentReaction>({
    path: `/reactions/${reactionId}`,
    action: 'delete',
  });

const useDeleteReaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCommentReaction,
    onSuccess: (_data, { commentId }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.item({ id: commentId }),
      });
    },
  });
};

export default useDeleteReaction;
