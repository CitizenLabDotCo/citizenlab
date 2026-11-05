import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import summariesKeys from './keys';
import { ISummary, SummariesKeys, ISummaryParams } from './types';

const fetchSummary = ({ analysisId, id }: ISummaryParams) => {
  return fetcher<ISummary>({
    path: `/analyses/${analysisId}/summaries/${id}`,
    action: 'get',
  });
};

const useAnalysisSummary = (params: ISummaryParams) => {
  return useQuery<ISummary, CLErrors, ISummary, SummariesKeys>({
    queryKey: summariesKeys.item({ id: params.id }),
    queryFn: () => fetchSummary(params),
    enabled: !!params.id && !!params.analysisId,
  });
};

export default useAnalysisSummary;
