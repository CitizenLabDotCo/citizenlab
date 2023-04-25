import { useMutation, useQueryClient } from '@tanstack/react-query';
import commentKeys from 'api/comments/keys';
import ideasKeys from 'api/ideas/keys';
import { CLErrorsJSON } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { INewComment, IComment } from './types';
import userCommentsCount from 'api/user_comments_count/keys';

const addCommentToIdea = async ({ ideaId, ...requestBody }: INewComment) =>
  fetcher<IComment>({
    path: `/ideas/${ideaId}/comments`,
    action: 'post',
    body: { comment: { ...requestBody } },
  });

const useAddCommentToIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IComment, CLErrorsJSON, INewComment>({
    mutationFn: addCommentToIdea,
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

export default useAddCommentToIdea;
