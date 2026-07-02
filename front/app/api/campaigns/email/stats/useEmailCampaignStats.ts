import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import campaignStatsKeys from './keys';
import { ICampaignStats, CampaignStatsKeys } from './types';

const fetchEmailCampaignStats = ({ campaignId }: { campaignId: string }) =>
  fetcher<ICampaignStats>({
    path: `/campaigns/${campaignId}/email_stats`,
    action: 'get',
  });

const useEmailCampaignStats = (campaignId: string) => {
  return useQuery<ICampaignStats, CLErrors, ICampaignStats, CampaignStatsKeys>({
    queryKey: campaignStatsKeys.item({ campaignId }),
    queryFn: () => fetchEmailCampaignStats({ campaignId }),
  });
};

export default useEmailCampaignStats;
