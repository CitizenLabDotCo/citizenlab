import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import permissionsPhaseCustomFieldsKeys from 'api/permissions_phase_custom_fields/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionKeys from './keys';
import { IGlobalPermission, PermissionUpdateParams } from './types';

const updatePermission = async ({
  action,
  ...requestBody
}: Partial<PermissionUpdateParams>) =>
  fetcher<IGlobalPermission>({
    path: `/permissions/${action}`,
    action: 'patch',
    body: { permission: requestBody },
  });

const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IGlobalPermission,
    CLErrors,
    Partial<PermissionUpdateParams>
  >({
    mutationFn: updatePermission,
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.lists(),
      });

      if (action) {
        queryClient.invalidateQueries({
          queryKey: permissionsPhaseCustomFieldsKeys.list({
            action,
          }),
        });
      }
    },
  });
};

export default useUpdatePermission;
