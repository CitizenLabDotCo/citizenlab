import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import commentsKeys from 'api/comments/keys';
import ideasKeys from 'api/ideas/keys';
import userCommentsCount from 'api/user_comments_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import internalCommentKeys from './keys';
import { IInternalComment } from './types';

interface MarkInternalCommentForDeletion {
  commentId: string;
}

const markInternalCommentForDeletion = async ({
  commentId,
}: MarkInternalCommentForDeletion) => {
  return fetcher<IInternalComment>({
    path: `/internal_comments/${commentId}/mark_as_deleted`,
    action: 'patch',
  });
};

const useMarkInternalCommentForDeletion = ({
  ideaId,
  parentCommentId,
}: {
  ideaId?: string;
  parentCommentId?: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation<
    IInternalComment,
    CLErrors,
    MarkInternalCommentForDeletion
  >({
    mutationFn: markInternalCommentForDeletion,
    onSuccess: (_data) => {
      if (ideaId) {
        queryClient.invalidateQueries({
          queryKey: internalCommentKeys.list({
            type: 'idea',
            ideaId,
          }),
        });

        // We invalidate the idea because the number of internal comments is on the idea
        queryClient.invalidateQueries({
          queryKey: ideasKeys.item({ id: ideaId }),
        });
      }

      if (parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: commentsKeys.list({ commentId: parentCommentId }),
        });
      }

      queryClient.invalidateQueries({
        queryKey: userCommentsCount.items(),
      });
    },
  });
};

export default useMarkInternalCommentForDeletion;
