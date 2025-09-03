import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import internalCommentKeys from './keys';
import { IInternalComment, IUpdatedInternalComment } from './types';

const updateInternalComment = async ({
  commentId,
  ...requestBody
}: IUpdatedInternalComment) =>
  fetcher<IInternalComment>({
    path: `/internal_comments/${commentId}`,
    action: 'patch',
    body: { internal_comment: requestBody },
  });

const useUpdateInternalComment = ({ ideaId }: { ideaId?: string }) => {
  const queryClient = useQueryClient();
  return useMutation<
    IInternalComment,
    CLErrorsWrapper,
    IUpdatedInternalComment
  >({
    mutationFn: updateInternalComment,
    onSuccess: () => {
      if (ideaId) {
        queryClient.invalidateQueries({
          queryKey: internalCommentKeys.list({
            type: 'idea',
            ideaId,
          }),
        });
      }
    },
  });
};

export default useUpdateInternalComment;
