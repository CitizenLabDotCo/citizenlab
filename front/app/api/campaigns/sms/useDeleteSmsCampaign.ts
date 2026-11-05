import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import smsCampaignsKeys from './keys';

const deleteSmsCampaign = (id: string) =>
  fetcher({
    path: `/campaigns/${id}`,
    action: 'delete',
  });

const useDeleteSmsCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSmsCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: smsCampaignsKeys.lists(),
      });
    },
  });
};

export default useDeleteSmsCampaign;
