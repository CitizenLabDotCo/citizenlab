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
  onSuccess?: () => void,
  enabled = true
) => {
  const queryClient = useQueryClient();
  const stringifiedQuery = JSON.stringify(query);

  // Call onSuccess if the query is already in the cache
  useEffect(() => {
    const parsedQuery = JSON.parse(stringifiedQuery);
    const queryKey = analyticsKeys.item(parsedQuery);
    if (queryClient.getQueryData(queryKey)) {
      onSuccess && onSuccess();
    }
  }, [stringifiedQuery, queryClient, onSuccess]);

  return useQuery<Response, CLErrors, Response, any>({
    queryKey: analyticsKeys.item(query),
    queryFn: () => fetchAnalytics(query),
    onSuccess,
    enabled,
  });
};

export default useAnalytics;
