import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import campaignConsentKeys from './keys';
import { CampaignConsentKeys, ICampaignConsents } from './types';

const fetchCampaignConsents = (unsubscriptionToken) =>
  fetcher<ICampaignConsents>({
    path: `/consents${
      typeof unsubscriptionToken === 'string'
        ? '?unsubscription_token=' + unsubscriptionToken
        : ''
    }`,
    action: 'get',
  });

const useCampaignConsents = (unsubscriptionToken?: string | null) => {
  return useQuery<
    ICampaignConsents,
    CLErrors,
    ICampaignConsents,
    CampaignConsentKeys
  >({
    queryKey: campaignConsentKeys.items(),
    queryFn: async () => await fetchCampaignConsents(unsubscriptionToken),
  });
};

export default useCampaignConsents;
