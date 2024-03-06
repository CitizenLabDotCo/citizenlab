import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import initiativesKeys from 'api/initiatives/keys';
import commentKeys from 'api/internal_comments/keys';
import userCommentsCount from 'api/user_comments_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { IInitiativeNewInternalComment, IInternalComment } from './types';

const addInternalCommentToInitiative = async ({
  initiativeId,
  ...requestBody
}: IInitiativeNewInternalComment) =>
  fetcher<IInternalComment>({
    path: `/initiatives/${initiativeId}/internal_comments`,
    action: 'post',
    body: { internal_comment: { ...requestBody } },
  });

const useAddInternalCommentToInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IInternalComment,
    CLErrorsWrapper,
    IInitiativeNewInternalComment
  >({
    mutationFn: addInternalCommentToInitiative,
    onSuccess: (_data, { initiativeId, author_id, parent_id }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ type: 'initiative', initiativeId }),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ type: 'author', authorId: author_id }),
      });
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.item({ id: initiativeId }),
      });
      queryClient.invalidateQueries({
        queryKey: userCommentsCount.items(),
      });

      if (parent_id) {
        queryClient.invalidateQueries({
          queryKey: commentKeys.list({ type: 'comment', commentId: parent_id }),
        });
      }
    },
  });
};

export default useAddInternalCommentToInitiative;
