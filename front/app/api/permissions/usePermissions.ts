import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import permissionsKeys from './keys';
import { IGlobalPermissions, PermissionsKeys } from './types';

const fetchPermissions = () =>
  fetcher<IGlobalPermissions>({
    path: `/permissions`,
    action: 'get',
  });

const usePermissions = () => {
  return useQuery<
    IGlobalPermissions,
    CLErrors,
    IGlobalPermissions,
    PermissionsKeys
  >({
    queryKey: permissionsKeys.lists(),
    queryFn: () => fetchPermissions(),
  });
};

export default usePermissions;
