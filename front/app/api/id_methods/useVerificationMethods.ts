import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import idMethodsKeys from './keys';
import { VerificationMethodsKeys, IVerificationMethods } from './types';

const fetchVerificationMethods = () =>
  fetcher<IVerificationMethods>({
    path: `/id_methods`,
    action: 'get',
  });

const useVerificationMethods = () => {
  return useQuery<
    IVerificationMethods,
    CLErrors,
    IVerificationMethods,
    VerificationMethodsKeys
  >({
    queryKey: idMethodsKeys.list(),
    queryFn: () => fetchVerificationMethods(),
  });
};

export default useVerificationMethods;
