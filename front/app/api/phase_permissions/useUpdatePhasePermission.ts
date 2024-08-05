import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsCustomFieldsKeys from '../permissions_custom_fields/keys';

import phasePermissionKeys from './keys';
import { IPhasePermission, IUpdatePermissionObject } from './types';

const updatePhasePermission = ({
  permissionId,
  phaseId,
  action,
  permission,
}: IUpdatePermissionObject) =>
  fetcher<IPhasePermission>({
    path: `/phases/${phaseId}/permissions/${action}`,
    action: 'patch',
    body: { permissionId, permission },
  });

const useUpdatePhasePermission = () => {
  const queryClient = useQueryClient();
  return useMutation<IPhasePermission, CLErrors, IUpdatePermissionObject>({
    mutationFn: updatePhasePermission,
    onSuccess: (_, { action, phaseId }) => {
      queryClient.invalidateQueries({
        queryKey: phasePermissionKeys.lists(),
      });
      if (phaseId) {
        queryClient.invalidateQueries({
          queryKey: phasePermissionKeys.list({ phaseId }),
        });
      }

      queryClient.invalidateQueries({
        queryKey: permissionsCustomFieldsKeys.list({
          phaseId,
          action,
        }),
      });
    },
  });
};

export default useUpdatePhasePermission;
