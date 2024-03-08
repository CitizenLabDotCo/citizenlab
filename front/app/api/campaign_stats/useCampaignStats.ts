import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignStatsKeys from './keys';
import { ICampaignStats, CampaignStatsKeys } from './types';

const fetchCampaignStats = ({ campaignId }) =>
  fetcher<ICampaignStats>({
    path: `/campaigns/${campaignId}/stats`,
    action: 'get',
  });

const useCampaignStats = (campaignId: string) => {
  return useQuery<ICampaignStats, CLErrors, ICampaignStats, CampaignStatsKeys>({
    queryKey: campaignStatsKeys.item({ campaignId }),
    queryFn: () => fetchCampaignStats({ campaignId }),
  });
};

export default useCampaignStats;
