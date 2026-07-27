import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import emailCampaignsKeys from './keys';
import emailCampaignPreviewsKeys from './previews/keys';
import { IEmailCampaign, IUpdateEmailCampaignProperties } from './types';

const updateEmailCampaign = async ({
  id: campaignId,
  campaign,
}: IUpdateEmailCampaignProperties) =>
  fetcher<IEmailCampaign>({
    path: `/campaigns/${campaignId}`,
    action: 'patch',
    body: { campaign },
  });

const useUpdateEmailCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<IEmailCampaign, CLErrors, IUpdateEmailCampaignProperties>({
    mutationFn: updateEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailCampaignsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: emailCampaignPreviewsKeys.all(),
      });
    },
  });
};

export default useUpdateEmailCampaign;
