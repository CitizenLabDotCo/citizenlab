import { useMutation, useQueryClient } from '@tanstack/react-query';

import analyticsKeys from 'api/analytics/keys';
import ideaImagesKeys from 'api/idea_images/keys';
import ideaMarkersKeys from 'api/idea_markers/keys';
import ideaFilterCountsKeys from 'api/ideas_filter_counts/keys';
import { importedIdeasKeys } from 'api/import_ideas/keys';
import projectsKeys from 'api/projects/keys';
import userIdeaCountKeys from 'api/user_ideas_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

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
      queryClient.invalidateQueries({ queryKey: ideaFilterCountsKeys.all() });
      queryClient.invalidateQueries({ queryKey: ideaFilterCountsKeys.items() });
      queryClient.invalidateQueries({ queryKey: userIdeaCountKeys.items() });
      queryClient.invalidateQueries({
        queryKey: ideaImagesKeys.list({ ideaId }),
      });
      queryClient.invalidateQueries({
        queryKey: ideaImagesKeys.items(),
      });
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: importedIdeasKeys.all(),
      });
    },
  });
};

export default useDeleteIdea;
