import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import permissionKeys from './keys';

import { IPhasePermission, IPermissionUpdate } from './types';

const updatePermission = async ({
  action,
  ...requestBody
}: Partial<IPermissionUpdate>) =>
  fetcher<IPhasePermission>({
    path: `/permissions/${action}`,
    action: 'patch',
    body: { permission: requestBody },
  });

const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation<IPhasePermission, CLErrors, Partial<IPermissionUpdate>>({
    mutationFn: updatePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.lists(),
      });
    },
  });
};

export default useUpdatePermission;
