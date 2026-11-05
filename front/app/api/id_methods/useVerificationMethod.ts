import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import useIdConfigEnabled from 'hooks/useIdConfigEnabled';

import fetcher from 'utils/cl-react-query/fetcher';

import idMethodsKeys from './keys';
import { IdMethodsKeys, IdMethod } from './types';

const fetchVerificationMethod = () =>
  fetcher<IdMethod>({
    path: `/id_methods/first_enabled_verification_method`,
    action: 'get',
  });

const useVerificationMethod = () => {
  const idConfigEnabled = useIdConfigEnabled();

  return useQuery<IdMethod, CLErrors, IdMethod | undefined, IdMethodsKeys>({
    queryKey: idMethodsKeys.item({
      endpoint: 'first_enabled_verification_method',
    }),
    queryFn: () => fetchVerificationMethod(),
    select: (method) => (idConfigEnabled ? method : undefined),
  });
};

export default useVerificationMethod;
