import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import reportsKeys from './keys';
import phasesKeys from 'api/phases/keys';
import { ReportResponse } from './types';

type UpdateReport = {
  id: string;
  visible: boolean;
};

const updateReport = async ({ id, visible }: UpdateReport) =>
  fetcher<ReportResponse>({
    path: `/reports/${id}`,
    action: 'patch',
    body: { report: { visible } },
  });

const useUpdateReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ReportResponse, CLErrors, UpdateReport>({
    mutationFn: updateReport,
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

export default useUpdateReport;
