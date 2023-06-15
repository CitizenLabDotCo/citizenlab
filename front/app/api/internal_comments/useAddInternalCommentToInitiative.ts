import { useMutation, useQueryClient } from '@tanstack/react-query';
import commentKeys from 'api/comments/keys';
import initiativesKeys from 'api/initiatives/keys';
import { CLErrorsWrapper } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IInternalNewComment, IInternalComment } from './types';
import userCommentsCount from 'api/user_comments_count/keys';

const addInternalCommentToInitiative = async ({
  initiativeId,
  ...requestBody
}: IInternalNewComment) =>
  fetcher<IInternalComment>({
    path: `/initiatives/${initiativeId}/comments`,
    action: 'post',
    body: { comment: { ...requestBody } },
  });

const useAddInternalCommentToInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation<IInternalComment, CLErrorsWrapper, IInternalNewComment>({
    mutationFn: addInternalCommentToInitiative,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ initiativeId: variables.initiativeId }),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ userId: variables.author_id }),
      });
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.item({ id: variables.initiativeId }),
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

export default useAddInternalCommentToInitiative;
