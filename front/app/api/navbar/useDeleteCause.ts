import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import causesKeys from './keys';

const deleteCause = (id: string) =>
  fetcher({
    path: `/causes/${id}`,
    action: 'delete',
  });

const useDeleteCause = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCause,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: causesKeys.lists(),
      });
    },
  });
};

export default useDeleteCause;
