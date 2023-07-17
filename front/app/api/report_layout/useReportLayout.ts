import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import reportLayoutKeys from './keys';
import { ReportLayoutResponse, ReportLayoutKeys } from './types';

const fetchReportLayout = (id: string) =>
  fetcher<ReportLayoutResponse>({
    path: `/reports/${id}/layout`,
    action: 'get',
  });

const useReportLayout = (id: string) => {
  return useQuery<
    ReportLayoutResponse,
    CLErrors,
    ReportLayoutResponse,
    ReportLayoutKeys
  >({
    queryKey: reportLayoutKeys.item({ id }),
    queryFn: () => fetchReportLayout(id),
  });
};

export default useReportLayout;
