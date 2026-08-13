import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsKeys from './keys';
import {
  IGlobalPermission,
  IGlobalPermissionAction,
  PermissionsKeys,
} from './types';

type Parameters = {
  action: IGlobalPermissionAction;
};

const fetchPermission = ({ action }: Parameters) =>
  fetcher<IGlobalPermission>({
    path: `/permissions/${action}`,
    action: 'get',
  });

const usePermission = ({ action }: Parameters) => {
  return useQuery<
    IGlobalPermission,
    CLErrors,
    IGlobalPermission,
    PermissionsKeys
  >({
    queryKey: permissionsKeys.item({ action }),
    queryFn: () => fetchPermission({ action }),
  });
};

export default usePermission;
