import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import smsConsentKeys from './keys';
import { ISmsConsents, SmsConsentKeys } from './types';

const fetchSmsConsents = () =>
  fetcher<ISmsConsents>({
    path: `/sms_consents`,
    action: 'get',
  });

const useSmsConsents = () => {
  return useQuery<ISmsConsents, CLErrors, ISmsConsents, SmsConsentKeys>({
    queryKey: smsConsentKeys.items(),
    queryFn: fetchSmsConsents,
  });
};

export default useSmsConsents;
