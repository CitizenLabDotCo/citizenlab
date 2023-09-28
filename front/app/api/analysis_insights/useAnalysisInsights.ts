import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import insightsKeys from './keys';
import { IInsights, InsightsKeys, IInsightsParams } from './types';

export const fetchInsights = ({ analysisId, bookmarked }: IInsightsParams) => {
  return fetcher<IInsights>({
    path: `/analyses/${analysisId}/insights`,
    action: 'get',
    queryParams: {
      bookmarked,
    },
  });
};

const useAnalysisInsights = (queryParams: IInsightsParams) => {
  return useQuery<IInsights, CLErrors, IInsights, InsightsKeys>({
    queryKey: insightsKeys.list(queryParams),
    queryFn: () => fetchInsights(queryParams),
  });
};

export default useAnalysisInsights;
