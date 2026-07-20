import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsCampaignStatsKeys from './keys';
import { ISmsCampaignStats, SmsCampaignStatsKeys } from './types';

const fetchSmsCampaignStats = ({ campaignId }: { campaignId: string }) =>
  fetcher<ISmsCampaignStats>({
    path: `/campaigns/${campaignId}/sms_stats`,
    action: 'get',
  });

const useSmsCampaignStats = (campaignId: string) => {
  return useQuery<
    ISmsCampaignStats,
    CLErrors,
    ISmsCampaignStats,
    SmsCampaignStatsKeys
  >({
    queryKey: smsCampaignStatsKeys.item({ campaignId }),
    queryFn: () => fetchSmsCampaignStats({ campaignId }),
  });
};

export default useSmsCampaignStats;
