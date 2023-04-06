import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_PATH } from 'containers/App/constants';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
import commentVotesKeys from './keys';
import { ICommentVote } from './types';

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
    onSuccess: (_data, { commentId, voteId }) => {
      queryClient.invalidateQueries({
        queryKey: commentVotesKeys.item({ id: voteId }),
      });
      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/comments/${commentId}`],
      });
    },
  });
};

export default useDeleteVote;
