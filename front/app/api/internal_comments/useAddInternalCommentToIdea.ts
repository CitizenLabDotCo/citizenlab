import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import ideasKeys from 'api/ideas/keys';
import commentKeys from 'api/internal_comments/keys';
import userCommentsCount from 'api/user_comments_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { IIdeaNewInternalComment, IInternalComment } from './types';

const addInternalCommentToIdea = async ({
  ideaId,
  ...requestBody
}: IIdeaNewInternalComment) =>
  fetcher<IInternalComment>({
    path: `/ideas/${ideaId}/internal_comments`,
    action: 'post',
    body: { internal_comment: { ...requestBody } },
  });

const useAddInternalCommentToIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IInternalComment,
    CLErrorsWrapper,
    IIdeaNewInternalComment
  >({
    mutationFn: addInternalCommentToIdea,
    onSuccess: (_data, { ideaId, author_id, parent_id }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({
          type: 'author',
          authorId: author_id,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: userCommentsCount.items(),
      });

      queryClient.invalidateQueries({
        queryKey: commentKeys.list({
          type: 'idea',
          ideaId,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: ideasKeys.item({ id: ideaId }),
      });

      if (parent_id) {
        queryClient.invalidateQueries({
          queryKey: commentKeys.list({ type: 'comment', commentId: parent_id }),
        });
      }
    },
  });
};

export default useAddInternalCommentToIdea;
