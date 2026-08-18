import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsCampaignRecipientsKeys from './keys';
import { ISmsCampaignRecipients, SmsCampaignRecipientsKeys } from './types';

const fetchSmsCampaignRecipients = ({ campaignId }: { campaignId: string }) =>
  fetcher<ISmsCampaignRecipients>({
    path: `/campaigns/${campaignId}/sms_recipients`,
    action: 'get',
  });

const useSmsCampaignRecipients = (
  campaignId: string,
  { enabled = true }: { enabled?: boolean } = {}
) => {
  return useQuery<
    ISmsCampaignRecipients,
    CLErrors,
    ISmsCampaignRecipients,
    SmsCampaignRecipientsKeys
  >({
    queryKey: smsCampaignRecipientsKeys.item({ campaignId }),
    queryFn: () => fetchSmsCampaignRecipients({ campaignId }),
    enabled,
  });
};

export default useSmsCampaignRecipients;
