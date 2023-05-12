import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import phasesKeys from './keys';
import projectsKeys from 'api/projects/keys';
import { IPhase, UpdatePhaseObject } from './types';

const updatePhase = async ({ phaseId, ...requestBody }: UpdatePhaseObject) =>
  fetcher<IPhase>({
    path: `/phases/${phaseId}`,
    action: 'patch',
    body: { phase: requestBody },
  });

const useUpdatePhase = () => {
  const queryClient = useQueryClient();
  return useMutation<IPhase, CLErrors, UpdatePhaseObject>({
    mutationFn: updatePhase,
    onSuccess: (data, variables) => {
      const projectId = data.data.relationships.project.data.id;
      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ id: projectId }),
      });
      queryClient.invalidateQueries({
        queryKey: phasesKeys.list({ projectId }),
      });
      queryClient.invalidateQueries({
        queryKey: phasesKeys.item({ phaseId: variables.phaseId }),
      });
    },
  });
};

export default useUpdatePhase;
