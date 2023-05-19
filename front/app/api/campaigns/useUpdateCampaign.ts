import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import campaignsKeys from './keys';
import { ICampaign, IUpdateCampaignProperties } from './types';

const updateCampaign = async ({
  id: campaignId,
  campaign,
}: IUpdateCampaignProperties) =>
  fetcher<ICampaign>({
    path: `/campaigns/${campaignId}`,
    action: 'patch',
    body: campaign,
  });

const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<ICampaign, CLErrors, IUpdateCampaignProperties>({
    mutationFn: updateCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignsKeys.lists() });
    },
  });
};

export default useUpdateCampaign;
