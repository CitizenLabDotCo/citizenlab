import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import verificationMethodsKeys from './keys';
import { VerificationMethodsKeys, IVerificationMethod } from './types';

const fetchVerificationMethodVerifiedActions = () =>
  fetcher<IVerificationMethod>({
    path: `/verification_methods/first_enabled_for_verified_actions`,
    action: 'get',
  });

const useVerificationMethodVerifiedActions = () => {
  return useQuery<
    IVerificationMethod,
    CLErrors,
    IVerificationMethod,
    VerificationMethodsKeys
  >({
    queryKey: verificationMethodsKeys.item({
      endpoint: 'first_enabled_for_verified_actions',
    }),
    queryFn: () => fetchVerificationMethodVerifiedActions(),
  });
};

export default useVerificationMethodVerifiedActions;
