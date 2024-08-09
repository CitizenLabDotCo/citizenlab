import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import permissionsCustomFieldsKeys from 'api/permissions_custom_fields/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsKeys from './keys';
import { ResetPermissionParams, IGlobalPermission } from './types';

const resetPermission = ({ action, permissionId }: ResetPermissionParams) => {
  return fetcher<IGlobalPermission>({
    path: `/permissions/${action}/reset`,
    action: 'patch',
    body: { permissionId },
  });
};

const useResetPermission = () => {
  const queryClient = useQueryClient();

  return useMutation<IGlobalPermission, CLErrors, ResetPermissionParams>({
    mutationFn: resetPermission,
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({
        queryKey: permissionsKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: permissionsCustomFieldsKeys.list({ action }),
      });
    },
  });
};

export default useResetPermission;
