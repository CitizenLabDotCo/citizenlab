import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import reportsKeys from './keys';
import { ReportsResponse, ReportsKeys } from './types';

const fetchReports = () => {
  return fetcher<ReportsResponse>({
    path: '/reports',
    action: 'get',
  });
};

const useReports = () => {
  return useQuery<ReportsResponse, CLErrors, ReportsResponse, ReportsKeys>({
    queryKey: reportsKeys.lists(),
    queryFn: () => fetchReports(),
  });
};

export default useReports;
