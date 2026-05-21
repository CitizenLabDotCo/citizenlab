import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import phasesKeys from './keys';
import { IPhaseMethodData, ParticipationMethod } from './types';

interface AddPhaseMethodArgs {
  phaseId: string;
  method_type: ParticipationMethod;
  start_at?: string | null;
  end_at?: string | null;
}

const addPhaseMethod = ({ phaseId, ...attrs }: AddPhaseMethodArgs) =>
  fetcher<{ data: IPhaseMethodData }>({
    path: `/phases/${phaseId}/phase_methods`,
    action: 'post',
    body: { phase_method: attrs },
  });

const useAddPhaseMethod = () => {
  const queryClient = useQueryClient();
  return useMutation<{ data: IPhaseMethodData }, CLErrors, AddPhaseMethodArgs>({
    mutationFn: addPhaseMethod,
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

export default useAddPhaseMethod;
