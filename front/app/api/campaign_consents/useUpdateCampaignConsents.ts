import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import campaignConsentKeys from './keys';
import { ICampaignConsent } from './types';

type IUpdateCampaignConsentObject = {
  campaignConsentId: string;
  consented: boolean;
};

const updateCampaignConsents = ({
  campaignConsentId,
  consented,
}: IUpdateCampaignConsentObject) =>
  fetcher<ICampaignConsent>({
    path: `/consents/${campaignConsentId}`,
    action: 'patch',
    body: { consent: { consented } },
  });

const useUpdateCampaignConsents = () => {
  const queryClient = useQueryClient();
  return useMutation<ICampaignConsent, CLErrors, ICampaignConsent>({
    mutationFn: updateCampaignConsents,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: campaignConsentKeys.items(),
      });
    },
  });
};

export default useUpdateCampaignConsents;
