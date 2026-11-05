import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IPermission } from 'api/permissions/types';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsPhaseCustomFieldsKeys from '../permissions_phase_custom_fields/keys';

import phasePermissionKeys from './keys';
import { UpdatePermissionParams } from './types';

const updatePhasePermission = ({
  permissionId,
  phaseId,
  action,
  permission,
}: UpdatePermissionParams) =>
  fetcher<IPermission>({
    path: `/phases/${phaseId}/permissions/${action}`,
    action: 'patch',
    body: { permissionId, permission },
  });

const useUpdatePhasePermission = () => {
  const queryClient = useQueryClient();
  return useMutation<IPermission, CLErrors, UpdatePermissionParams>({
    mutationFn: updatePhasePermission,
    onSuccess: (_, { action, phaseId }) => {
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
