import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.lists(),
      });
    },
  });
};

export default useUpdatePermission;
