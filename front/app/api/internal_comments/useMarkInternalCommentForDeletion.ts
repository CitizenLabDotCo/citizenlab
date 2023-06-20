import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import internalCommentKeys from './keys';
import { IInternalComment } from './types';
import userCommentsCount from 'api/user_comments_count/keys';

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
  initiativeId,
}: {
  ideaId?: string;
  initiativeId?: string;
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
      }

      if (initiativeId) {
        queryClient.invalidateQueries({
          queryKey: internalCommentKeys.list({
            type: 'initiative',
            initiativeId,
          }),
        });
      }

      queryClient.invalidateQueries({
        queryKey: userCommentsCount.items(),
      });
    },
  });
};

export default useMarkInternalCommentForDeletion;
