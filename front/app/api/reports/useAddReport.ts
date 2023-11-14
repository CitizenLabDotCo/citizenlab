import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import reportsKeys from './keys';
// import phasesKeys from 'api/phases/keys';
import { ReportResponse } from './types';

type AddReport =
  | {
      name: string;
      phase_id?: never;
    }
  | {
      name?: never;
      phase_id: string;
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
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.lists() });
      // TOOD figure out what report response looks like and invalidate correct phase
      // console.log(data.data.relationships.)
    },
  });
};

export default useAddReport;
