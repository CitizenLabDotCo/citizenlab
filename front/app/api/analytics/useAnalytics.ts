import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher, { BaseResponseData } from 'utils/cl-react-query/fetcher';
import analyticsKeys from './keys';
import { Query } from './types';
import { useEffect } from 'react';

const fetchAnalytics = <Response extends BaseResponseData>(query: Query) =>
  fetcher<Response>({
    path: `/analytics`,
    action: 'get',
    queryParams: query,
  });

const useAnalytics = <Response extends BaseResponseData>(
  query: Query,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  // Call onSuccess if the query is already in the cache
  useEffect(() => {
    const queryKey = analyticsKeys.item(query);
    if (queryClient.getQueryData(queryKey)) {
      onSuccess && onSuccess();
    }
  }, [query, queryClient, onSuccess]);

  return useQuery<Response, CLErrors, Response, any>({
    queryKey: analyticsKeys.item(query),
    queryFn: () => fetchAnalytics(query),
    onSuccess,
  });
};

export default useAnalytics;
