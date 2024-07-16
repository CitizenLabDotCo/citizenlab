import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import commentKeys from 'api/comments/keys';
import ideasKeys from 'api/ideas/keys';
import userCommentsCount from 'api/user_comments_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { INewComment, IComment } from './types';

const addCommentToIdea = async ({ ideaId, ...requestBody }: INewComment) =>
  fetcher<IComment>({
    path: `/ideas/${ideaId}/comments`,
    action: 'post',
    body: { comment: { ...requestBody } },
  });

const useAddCommentToIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IComment, CLErrorsWrapper, INewComment>({
    mutationFn: addCommentToIdea,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ authorId: variables.author_id }),
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
