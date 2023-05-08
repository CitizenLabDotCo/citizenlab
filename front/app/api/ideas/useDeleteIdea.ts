import { useMutation, useQueryClient } from '@tanstack/react-query';
import ideaFilterCountsKeys from 'api/ideas_filter_counts/keys';
import ideasCountKeys from 'api/idea_count/keys';
import userIdeaCountKeys from 'api/user_ideas_count/keys';
import ideaImagesKeys from 'api/idea_images/keys';
import ideaMarkersKeys from 'api/idea_markers/keys';
import { API_PATH } from 'containers/App/constants';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
import ideasKeys from './keys';
import projectsKeys from 'api/projects/keys';

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
      queryClient.invalidateQueries({ queryKey: ideaFilterCountsKeys.all() });
      queryClient.invalidateQueries({ queryKey: ideasCountKeys.items() });
      queryClient.invalidateQueries({ queryKey: userIdeaCountKeys.items() });
      queryClient.invalidateQueries({
        queryKey: ideaImagesKeys.list({ ideaId }),
      });
      queryClient.invalidateQueries({
        queryKey: ideaImagesKeys.item({ ideaId }),
      });
      queryClient.invalidateQueries({ queryKey: projectsKeys.all() });
      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/analytics`],
      });
    },
  });
};

export default useDeleteIdea;
