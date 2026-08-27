import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsKeys from './keys';
import { IPermission, IGlobalPermissionAction, PermissionsKeys } from './types';

type Parameters = {
  action: IGlobalPermissionAction;
};

const fetchPermission = ({ action }: Parameters) =>
  fetcher<IPermission>({
    path: `/permissions/${action}`,
    action: 'get',
  });

const usePermission = ({ action }: Parameters) => {
  return useQuery<IPermission, CLErrors, IPermission, PermissionsKeys>({
    queryKey: permissionsKeys.item({ action }),
    queryFn: () => fetchPermission({ action }),
  });
};

export default usePermission;
