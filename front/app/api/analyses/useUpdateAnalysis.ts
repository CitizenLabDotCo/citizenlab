import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import analysesKeys from './keys';
import { IAnalysis } from './types';

type IAnalysisUpdate = {
  id: string;
  show_insights: boolean;
};

const updateAnalysis = ({ id, show_insights }: IAnalysisUpdate) =>
  fetcher<IAnalysis>({
    path: `/analyses/${id}`,
    action: 'patch',
    body: { show_insights },
  });

const useUpdateAnalysis = () => {
  const queryClient = useQueryClient();
  return useMutation<IAnalysis, CLErrorsWrapper, IAnalysisUpdate>({
    mutationFn: updateAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analysesKeys.lists() });
    },
  });
};

export default useUpdateAnalysis;
