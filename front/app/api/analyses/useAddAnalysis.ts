import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import analysesKeys from './keys';
import { IAnalysis, IAddAnalysis } from './types';

const addAnalysis = async (requestBody: IAddAnalysis) =>
  fetcher<IAnalysis>({
    path: '/analyses',
    action: 'post',
    body: {
      analysis: {
        project_id: requestBody.projectId,
        phase_id: requestBody.phaseId,
        custom_field_ids: requestBody.customFieldIds,
      },
    },
  });

const useAddAnalysis = () => {
  const queryClient = useQueryClient();
  return useMutation<IAnalysis, CLErrors, IAddAnalysis>({
    mutationFn: addAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analysesKeys.lists() });
    },
  });
};

export default useAddAnalysis;
