import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignsKeys from './keys';
import { ICampaign, CampaignsKeys } from './types';

const fetchCampaign = ({ campaignId }: { campaignId: string }) =>
  fetcher<ICampaign>({
    path: `/campaigns/${campaignId}`,
    action: 'get',
  });

const useCampaign = (campaignId: string) => {
  return useQuery<ICampaign, CLErrors, ICampaign, CampaignsKeys>({
    queryKey: campaignsKeys.item({ campaignId }),
    queryFn: () => fetchCampaign({ campaignId }),
  });
};

export default useCampaign;
