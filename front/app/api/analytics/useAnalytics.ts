import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher, { BaseResponseData } from 'utils/cl-react-query/fetcher';
import analyticsKeys from './keys';
import { Query } from './types';

const fetchAnalytics = <Response extends BaseResponseData>(query: Query) =>
  fetcher<Response>({
    path: `/analytics`,
    action: 'get',
    queryParams: query,
  });

const useAnalytics = <Response extends BaseResponseData>(query: Query) => {
  return useQuery<Response, CLErrors, Response, any>({
    queryKey: analyticsKeys.item(query),
    queryFn: () => fetchAnalytics(query),
  });
};

export default useAnalytics;
