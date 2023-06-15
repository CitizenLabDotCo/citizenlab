import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import commentKeys from './keys';
import { IComment } from './types';
import userCommentsCount from 'api/user_comments_count/keys';

interface MarkForDeletion {
  commentId: string;
  authorId?: string;
  projectId?: string | null;
}

const markForDeletion = async ({ commentId }: MarkForDeletion) => {
  return fetcher<IComment>({
    path: `/comments/${commentId}/mark_as_deleted`,
    action: 'delete',
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
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({
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

export default useMarkCommentForDeletion;
