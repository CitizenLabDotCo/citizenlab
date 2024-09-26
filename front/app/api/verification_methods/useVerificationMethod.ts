import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import verificationMethodsKeys from './keys';
import { VerificationMethodsKeys, IVerificationMethod } from './types';

const fetchVerificationMethod = () =>
  fetcher<IVerificationMethod>({
    path: `/verification_methods/first_enabled`,
    action: 'get',
  });

const useVerificationMethod = () => {
  return useQuery<
    IVerificationMethod,
    CLErrors,
    IVerificationMethod,
    VerificationMethodsKeys
  >({
    queryKey: verificationMethodsKeys.item({ endpoint: 'first_enabled' }),
    queryFn: () => fetchVerificationMethod(),
  });
};

export default useVerificationMethod;
