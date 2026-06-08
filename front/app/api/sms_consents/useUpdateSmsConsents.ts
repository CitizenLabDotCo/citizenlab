import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsConsentKeys from './keys';
import { ISmsConsent, IUpdateSmsConsentObject } from './types';

const updateSmsConsents = async ({ consentChanges }: IUpdateSmsConsentObject) =>
  Promise.all(
    consentChanges.map(({ smsConsentId, consented }) =>
      fetcher<ISmsConsent>({
        path: `/sms_consents/${smsConsentId}`,
        action: 'patch',
        body: { consent: { consented } },
      })
    )
  );

const useUpdateSmsConsents = () => {
  const queryClient = useQueryClient();
  return useMutation<ISmsConsent[], CLErrors, IUpdateSmsConsentObject>({
    mutationFn: updateSmsConsents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsConsentKeys.items() });
    },
  });
};

export default useUpdateSmsConsents;
