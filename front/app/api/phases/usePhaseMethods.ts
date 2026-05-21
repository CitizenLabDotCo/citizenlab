import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IPhase, IPhaseMethodData } from './types';

const fetchPhaseWithMethods = ({ phaseId }: { phaseId: string }) =>
  fetcher<IPhase>({
    path: `/phases/${phaseId}`,
    action: 'get',
    queryParams: { include: 'phase_methods' },
    cacheIndividualItems: false,
  });

const usePhaseMethods = (phaseId: string | undefined | null) => {
  return useQuery<IPhase, CLErrors, IPhaseMethodData[]>({
    queryKey: [
      { type: 'phase', operation: 'with_methods', parameters: { id: phaseId } },
    ],
    queryFn: () => fetchPhaseWithMethods({ phaseId: phaseId as string }),
    enabled: !!phaseId,
    select: (data) =>
      (data.included ?? []).filter(
        (i): i is IPhaseMethodData => i.type === 'phase_method'
      ),
  });
};

export default usePhaseMethods;
