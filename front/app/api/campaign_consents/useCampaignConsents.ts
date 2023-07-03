import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import campaignConsentKeys from './keys';
import {
  CampaignConsentKeys,
  ICampaignConsents,
  IConsentsRequestData,
} from './types';

const fetchCampaignConsents = (consentsRequestData: IConsentsRequestData) => {
  const { unsubscriptionToken, withoutCampaignNames: without_campaign_names } =
    consentsRequestData;
  return fetcher<ICampaignConsents>({
    path: `/consents${
      typeof unsubscriptionToken === 'string'
        ? `?unsubscription_token=${unsubscriptionToken}`
        : ''
    }`,
    action: 'get',
    queryParams: {
      without_campaign_names,
    },
  });
};

const useCampaignConsents = (consentsRequestData: IConsentsRequestData) => {
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
