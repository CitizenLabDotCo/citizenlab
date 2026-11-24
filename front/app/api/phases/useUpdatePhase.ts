import { useMutation, useQueryClient } from '@tanstack/react-query';

import emailCampaignsKeys from 'api/campaigns/email/keys';
import projectsKeys from 'api/projects/keys';
import supportedCampaignNamesKeys from 'api/supported_campaign_names/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import phasesKeys from './keys';
import { IPhase, UpdatePhaseObject, PhaseUpdateError } from './types';

const updatePhase = async ({ phaseId, ...requestBody }: UpdatePhaseObject) =>
  fetcher<IPhase>({
    path: `/phases/${phaseId}`,
    action: 'patch',
    body: { phase: requestBody },
  });

const useUpdatePhase = () => {
  const queryClient = useQueryClient();
  return useMutation<IPhase, PhaseUpdateError, UpdatePhaseObject>({
    mutationFn: updatePhase,
    onSuccess: async (data, variables) => {
      const projectId = data.data.relationships.project.data.id;
      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ id: projectId }),
      });
      queryClient.invalidateQueries({
        queryKey: phasesKeys.list({ projectId }),
      });
      const phaseRefreshes = Promise.all([
        queryClient.invalidateQueries({
          queryKey: phasesKeys.item({ phaseId: variables.phaseId }),
        }),
        ...(variables.timeline_phase_dates?.map(({ id }) =>
          queryClient.invalidateQueries({
            queryKey: phasesKeys.item({ phaseId: id }),
          })
        ) ?? []),
      ]);
      // Moves reset their forms from fresh dates; ordinary edits refresh in the background.
      if (
        variables.placement_type !== undefined ||
        variables.timeline_phase_dates?.length
      ) {
        await phaseRefreshes;
      }
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
