import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import commentKeys from './keys';
import { IComment, IUpdatedComment } from './types';

const updateComment = async ({ commentId, ...requestBody }: IUpdatedComment) =>
  fetcher<IComment>({
    path: `/comments/${commentId}`,
    action: 'patch',
    body: { comment: requestBody },
  });

const useUpdateComment = ({ ideaId }: { ideaId?: string }) => {
  const queryClient = useQueryClient();
  return useMutation<IComment, CLErrorsWrapper, IUpdatedComment>({
    mutationFn: updateComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({
          ideaId,
        }),
      });
    },
  });
};

export default useUpdateComment;
