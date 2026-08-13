import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsKeys from './keys';
import { IPermissions, PermissionsKeys } from './types';

const fetchPermissions = () =>
  fetcher<IPermissions>({
    path: `/permissions`,
    action: 'get',
  });

const usePermissions = () => {
  return useQuery<IPermissions, CLErrors, IPermissions, PermissionsKeys>({
    queryKey: permissionsKeys.lists(),
    queryFn: () => fetchPermissions(),
  });
};

export default usePermissions;
