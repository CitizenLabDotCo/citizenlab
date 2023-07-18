import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import reportsKeys from './keys';

const deleteReport = (id: string) =>
  fetcher({
    path: `/reports/${id}`,
    action: 'delete',
  });

const useDeletereport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reportsKeys.lists(),
      });
    },
  });
};

export default useDeletereport;
