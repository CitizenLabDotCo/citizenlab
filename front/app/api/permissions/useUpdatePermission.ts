import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import permissionKeys from './keys';

import { IParticipationContextPermission, IPermissionUpdate } from './types';

const updatePermission = async ({
  action,
  ...requestBody
}: Partial<IPermissionUpdate>) =>
  fetcher<IParticipationContextPermission>({
    path: `/permissions/${action}`,
    action: 'patch',
    body: { permission: requestBody },
  });

const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IParticipationContextPermission,
    CLErrors,
    Partial<IPermissionUpdate>
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
