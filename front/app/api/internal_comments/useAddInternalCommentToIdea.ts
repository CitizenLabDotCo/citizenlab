import { useMutation, useQueryClient } from '@tanstack/react-query';
import commentKeys from 'api/internal_comments/keys';
import ideasKeys from 'api/ideas/keys';
import { CLErrorsWrapper } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IInternalNewComment, IInternalComment } from './types';
import userCommentsCount from 'api/user_comments_count/keys';

const addInternalCommentToIdea = async ({
  ideaId,
  ...requestBody
}: IInternalNewComment) =>
  fetcher<IInternalComment>({
    path: `/ideas/${ideaId}/internal_comments`,
    action: 'post',
    body: { comment: { ...requestBody } },
  });

const useAddInternalCommentToIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IInternalComment, CLErrorsWrapper, IInternalNewComment>({
    mutationFn: addInternalCommentToIdea,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ userId: variables.author_id }),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ ideaId: variables.ideaId }),
      });
      queryClient.invalidateQueries({
        queryKey: ideasKeys.item({ id: variables.ideaId }),
      });
      queryClient.invalidateQueries({
        queryKey: userCommentsCount.items(),
      });

      if (variables.parent_id) {
        queryClient.invalidateQueries({
          queryKey: commentKeys.list({ commentId: variables.parent_id }),
        });
      }
    },
  });
};

export default useAddInternalCommentToIdea;
