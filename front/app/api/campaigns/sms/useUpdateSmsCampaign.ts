import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsCampaignsKeys from './keys';
import { ISmsCampaign, IUpdateSmsCampaignProperties } from './types';

const updateSmsCampaign = async ({
  id: campaignId,
  campaign,
}: IUpdateSmsCampaignProperties) =>
  fetcher<ISmsCampaign>({
    path: `/campaigns/${campaignId}`,
    action: 'patch',
    body: { campaign },
  });

const useUpdateSmsCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<ISmsCampaign, CLErrors, IUpdateSmsCampaignProperties>({
    mutationFn: updateSmsCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsCampaignsKeys.lists() });
    },
  });
};

export default useUpdateSmsCampaign;
