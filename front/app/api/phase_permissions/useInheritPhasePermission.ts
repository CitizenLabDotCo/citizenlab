import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IPermission } from 'api/permissions/types';

import fetcher from 'utils/cl-react-query/fetcher';

import permissionsPhaseCustomFieldsKeys from '../permissions_phase_custom_fields/keys';

import phasePermissionKeys from './keys';
import { InheritancePermissionParams } from './types';

// Puts the action back under the global 'visiting' permission. Its own groups
// and demographic questions are destroyed along with it.
const inheritPhasePermission = ({
  phaseId,
  action,
}: InheritancePermissionParams) =>
  fetcher<IPermission>({
    path: `/phases/${phaseId}/permissions/${action}/inherit`,
    action: 'patch',
    body: {},
  });

const useInheritPhasePermission = () => {
  const queryClient = useQueryClient();
  return useMutation<IPermission, CLErrors, InheritancePermissionParams>({
    mutationFn: inheritPhasePermission,
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

export default useInheritPhasePermission;
