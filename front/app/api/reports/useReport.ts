import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import reportsKeys from './keys';
import { ReportResponse, ReportsKeys } from './types';

const fetchReport = (id: string) =>
  fetcher<ReportResponse>({ path: `/reports/${id}`, action: 'get' });

const useReport = (id: string) => {
  return useQuery<ReportResponse, CLErrors, ReportResponse, ReportsKeys>({
    queryKey: reportsKeys.item({ id }),
    queryFn: () => fetchReport(id),
  });
};

export default useReport;
