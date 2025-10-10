import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import verificationMethodsKeys from './keys';
import { VerificationMethodsKeys, IVerificationMethods } from './types';

const fetchVerificationMethods = () =>
  fetcher<IVerificationMethods>({
    path: `/verification_methods`,
    action: 'get',
  });

const useVerificationMethods = (enabled: boolean = true) => {
  console.log('enabled', enabled);
  return useQuery<
    IVerificationMethods,
    CLErrors,
    IVerificationMethods,
    VerificationMethodsKeys
  >({
    queryKey: verificationMethodsKeys.list(),
    queryFn: () => fetchVerificationMethods(),
    enabled,
  });
};

export default useVerificationMethods;
