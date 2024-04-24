import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import analyticsKeys from 'api/analytics/keys';
import ideasCountKeys from 'api/idea_count/keys';
import ideaImagesKeys from 'api/idea_images/keys';
import ideaMarkersKeys from 'api/idea_markers/keys';
import ideaFilterCountsKeys from 'api/ideas_filter_counts/keys';
import { importedIdeasKeys } from 'api/import_ideas/keys';
import projectsKeys from 'api/projects/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasKeys from './keys';
import { IIdea, IIdeaUpdate } from './types';

type IUpdateIdeaObject = {
  id: string;
  requestBody: IIdeaUpdate;
};

const updateIdea = ({ id, requestBody }: IUpdateIdeaObject) =>
  fetcher<IIdea>({
    path: `/ideas/${id}`,
    action: 'patch',
    body: { idea: requestBody },
  });

const useUpdateIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdea, CLErrors, IUpdateIdeaObject>({
    mutationFn: updateIdea,
    onSuccess: (idea, attributes) => {
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ideaMarkersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ideaFilterCountsKeys.all() });
      queryClient.invalidateQueries({ queryKey: ideasCountKeys.items() });
      queryClient.invalidateQueries({
        queryKey: ideaImagesKeys.list({ ideaId: idea.data.id }),
      });
      queryClient.invalidateQueries({
        queryKey: ideaImagesKeys.items(),
      });

      const projectId = idea.data.relationships?.project.data.id;
      const phases = idea.data.relationships?.phases;
      const phaseIds = phases?.data?.map((phase) => phase.id);

      // If the idea is a draft, we need to invalidate the cached draft idea
      if (phaseIds && attributes.requestBody.publication_status === 'draft') {
        phaseIds.forEach((phaseId) => {
          queryClient.invalidateQueries({
            queryKey: ideasKeys.item({ id: phaseId }),
          });
        });
      }

      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: projectsKeys.item({ id: projectId }),
        });

        queryClient.invalidateQueries({
          queryKey: importedIdeasKeys.list({ projectId }),
        });
      }
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.all(),
      });
    },
  });
};

export default useUpdateIdea;
