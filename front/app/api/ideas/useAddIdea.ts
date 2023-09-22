import { useMutation, useQueryClient } from '@tanstack/react-query';
import ideaFilterCountsKeys from 'api/ideas_filter_counts/keys';
import ideasCountKeys from 'api/idea_count/keys';
import ideaImagesKeys from 'api/idea_images/keys';
import ideaMarkersKeys from 'api/idea_markers/keys';
import userIdeaCountKeys from 'api/user_ideas_count/keys';
import projectsKeys from 'api/projects/keys';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasKeys from './keys';
import { IIdea, IIdeaAdd } from './types';
import analyticsKeys from 'api/analytics/keys';

const addIdea = async (requestBody: IIdeaAdd) =>
  fetcher<IIdea>({
    path: `/ideas`,
    action: 'post',
    body: { idea: requestBody },
  });

const useAddIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdea, CLErrors, IIdeaAdd>({
    mutationFn: addIdea,
    onSuccess: (idea) => {
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ideaMarkersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ideaFilterCountsKeys.all() });
      queryClient.invalidateQueries({ queryKey: ideasCountKeys.items() });
      queryClient.invalidateQueries({ queryKey: userIdeaCountKeys.items() });
      queryClient.invalidateQueries({
        queryKey: ideaImagesKeys.list({ ideaId: idea.data.id }),
      });
      queryClient.invalidateQueries({
        queryKey: ideaImagesKeys.items(),
      });

      const projectId = idea.data.relationships?.project.data.id;

      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: projectsKeys.item({ id: projectId }),
        });
      }

      queryClient.invalidateQueries({
        queryKey: analyticsKeys.all(),
      });
    },
  });
};

export default useAddIdea;
