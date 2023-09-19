import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import areaKeys from './keys';
import { ReportResponse } from './types';

type AddReport = {
  name: string;
};

const addReport = async (requestBody: AddReport) =>
  fetcher<ReportResponse>({
    path: '/reports',
    action: 'post',
    body: { report: requestBody },
  });

const useAddReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ReportResponse, CLErrors, AddReport>({
    mutationFn: addReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.lists() });
    },
  });
};

export default useAddReport;
