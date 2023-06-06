import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { VerificationMethodsKeys, IVerificationMethods } from './types';
import verificationMethodsKeys from './keys';

const fetchVerificationMethods = () =>
  fetcher<IVerificationMethods>({
    path: `/verification_methods`,
    action: 'get',
  });

const useVerificationMethods = () => {
  return useQuery<
    IVerificationMethods,
    CLErrors,
    IVerificationMethods,
    VerificationMethodsKeys
  >({
    queryKey: verificationMethodsKeys.all(),
    queryFn: () => fetchVerificationMethods(),
  });
};

export default useVerificationMethods;
