import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import statsKeys from './keys';
import { IInsightsStats, QueryParameters, StatsKeys } from './types';

const fetchStat = (viewId: string, queryParams: QueryParameters) =>
  fetcher<IInsightsStats>({
    path: `/insights/views/${viewId}/stats/inputs_count`,
    action: 'get',
    queryParams,
  });

const useStat = (viewId: string, queryParams: QueryParameters) => {
  return useQuery<IInsightsStats, CLErrors, IInsightsStats, StatsKeys>({
    queryKey: statsKeys.item(viewId, queryParams),
    queryFn: () => fetchStat(viewId, queryParams),
  });
};

export default useStat;
