import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignsKeys from './keys';

const deleteEmailCampaign = (id: string) =>
  fetcher({
    path: `/campaigns/${id}`,
    action: 'delete',
  });

const useDeleteEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: campaignsKeys.lists(),
      });
    },
  });
};

export default useDeleteEmailCampaign;
