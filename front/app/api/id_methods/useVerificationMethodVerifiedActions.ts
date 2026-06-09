import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import idMethodsKeys from './keys';
import { IdMethodsKeys, IVerificationMethod } from './types';

const fetchVerificationMethodVerifiedActions = () =>
  fetcher<IVerificationMethod>({
    path: `/id_methods/first_enabled_for_verified_actions`,
    action: 'get',
  });

const useVerificationMethodVerifiedActions = () => {
  return useQuery<
    IVerificationMethod,
    CLErrors,
    IVerificationMethod,
    IdMethodsKeys
  >({
    queryKey: idMethodsKeys.item({
      endpoint: 'first_enabled_for_verified_actions',
    }),
    queryFn: () => fetchVerificationMethodVerifiedActions(),
  });
};

export default useVerificationMethodVerifiedActions;
