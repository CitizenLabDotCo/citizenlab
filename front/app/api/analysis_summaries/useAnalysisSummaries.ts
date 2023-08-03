import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import summariesKeys from './keys';
import { ISummaries, SummariesKeys, ISummaryParams } from './types';

const fetchSummaries = ({ analysisId }: ISummaryParams) => {
  return fetcher<ISummaries>({
    path: `/analyses/${analysisId}/summaries`,
    action: 'get',
  });
};

const useAnalysisSummaries = (queryParams: ISummaryParams) => {
  return useQuery<ISummaries, CLErrors, ISummaries, SummariesKeys>({
    queryKey: summariesKeys.list(queryParams),
    queryFn: () => fetchSummaries(queryParams),
  });
};

export default useAnalysisSummaries;
