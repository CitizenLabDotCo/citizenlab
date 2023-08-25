import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { ISummaryPreCheck, ISummaryPreCheckAdd } from './types';

const addAnalysisSummaryPreCheck = async ({
  analysisId,
  filters,
}: ISummaryPreCheckAdd) =>
  fetcher<ISummaryPreCheck>({
    path: `/analyses/${analysisId}/summaries/pre_check`,
    action: 'post',
    body: { summary: { filters } },
  });

const useAddAnalysisSummaryPreCheck = () => {
  return useMutation<ISummaryPreCheck, CLErrors, ISummaryPreCheckAdd>({
    mutationFn: addAnalysisSummaryPreCheck,
  });
};

export default useAddAnalysisSummaryPreCheck;
