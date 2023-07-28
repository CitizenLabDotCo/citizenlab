import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import campaignConsentKeys from './keys';
import {
  CampaignConsentKeys,
  ICampaignConsents,
  IConsentsRequestData,
} from './types';

const fetchCampaignConsents = (consentsRequestData?: IConsentsRequestData) => {
  return fetcher<ICampaignConsents>({
    path: `/consents${
      typeof consentsRequestData?.unsubscriptionToken === 'string'
        ? `?unsubscription_token=${consentsRequestData.unsubscriptionToken}`
        : ''
    }`,
    action: 'get',
    queryParams: {
      without_campaign_names: consentsRequestData?.withoutCampaignNames,
    },
  });
};

const useCampaignConsents = (consentsRequestData?: IConsentsRequestData) => {
  return useQuery<
    ICampaignConsents,
    CLErrors,
    ICampaignConsents,
    CampaignConsentKeys
  >({
    queryKey: campaignConsentKeys.items(),
    queryFn: async () => await fetchCampaignConsents(consentsRequestData),
  });
};

export default useCampaignConsents;
