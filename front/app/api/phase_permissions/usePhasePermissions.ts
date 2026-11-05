import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IPermissions } from 'api/permissions/types';

import fetcher from 'utils/cl-react-query/fetcher';

import phasePermissionKeys from './keys';
import { PhasePermissionKeys } from './types';

export type PhasePermissionsProps = {
  phaseId: string | undefined;
};

export const fetchPhasePermissions = ({ phaseId }: PhasePermissionsProps) => {
  return fetcher<IPermissions>({
    path: `/phases/${phaseId}/permissions`,
    action: 'get',
  });
};

const usePhasePermissions = ({ phaseId }: PhasePermissionsProps) => {
  return useQuery<IPermissions, CLErrors, IPermissions, PhasePermissionKeys>({
    queryKey: phasePermissionKeys.list({ phaseId }),
    queryFn: () => fetchPhasePermissions({ phaseId }),
    enabled: !!phaseId,
  });
};

export default usePhasePermissions;
