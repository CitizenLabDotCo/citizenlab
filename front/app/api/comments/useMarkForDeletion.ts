import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_PATH } from 'containers/App/constants';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
import commentKeys from './keys';
import { DeleteReason, IComment } from './types';

interface MarkForDeletion {
  commentId: string;
  authorId?: string;
  projectId?: string | null;
  reason?: DeleteReason;
}

const markForDeletion = async ({ commentId, reason }: MarkForDeletion) => {
  if (reason && reason.reason_code !== 'other') {
    reason.other_reason = null;
  }
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
    mutationFn: markForDeletion,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({
          ideaId,
          initiativeId,
        }),
      });
      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users/${variables.authorId}/comments_count`],
      });
    },
  });
};

export default useMarkCommentForDeletion;
