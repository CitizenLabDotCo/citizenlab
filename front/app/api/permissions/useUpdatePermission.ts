import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import permissionsPhaseCustomFieldsKeys from 'api/permissions_phase_custom_fields/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionKeys from './keys';
import { IPermission, UpdateGlobalPermissionParams } from './types';

const updatePermission = async ({
  action,
  permission,
}: UpdateGlobalPermissionParams) =>
  fetcher<IPermission>({
    path: `/permissions/${action}`,
    action: 'patch',
    body: { permission },
  });

const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation<IPermission, CLErrors, UpdateGlobalPermissionParams>({
    mutationFn: updatePermission,
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: permissionKeys.item({ action }),
      });

      queryClient.invalidateQueries({
        queryKey: permissionsPhaseCustomFieldsKeys.list({
          action,
        }),
      });
    },
  });
};

export default useUpdatePermission;
