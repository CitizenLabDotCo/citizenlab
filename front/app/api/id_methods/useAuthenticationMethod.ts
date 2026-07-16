import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import idMethodsKeys from './keys';
import { IdMethodsKeys, IdMethod } from './types';

const fetchAuthenticationMethod = () =>
  fetcher<IdMethod>({
    path: `/id_methods/first_enabled_authentication_method`,
    action: 'get',
  });

const useAuthenticationMethod = () => {
  return useQuery<
    IdMethod,
    CLErrors,
    IdMethod,
    IdMethodsKeys
  >({
    queryKey: idMethodsKeys.item({ endpoint: 'first_enabled_authentication_method' }),
    queryFn: () => fetchAuthenticationMethod(),
  });
};

export default useAuthenticationMethod;
