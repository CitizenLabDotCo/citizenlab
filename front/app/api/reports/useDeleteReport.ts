import { useMutation, useQueryClient } from '@tanstack/react-query';

import phasesKeys from 'api/phases/keys';
import reportLayoutKeys from 'api/report_layout/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import reportsKeys from './keys';

const deleteReport = (id: string) =>
  fetcher({
    path: `/reports/${id}`,
    action: 'delete',
  });

const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReport,
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({
        queryKey: phasesKeys.all(),
      });

      queryClient.invalidateQueries({
        queryKey: reportsKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: reportLayoutKeys.all(),
      });

      queryClient.resetQueries({
        queryKey: reportsKeys.item({ id }),
      });
    },
  });
};

export default useDeleteReport;
