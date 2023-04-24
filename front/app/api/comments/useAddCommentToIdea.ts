import { useMutation, useQueryClient } from '@tanstack/react-query';
import commentKeys from 'api/comments/keys';
import ideasKeys from 'api/ideas/keys';
import { API_PATH } from 'containers/App/constants';
import { CLErrorsJSON } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
import { INewComment, IComment } from './types';

const addCommentToIdea = async ({ ideaId, ...requestBody }: INewComment) =>
  fetcher<IComment>({
    path: `/ideas/${ideaId}/comments`,
    action: 'post',
    body: { comment: { ...requestBody } },
  });

const useAddCommentToIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IComment, CLErrorsJSON, INewComment>({
    mutationFn: addCommentToIdea,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ userId: variables.author_id }),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.list({ ideaId: variables.ideaId }),
      });
      queryClient.invalidateQueries({
        queryKey: ideasKeys.item({ id: variables.ideaId }),
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

export default useAddCommentToIdea;
