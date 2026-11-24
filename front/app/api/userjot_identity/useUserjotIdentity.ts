import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import userjotIdentityKeys from './keys';
import { IUserjotIdentity, UserjotIdentityKeys } from './types';

const fetchUserjotIdentity = () =>
  fetcher<IUserjotIdentity>({
    path: '/users/me/userjot_identity',
    action: 'get',
  });

const useUserjotIdentity = (userId?: string) => {
  return useQuery<
    IUserjotIdentity,
    CLErrors,
    IUserjotIdentity,
    UserjotIdentityKeys
  >({
    queryKey: userjotIdentityKeys.item({ userId }),
    queryFn: fetchUserjotIdentity,
    enabled: !!userId,
  });
};

export default useUserjotIdentity;
