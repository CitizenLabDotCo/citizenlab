import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import commentKeys from './keys';
import { IComment, IUpdatedComment } from './types';

const updateComment = async ({ commentId, ...requestBody }: IUpdatedComment) =>
  fetcher<IComment>({
    path: `/comments/${commentId}`,
    action: 'patch',
    body: { comment: requestBody },
  });

const useUpdateComment = ({
  ideaId,
  initiativeId,
}: {
  ideaId?: string;
  initiativeId?: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation<IComment, CLErrors, IUpdatedComment>({
    mutationFn: updateComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({
          ideaId,
          initiativeId,
        }),
      });
    },
  });
};

export default useUpdateComment;
