import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import commentKeys from 'api/comments/keys';
import userCommentsCount from 'api/user_comments_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { INewComment, IComment } from './types';

const addCommentToInitiative = async ({
  initiativeId,
  ...requestBody
}: INewComment) =>
  fetcher<IComment>({
    path: `/initiatives/${initiativeId}/comments`,
    action: 'post',
    body: { comment: { ...requestBody } },
  });

const useAddCommentToInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation<IComment, CLErrorsWrapper, INewComment>({
    mutationFn: addCommentToInitiative,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ initiativeId: variables.initiativeId }),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ authorId: variables.author_id }),
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

export default useAddCommentToInitiative;
