import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import emailCampaignsKeys from './keys';

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
        queryKey: emailCampaignsKeys.lists(),
      });
    },
  });
};

export default useDeleteEmailCampaign;
