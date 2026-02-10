import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import analyticsKeys from 'api/analytics/keys';
import ideasCountKeys from 'api/idea_count/keys';
import ideaImagesKeys from 'api/idea_images/keys';
import ideaMarkersKeys from 'api/idea_markers/keys';
import ideaFilterCountsKeys from 'api/ideas_filter_counts/keys';
import meKeys from 'api/me/keys';
import projectsKeys from 'api/projects/keys';
import submissionsCountKeys from 'api/submission_count/keys';
import userIdeaCountKeys from 'api/user_ideas_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import { storeClaimToken } from '../../utils/claimToken';

import ideasKeys from './keys';
import { IIdea, IIdeaAdd } from './types';

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
      const { claim_token } = idea.data.attributes;

      if (claim_token) {
        storeClaimToken(claim_token);
      }

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
      queryClient.invalidateQueries({
        queryKey: submissionsCountKeys.items(),
      });
      queryClient.invalidateQueries({
        queryKey: meKeys.all(),
      });

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
