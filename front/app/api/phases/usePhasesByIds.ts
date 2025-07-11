import { useQueries, UseQueryOptions } from '@tanstack/react-query';

import phasesKeys from './keys';
import { IPhase } from './types';
import { fetchPhase } from './usePhase';

type PhasesMiniByIdsReturnType = UseQueryOptions<IPhase>[];

const usePhasesByIds = (phaseIds: string[]) => {
  const queries = phaseIds.map((phaseId) => ({
    queryKey: phasesKeys.item({ phaseId }),
    queryFn: () => fetchPhase({ phaseId }),
  }));

  return useQueries<PhasesMiniByIdsReturnType>({ queries });
};

export default usePhasesByIds;
