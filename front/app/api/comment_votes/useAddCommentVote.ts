import { useMutation } from '@tanstack/react-query';
import { API_PATH } from 'containers/App/constants';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
import { ICommentVote, INewVoteProperties } from './types';

export const addCommentVote = async ({
  commentId,
  userId,
  ...requestBody
}: INewVoteProperties) =>
  fetcher<ICommentVote>({
    path: `/comments/${commentId}/votes`,
    action: 'post',
    body: { user_id: userId, ...requestBody },
  });

const useAddCommentVote = () => {
  return useMutation<ICommentVote, CLErrors, INewVoteProperties>({
    mutationFn: addCommentVote,
    onSuccess: (_data, variables) => {
      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/comments/${variables.commentId}`],
      });
    },
  });
};

export default useAddCommentVote;
