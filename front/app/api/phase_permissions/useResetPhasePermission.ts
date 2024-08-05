import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsFieldsKeys from '../permissions_fields/keys';

import phasePermissionKeys from './keys';
import { IPCPermission, ResetPermissionObject } from './types';

const resetPhasePermission = ({
  permissionId,
  phaseId,
  action,
}: ResetPermissionObject) =>
  fetcher<IPCPermission>({
    path: `/phases/${phaseId}/permissions/${action}/reset`,
    action: 'patch',
    body: { permissionId },
  });

const useResetPhasePermission = () => {
  const queryClient = useQueryClient();
  return useMutation<IPCPermission, CLErrors, ResetPermissionObject>({
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
        queryKey: permissionsFieldsKeys.list({
          phaseId,
          action,
        }),
      });
    },
  });
};

export default useResetPhasePermission;
