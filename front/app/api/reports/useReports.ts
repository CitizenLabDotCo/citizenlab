import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import reportsKeys from './keys';
import { ReportsParams, ReportsResponse, ReportsKeys } from './types';

const fetchReports = (queryParams: ReportsParams) => {
  return fetcher<ReportsResponse>({
    path: '/reports',
    action: 'get',
    queryParams,
  });
};

const useReports = (queryParams: ReportsParams = {}) => {
  return useQuery<ReportsResponse, CLErrors, ReportsResponse, ReportsKeys>({
    queryKey: reportsKeys.list(queryParams),
    queryFn: () => fetchReports(queryParams),
  });
};

export default useReports;
