import { useQueries } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import phasePermissionKeys from './keys';
import { IPCPermissions } from './types';
import usePhasePermissions from './usePhasePermissions';

type PhasesPermissionsReturnType = ReturnType<typeof usePhasePermissions>;

export const fetchPhasePermissions = (phaseId: string) => {
  return fetcher<IPCPermissions>({
    path: `/phases/${phaseId}/permissions`,
    action: 'get',
  });
};

const usePhasesPermissions = (phaseIds?: string[]) => {
  const queries = phaseIds
    ? phaseIds.map((phaseId) => ({
        queryKey: phasePermissionKeys.list({ phaseId }),
        queryFn: () => fetchPhasePermissions(phaseId),
      }))
    : [];

  return useQueries<PhasesPermissionsReturnType[]>({
    queries,
  });
};

export default usePhasesPermissions;
