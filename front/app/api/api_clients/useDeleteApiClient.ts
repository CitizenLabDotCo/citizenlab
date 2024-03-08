import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import apiClientsKeys from './keys';

const deleteApiClient = (id: string) =>
  fetcher({
    path: `/api_clients/${id}`,
    action: 'delete',
  });

const useDeleteApiClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteApiClient,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: apiClientsKeys.lists(),
      });
    },
  });
};

export default useDeleteApiClient;
