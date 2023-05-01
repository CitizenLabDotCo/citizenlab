import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import campaignConsentKeys from './keys';
import { CampaignConsentKeys, ICampaignConsents } from './types';

const fetchCampaignConsents = () =>
  fetcher<ICampaignConsents>({
    path: '/consents',
    action: 'get',
  });

const useCampaignConsents = () => {
  return useQuery<
    ICampaignConsents,
    CLErrors,
    ICampaignConsents,
    CampaignConsentKeys
  >({
    queryKey: campaignConsentKeys.items(),
    queryFn: async () => await fetchCampaignConsents(),
  });
};

export default useCampaignConsents;
