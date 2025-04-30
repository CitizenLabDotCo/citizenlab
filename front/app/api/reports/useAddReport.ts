import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import phasesKeys from 'api/phases/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import reportsKeys from './keys';
import { ReportResponse } from './types';

export type AddReport =
  | {
      name: string;
      phase_id?: null;
    }
  | {
      name?: null;
      phase_id: string;
    }
  | {
      // For the Community Monitor, we want to send both.
      name: string;
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.lists() });

      const phaseId = data.data.relationships.phase?.data?.id;

      if (phaseId) {
        queryClient.invalidateQueries({
          queryKey: phasesKeys.item({ phaseId }),
        });
      }
    },
  });
};

export default useAddReport;
