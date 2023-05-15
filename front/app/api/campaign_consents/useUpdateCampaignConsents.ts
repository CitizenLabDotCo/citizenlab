import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import campaignConsentKeys from './keys';
import { ICampaignConsent, IUpdateCampaignConsentObject } from './types';

const updateCampaignConsents = async ({
  consentChanges,
  unsubscriptionToken,
}: IUpdateCampaignConsentObject) =>
  Promise.all(
    consentChanges.map(({ campaignConsentId, campaignId, consented }) => {
      if (!campaignConsentId && !campaignId) return Promise.reject();
      const idPart = campaignConsentId
        ? campaignConsentId
        : `by_campaign_id/${campaignId}`;
      const tokenPart =
        typeof unsubscriptionToken === 'string'
          ? `?unsubscription_token=${unsubscriptionToken}`
          : '';
      return fetcher<ICampaignConsent>({
        path: `/consents/${idPart}${tokenPart}`,
        action: 'patch',
        body: { consent: { consented } },
      });
    })
  );

const useUpdateCampaignConsents = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ICampaignConsent[],
    CLErrors,
    IUpdateCampaignConsentObject
  >({
    mutationFn: updateCampaignConsents,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: campaignConsentKeys.items(),
      });
    },
  });
};

export default useUpdateCampaignConsents;
