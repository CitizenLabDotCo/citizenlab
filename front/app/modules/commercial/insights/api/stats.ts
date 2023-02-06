import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';

export const statsKeys = {
  all: () => [{ type: 'inputs_stat' }] as const,
  details: () => [{ ...statsKeys.all()[0], entity: 'detail' }] as const,
  detail: (viewId: string, filters: QueryParameters) =>
    [{ ...statsKeys.all()[0], entity: 'detail', viewId, ...filters }] as const,
};

export type QueryParameters = {
  categories?: string[];
  keywords?: string[];
  search?: string;
  processed?: boolean;
};

type StatsKeys = ReturnType<typeof statsKeys[keyof typeof statsKeys]>;

type IInsightsStats = {
  data: {
    count: number;
    type: 'inputs_stat';
  };
};

const fetchStat = (viewId: string, queryParams: QueryParameters) =>
  fetcher<IInsightsStats>({
    path: `/insights/views/${viewId}/stats/inputs_count`,
    action: 'get',
    queryParams,
  });

export const useStat = (viewId: string, queryParams: QueryParameters) => {
  return useQuery<IInsightsStats, CLErrors, IInsightsStats, StatsKeys>({
    queryKey: statsKeys.detail(viewId, queryParams),
    queryFn: () => fetchStat(viewId, queryParams),
  });
};
