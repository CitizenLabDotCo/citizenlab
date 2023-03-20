import { useMutation, useQueryClient } from '@tanstack/react-query';
import ideaMarkersKeys from 'api/idea_markers/keys';
import { API_PATH } from 'containers/App/constants';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
import ideasKeys from './keys';

const deleteIdea = (id: string) =>
  fetcher({
    path: `/ideas/${id}`,
    action: 'delete',
  });

const useDeleteIdea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIdea,
    onSuccess: (_data, ideaId) => {
      queryClient.invalidateQueries({
        queryKey: ideasKeys.lists(),
      });
      queryClient.invalidateQueries({ queryKey: ideaMarkersKeys.lists() });
      streams.fetchAllWith({
        apiEndpoint: [
          `${API_PATH}/projects`,
          `${API_PATH}/stats/ideas_count`,
          `${API_PATH}/analytics`,
        ],
        partialApiEndpoint: [`${API_PATH}/ideas/${ideaId}/images`],
      });
    },
  });
};

export default useDeleteIdea;
