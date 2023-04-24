import { useMutation, useQueryClient } from '@tanstack/react-query';
import commentKeys from 'api/comments/keys';
import initiativesKeys from 'api/initiatives/keys';
import { API_PATH } from 'containers/App/constants';
import { CLErrorsJSON } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
import { INewComment, IComment } from './types';

const addCommentToInitiative = async ({
  initiativeId,
  ...requestBody
}: INewComment) =>
  fetcher<IComment>({
    path: `/initiatives/${initiativeId}/comments`,
    action: 'post',
    body: { comment: { ...requestBody } },
  });

const useAddCommentToInitiative = () => {
  const queryClient = useQueryClient();
  return useMutation<IComment, CLErrorsJSON, INewComment>({
    mutationFn: addCommentToInitiative,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ initiativeId: variables.initiativeId }),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ userId: variables.author_id }),
      });
      queryClient.invalidateQueries({
        queryKey: initiativesKeys.item({ id: variables.initiativeId }),
      });

      if (variables.parent_id) {
        queryClient.invalidateQueries({
          queryKey: commentKeys.list({ commentId: variables.parent_id }),
        });
      }

      streams.fetchAllWith({
        apiEndpoint: [
          `${API_PATH}/users/${variables.author_id}/comments_count`,
        ],
      });
    },
  });
};

export default useAddCommentToInitiative;
