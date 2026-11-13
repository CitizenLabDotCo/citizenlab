import { useMutation, useQueryClient } from '@tanstack/react-query';

import volunteersKeys from 'api/volunteers/keys';

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
      queryClient.invalidateQueries({
        queryKey: volunteersKeys.lists(),
      });
    },
  });
};

export default useDeleteCause;
