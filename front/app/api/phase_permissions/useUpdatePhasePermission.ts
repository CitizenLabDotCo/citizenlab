import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import phasePermissionKeys from './keys';
import { IPCPermission, IUpdatePermissionObject } from './types';

const updatePhasePermission = ({
  permissionId,
  phaseId,
  action,
  permission,
}: IUpdatePermissionObject) =>
  fetcher<IPCPermission>({
    path: `/phases/${phaseId}/permissions/${action}`,
    action: 'patch',
    body: { permissionId, permission },
  });

const useUpdatePhasePermission = (phaseId?: string | null) => {
  const queryClient = useQueryClient();
  return useMutation<IPCPermission, CLErrors, IUpdatePermissionObject>({
    mutationFn: updatePhasePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: phasePermissionKeys.lists(),
      });
      if (phaseId) {
        queryClient.invalidateQueries({
          queryKey: phasePermissionKeys.list({ phaseId }),
        });
      }
    },
  });
};

export default useUpdatePhasePermission;
