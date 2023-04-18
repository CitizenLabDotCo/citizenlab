import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectPermissionKeys from './keys';
import { IPCPermission, IUpdatePermissionObject } from './types';

const updateProjectPermission = ({
  permissionId,
  projectId,
  action,
  permission,
}: IUpdatePermissionObject) =>
  fetcher<IPCPermission>({
    path: `/projects/${projectId}/permissions/${action}`,
    action: 'patch',
    body: { permissionId, permission },
  });

const useUpdateProjectPermission = (projectId?: string | null) => {
  const queryClient = useQueryClient();
  return useMutation<IPCPermission, CLErrors, IUpdatePermissionObject>({
    mutationFn: updateProjectPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectPermissionKeys.lists(),
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: projectPermissionKeys.list({ projectId }),
        });
      }
    },
  });
};

export default useUpdateProjectPermission;
