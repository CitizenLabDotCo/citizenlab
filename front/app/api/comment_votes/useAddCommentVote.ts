import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { ICommentVote, INewVoteProperties } from './types';
import commentsKeys from 'api/comment_votes/keys';

const addCommentVote = async ({
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
  const queryClient = useQueryClient();
  return useMutation<ICommentVote, CLErrors, INewVoteProperties>({
    mutationFn: addCommentVote,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentsKeys.item({ id: variables.commentId }),
      });
    },
  });
};

export default useAddCommentVote;
