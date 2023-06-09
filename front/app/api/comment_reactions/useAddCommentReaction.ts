import { useMutation, useQueryClient } from '@tanstack/react-query';
import commentKeys from 'api/comments/keys';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { ICommentReaction, INewReactionProperties } from './types';

export const addCommentReaction = async ({
  commentId,
  userId,
  ...requestBody
}: INewReactionProperties) =>
  fetcher<ICommentReaction>({
    path: `/comments/${commentId}/reactions`,
    action: 'post',
    body: { user_id: userId, ...requestBody },
  });

const useAddCommentReaction = () => {
  const queryClient = useQueryClient();
  return useMutation<ICommentReaction, CLErrors, INewReactionProperties>({
    mutationFn: addCommentReaction,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.item({ id: variables.commentId }),
      });
    },
  });
};

export default useAddCommentReaction;
