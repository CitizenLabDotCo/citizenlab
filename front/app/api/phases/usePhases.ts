import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import phasesKeys from './keys';
import { IPhases, PhasePlacementFilter, PhasesKeys } from './types';

const fetchPhases = async ({
  projectId,
  placementType,
}: {
  projectId: string | undefined;
  placementType?: PhasePlacementFilter;
}) => {
  return fetcher<IPhases>({
    path: `/projects/${projectId}/phases`,
    action: 'get',
    queryParams: placementType ? { placement_type: placementType } : undefined,
  });
};

const usePhases = (
  projectId?: string,
  placementType?: PhasePlacementFilter
) => {
  return useQuery<IPhases, CLErrors, IPhases, PhasesKeys>({
    queryKey: phasesKeys.list({ projectId, placementType }),
    queryFn: () => fetchPhases({ projectId, placementType }),
    enabled: !!projectId,
  });
};

export default usePhases;
