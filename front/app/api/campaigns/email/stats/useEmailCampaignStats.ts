import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import emailCampaignStatsKeys from './keys';
import { IEmailCampaignStats, EmailCampaignStatsKeys } from './types';

const fetchEmailCampaignStats = ({ campaignId }: { campaignId: string }) =>
  fetcher<IEmailCampaignStats>({
    path: `/campaigns/${campaignId}/email_stats`,
    action: 'get',
  });

const useEmailCampaignStats = (campaignId: string) => {
  return useQuery<
    IEmailCampaignStats,
    CLErrors,
    IEmailCampaignStats,
    EmailCampaignStatsKeys
  >({
    queryKey: emailCampaignStatsKeys.item({ campaignId }),
    queryFn: () => fetchEmailCampaignStats({ campaignId }),
  });
};

export default useEmailCampaignStats;
