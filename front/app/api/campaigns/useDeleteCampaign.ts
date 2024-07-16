import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignsKeys from './keys';

const deleteCampaign = (id: string) =>
  fetcher({
    path: `/campaigns/${id}`,
    action: 'delete',
  });

const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: campaignsKeys.lists(),
      });
    },
  });
};

export default useDeleteCampaign;
