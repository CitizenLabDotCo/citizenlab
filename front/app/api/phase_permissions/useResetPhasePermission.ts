import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsCustomFieldsKeys from '../permissions_custom_fields/keys';

import phasePermissionKeys from './keys';
import { IPhasePermission, ResetPermissionParams } from './types';

const resetPhasePermission = ({
  permissionId,
  phaseId,
  action,
}: ResetPermissionParams) =>
  fetcher<IPhasePermission>({
    path: `/phases/${phaseId}/permissions/${action}/reset`,
    action: 'patch',
    body: { permissionId },
  });

const useResetPhasePermission = () => {
  const queryClient = useQueryClient();
  return useMutation<IPhasePermission, CLErrors, ResetPermissionParams>({
    mutationFn: resetPhasePermission,
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

export default useResetPhasePermission;
