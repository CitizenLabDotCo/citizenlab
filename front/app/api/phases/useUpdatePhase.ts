import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import emailCampaignsKeys from 'api/campaigns/email/keys';
import projectsKeys from 'api/projects/keys';
import supportedCampaignNamesKeys from 'api/supported_campaign_names/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import phasesKeys from './keys';
import { IPhase, UpdatePhaseObject } from './types';

const updatePhase = async ({ phaseId, ...requestBody }: UpdatePhaseObject) =>
  fetcher<IPhase>({
    path: `/phases/${phaseId}`,
    action: 'patch',
    body: { phase: requestBody },
  });

const useUpdatePhase = () => {
  const queryClient = useQueryClient();
  return useMutation<IPhase, { errors: CLErrors }, UpdatePhaseObject>({
    mutationFn: updatePhase,
    onSuccess: async (data, variables) => {
      const projectId = data.data.relationships.project.data.id;
      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ id: projectId }),
      });
      queryClient.invalidateQueries({
        queryKey: phasesKeys.list({ projectId }),
      });
      await queryClient.invalidateQueries({
        queryKey: phasesKeys.item({ phaseId: variables.phaseId }),
      });
      await Promise.all(
        variables.timeline_phase_dates?.map(({ id }) =>
          queryClient.invalidateQueries({
            queryKey: phasesKeys.item({ phaseId: id }),
          })
        ) ?? []
      );
      queryClient.invalidateQueries({ queryKey: emailCampaignsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: supportedCampaignNamesKeys.lists({
          phaseId: variables.phaseId,
        }),
      });
    },
  });
};

export default useUpdatePhase;
