import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignsKeys from './keys';
import { IEmailCampaign, CampaignsKeys } from './types';

const fetchEmailCampaign = ({ campaignId }: { campaignId: string }) =>
  fetcher<IEmailCampaign>({
    path: `/campaigns/${campaignId}`,
    action: 'get',
  });

const useEmailCampaign = (campaignId: string) => {
  return useQuery<IEmailCampaign, CLErrors, IEmailCampaign, CampaignsKeys>({
    queryKey: campaignsKeys.item({ campaignId }),
    queryFn: () => fetchEmailCampaign({ campaignId }),
  });
};

export default useEmailCampaign;
