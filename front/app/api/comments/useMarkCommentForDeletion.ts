import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import commentKeys from './keys';
import { DeleteReason, IComment } from './types';
import userCommentsCount from 'api/user_comments_count/keys';
import ideasKeys from 'api/ideas/keys';

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
  initiativeId,
}: {
  ideaId?: string;
  initiativeId?: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation<IComment, CLErrors, MarkForDeletion>({
    mutationFn: markCommentForDeletion,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({
          ideaId,
          initiativeId,
        }),
      });

      // We invalidate the idea because the number of internal comments is on the idea
      queryClient.invalidateQueries({
        queryKey: ideasKeys.item({ id: ideaId }),
      });

      queryClient.invalidateQueries({
        queryKey: userCommentsCount.items(),
      });
    },
  });
};

export default useMarkCommentForDeletion;
