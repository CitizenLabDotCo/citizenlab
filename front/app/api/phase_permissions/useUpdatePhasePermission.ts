import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectPermissionKeys from './keys';
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

const useUpdatePhasePermission = (phaseId) => {
  const queryClient = useQueryClient();
  return useMutation<IPCPermission, CLErrors, IUpdatePermissionObject>({
    mutationFn: updatePhasePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectPermissionKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: projectPermissionKeys.list(phaseId),
      });
    },
  });
};

export default useUpdatePhasePermission;
