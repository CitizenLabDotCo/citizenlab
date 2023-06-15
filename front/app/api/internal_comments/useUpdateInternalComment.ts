import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import internalCommentKeys from './keys';
import { IInternalComment, IUpdatedInternalComment } from './types';

const updateInternalComment = async ({
  commentId,
  ...requestBody
}: IUpdatedInternalComment) =>
  fetcher<IInternalComment>({
    path: `/comments/${commentId}`,
    action: 'patch',
    body: { comment: requestBody },
  });

const useUpdateInternalComment = ({
  ideaId,
  initiativeId,
}: {
  ideaId?: string;
  initiativeId?: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation<IInternalComment, CLErrors, IUpdatedInternalComment>({
    mutationFn: updateInternalComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: internalCommentKeys.list({
          ideaId,
          initiativeId,
        }),
      });
    },
  });
};

export default useUpdateInternalComment;
