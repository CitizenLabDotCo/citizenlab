import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import commentsKeys from 'api/comments/keys';
import ideasKeys from 'api/ideas/keys';
import moderationsKeys from 'api/moderations/keys';
import userCommentsCount from 'api/user_comments_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import commentKeys from './keys';
import { DeleteReason, IComment } from './types';

interface MarkForDeletion {
  commentId: string;
  reason?: DeleteReason;
}

const markCommentForDeletion = async ({
  commentId,
  reason,
}: MarkForDeletion) => {
  return fetcher<IComment>({
    path: `/comments/${commentId}/mark_as_deleted`,
    action: 'post',
    body: { comment: reason },
  });
};

const useMarkCommentForDeletion = ({
  ideaId,
  parentCommentId,
}: {
  ideaId?: string;
  parentCommentId?: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation<IComment, CLErrors, MarkForDeletion>({
    mutationFn: markCommentForDeletion,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({
          ideaId,
        }),
      });

      if (ideaId) {
        // We invalidate the idea because the number of comments is on the idea
        queryClient.invalidateQueries({
          queryKey: ideasKeys.item({ id: ideaId }),
        });
      }

      if (parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: commentsKeys.list({ commentId: parentCommentId }),
        });
        queryClient.invalidateQueries({
          queryKey: moderationsKeys.all(),
        });
      }

      queryClient.invalidateQueries({
        queryKey: userCommentsCount.items(),
      });
    },
  });
};

export default useMarkCommentForDeletion;
