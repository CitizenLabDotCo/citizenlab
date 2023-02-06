import { useQueryClient, useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import inputKeys from './keys';
import { IInsightsInputs, QueryParameters, InputKeys } from './types';

export const defaultPageSize = 20;

const fetchInputs = (
  viewId: string,
  { pageNumber, pageSize, category, ...queryParams }: QueryParameters
) =>
  fetcher<IInsightsInputs>({
    path: `/insights/views/${viewId}/inputs`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || defaultPageSize,
      categories: typeof category === 'string' ? [category] : undefined,
      ...queryParams,
    },
  });

const useInputs = (viewId: string, queryParams: QueryParameters) => {
  const queryClient = useQueryClient();

  const prefetchParams = {
    ...queryParams,
    pageNumber: queryParams.pageNumber + 1,
  };
  queryClient.prefetchQuery({
    queryKey: inputKeys.list(viewId, prefetchParams),
    queryFn: () => fetchInputs(viewId, prefetchParams),
  });

  return useQuery<IInsightsInputs, CLErrors, IInsightsInputs, InputKeys>({
    queryKey: inputKeys.list(viewId, queryParams),
    queryFn: () => fetchInputs(viewId, queryParams),
  });
};

export default useInputs;
