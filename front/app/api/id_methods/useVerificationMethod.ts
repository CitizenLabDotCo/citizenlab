import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import idMethodsKeys from './keys';
import { IdMethodsKeys, IVerificationMethod } from './types';

const fetchVerificationMethod = () =>
  fetcher<IVerificationMethod>({
    path: `/id_methods/first_enabled_verification_method`,
    action: 'get',
  });

const useVerificationMethod = () => {
  return useQuery<
    IVerificationMethod,
    CLErrors,
    IVerificationMethod,
    IdMethodsKeys
  >({
    queryKey: idMethodsKeys.item({ endpoint: 'first_enabled_verification_method' }),
    queryFn: () => fetchVerificationMethod(),
  });
};

export default useVerificationMethod;
