import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import phasePermissionKeys from './keys';
import { IPCPermissions, PhasePermissionKeys } from './types';

export type PhasePermissionsProps = {
  phaseId: string | undefined;
};

export const fetchPhasePermissions = ({ phaseId }: PhasePermissionsProps) => {
  return fetcher<IPCPermissions>({
    path: `/phases/${phaseId}/permissions`,
    action: 'get',
  });
};

const usePhasePermissions = ({ phaseId }: PhasePermissionsProps) => {
  return useQuery<
    IPCPermissions,
    CLErrors,
    IPCPermissions,
    PhasePermissionKeys
  >({
    queryKey: phasePermissionKeys.list({ phaseId }),
    queryFn: () => fetchPhasePermissions({ phaseId }),
  });
};

export default usePhasePermissions;
