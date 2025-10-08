import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsPhaseCustomFieldsKeys from '../permissions_phase_custom_fields/keys';

import phasePermissionKeys from './keys';
import { IPhasePermission, UpdatePermissionParams } from './types';

const updatePhasePermission = ({
  permissionId,
  phaseId,
  action,
  permission,
}: UpdatePermissionParams) =>
  fetcher<IPhasePermission>({
    path: `/phases/${phaseId}/permissions/${action}`,
    action: 'patch',
    body: { permissionId, permission },
  });

const useUpdatePhasePermission = () => {
  const queryClient = useQueryClient();
  return useMutation<IPhasePermission, CLErrors, UpdatePermissionParams>({
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
        queryKey: permissionsPhaseCustomFieldsKeys.list({
          phaseId,
          action,
        }),
      });
    },
  });
};

export default useUpdatePhasePermission;
