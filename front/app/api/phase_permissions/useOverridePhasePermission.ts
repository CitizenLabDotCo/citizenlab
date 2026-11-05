import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IPermission } from 'api/permissions/types';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsPhaseCustomFieldsKeys from '../permissions_phase_custom_fields/keys';

import phasePermissionKeys from './keys';
import { InheritancePermissionParams } from './types';

// Detaches the action from the global 'visiting' permission by persisting a
// copy of it, so it can be customised independently.
const overridePhasePermission = ({
  phaseId,
  action,
}: InheritancePermissionParams) =>
  fetcher<IPermission>({
    path: `/phases/${phaseId}/permissions/${action}/override`,
    action: 'patch',
    body: {},
  });

const useOverridePhasePermission = () => {
  const queryClient = useQueryClient();
  return useMutation<IPermission, CLErrors, InheritancePermissionParams>({
    mutationFn: overridePhasePermission,
    onSuccess: (_, { action, phaseId }) => {
      queryClient.invalidateQueries({
        queryKey: phasePermissionKeys.list({ phaseId }),
      });
      queryClient.invalidateQueries({
        queryKey: permissionsPhaseCustomFieldsKeys.list({ phaseId, action }),
      });
    },
  });
};

export default useOverridePhasePermission;
