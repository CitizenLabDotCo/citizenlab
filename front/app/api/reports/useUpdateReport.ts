import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import phasesKeys from 'api/phases/keys';
import reportLayoutKeys from 'api/report_layout/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import reportsKeys from './keys';
import { ReportResponse } from './types';

type UpdateReport = {
  id: string;
  visible?: boolean;
  name?: string;
};

const updateReport = async ({ id, ...requestBody }: UpdateReport) =>
  fetcher<ReportResponse>({
    path: `/reports/${id}`,
    action: 'patch',
    body: { report: requestBody },
  });

const useUpdateReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ReportResponse, CLErrors, UpdateReport>({
    mutationFn: updateReport,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reportsKeys.lists() });

      const layoutId = data.data.relationships.layout.data.id;
      queryClient.invalidateQueries({
        queryKey: reportLayoutKeys.item({ id: layoutId }),
      });

      const phaseId = data.data.relationships.phase?.data?.id;

      if (phaseId) {
        queryClient.invalidateQueries({
          queryKey: phasesKeys.item({ phaseId }),
        });
      }
    },
  });
};

export default useUpdateReport;
