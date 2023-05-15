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
    consentChanges.map(({ campaignConsentId, consented }) =>
      fetcher<ICampaignConsent>({
        path: `/consents/${campaignConsentId}${
          typeof unsubscriptionToken === 'string'
            ? `?unsubscription_token=${unsubscriptionToken}`
            : ''
        }`,
        action: 'patch',
        body: { consent: { consented } },
      })
    )
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
