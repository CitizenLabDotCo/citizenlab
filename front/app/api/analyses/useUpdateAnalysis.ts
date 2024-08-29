import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import inputsKeys from 'api/analysis_inputs/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import analysesKeys from './keys';
import { IAnalysis } from './types';

type IAnalysisUpdate = {
  id: string;
  show_insights?: boolean;
  additional_custom_field_ids?: string[];
};

const updateAnalysis = ({
  id,
  show_insights,
  additional_custom_field_ids,
}: IAnalysisUpdate) =>
  fetcher<IAnalysis>({
    path: `/analyses/${id}`,
    action: 'patch',
    body: { analysis: { show_insights, additional_custom_field_ids } },
  });

const useUpdateAnalysis = () => {
  const queryClient = useQueryClient();
  return useMutation<IAnalysis, CLErrorsWrapper, IAnalysisUpdate>({
    mutationFn: updateAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analysesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inputsKeys.lists() });
    },
  });
};

export default useUpdateAnalysis;
