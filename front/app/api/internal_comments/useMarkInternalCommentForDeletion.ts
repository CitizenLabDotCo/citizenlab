import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import internalCommentKeys from './keys';
import { IInternalComment } from './types';
import userCommentsCount from 'api/user_comments_count/keys';

interface MarkForDeletion {
  commentId: string;
  authorId?: string;
  projectId?: string | null;
}

const markInternalCommentForDeletion = async ({
  commentId,
}: MarkForDeletion) => {
  return fetcher<IInternalComment>({
    path: `/comments/${commentId}/mark_as_deleted`,
    action: 'delete',
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
  return useMutation<IInternalComment, CLErrors, MarkForDeletion>({
    mutationFn: markInternalCommentForDeletion,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: internalCommentKeys.list({
          ideaId,
          initiativeId,
        }),
      });

      queryClient.invalidateQueries({
        queryKey: userCommentsCount.items(),
      });
    },
  });
};

export default useMarkInternalCommentForDeletion;
