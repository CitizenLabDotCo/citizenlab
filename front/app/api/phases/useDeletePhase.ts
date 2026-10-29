import { useMutation, useQueryClient } from '@tanstack/react-query';

import projectsKeys from 'api/projects/keys';
import projectsMiniAdminKeys from 'api/projects_mini_admin/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import phasesKeys from './keys';

const deletePhase = async ({
  phaseId,
}: {
  projectId: string;
  phaseId: string;
}) =>
  fetcher({
    path: `/phases/${phaseId}`,
    action: 'delete',
  });

const useDeletePhase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePhase,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ id: variables.projectId }),
      });
      queryClient.invalidateQueries({
        queryKey: phasesKeys.list({ projectId: variables.projectId }),
      });
      queryClient.invalidateQueries({
        queryKey: projectsMiniAdminKeys.lists(),
      });
    },
  });
};

export default useDeletePhase;
