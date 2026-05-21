import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import phasesKeys from './keys';

interface DeleteArgs {
  phaseId: string;
  phaseMethodId: string;
}

const deletePhaseMethod = ({ phaseId, phaseMethodId }: DeleteArgs) =>
  fetcher({
    path: `/phases/${phaseId}/phase_methods/${phaseMethodId}`,
    action: 'delete',
  });

const useDeletePhaseMethod = () => {
  const queryClient = useQueryClient();
  return useMutation<unknown, CLErrors, DeleteArgs>({
    mutationFn: deletePhaseMethod,
    onSuccess: (_data, { phaseId }) => {
      queryClient.invalidateQueries({
        queryKey: [
          {
            type: 'phase',
            operation: 'with_methods',
            parameters: { id: phaseId },
          },
        ],
      });
      queryClient.invalidateQueries({
        queryKey: phasesKeys.item({ phaseId }),
      });
    },
  });
};

export default useDeletePhaseMethod;
