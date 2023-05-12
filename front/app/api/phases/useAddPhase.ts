import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import phasesKeys from './keys';
import projectsKeys from 'api/projects/keys';
import { IPhase, AddPhaseObject } from './types';

const addPhase = async ({ projectId, ...requestBody }: AddPhaseObject) =>
  fetcher<IPhase>({
    path: `/projects/${projectId}/phases`,
    action: 'post',
    body: { phase: requestBody },
  });

const useAddPhase = () => {
  const queryClient = useQueryClient();
  return useMutation<IPhase, CLErrors, AddPhaseObject>({
    mutationFn: addPhase,
    onSuccess: (response) => {
      const projectId = response.data.relationships.project.data.id;
      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ id: projectId }),
      });
      queryClient.invalidateQueries({
        queryKey: phasesKeys.list({ projectId }),
      });
    },
  });
};

export default useAddPhase;
