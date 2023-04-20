import { useMutation, useQueryClient } from '@tanstack/react-query';
import commentKeys from 'api/comments/keys';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { ICommentVote, INewVoteProperties } from './types';

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
        queryKey: commentKeys.item({ id: variables.commentId }),
      });
    },
  });
};

export default useAddCommentVote;
