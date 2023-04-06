import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { ICommentVote } from './types';
import commentKeys from './keys';

const deleteVote = async ({
  commentId: _commentId,
  voteId,
}: {
  commentId: string;
  voteId: string;
}) =>
  fetcher<ICommentVote>({
    path: `/votes/${voteId}`,
    action: 'delete',
  });

const useDeleteVote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVote,
    onSuccess: (_data, { commentId }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.item({ id: commentId }),
      });
    },
  });
};

export default useDeleteVote;
