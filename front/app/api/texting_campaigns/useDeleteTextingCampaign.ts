import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import textingCampaignsKeys from './keys';

const deleteTextingCampaign = (id: string) =>
  fetcher({
    path: `/texting_campaigns/${id}`,
    action: 'delete',
  });

const useDeleteTextingCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTextingCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: textingCampaignsKeys.lists(),
      });
    },
  });
};

export default useDeleteTextingCampaign;
