import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import campaignsKeys from './keys';
import { ICampaign, CampaignsKeys } from './types';

const fetchCampaignExample = ({ campaignId }: { campaignId: string | null }) =>
  fetcher<ICampaign>({
    path: `/campaigns/${campaignId}`,
    action: 'get',
  });

const useCampaign = (campaignId: string | null) => {
  return useQuery<ICampaign, CLErrors, ICampaign, CampaignsKeys>({
    queryKey: campaignsKeys.item({ campaignId }),
    queryFn: () => fetchCampaignExample({ campaignId }),
    enabled: !!campaignId,
  });
};

export default useCampaign;
