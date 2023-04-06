import { useMutation } from '@tanstack/react-query';
import { API_PATH } from 'containers/App/constants';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
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
  return useMutation({
    mutationFn: deleteVote,
    onSuccess: (_data, { commentId }) => {
      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/comments/${commentId}`],
      });
    },
  });
};

export default useDeleteVote;
