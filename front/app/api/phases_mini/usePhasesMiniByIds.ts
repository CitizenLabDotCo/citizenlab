import { useQueries, UseQueryOptions } from '@tanstack/react-query';

import phasesMiniKeys from './keys';
import { PhaseMini } from './types';
import { fetchPhaseMini } from './usePhaseMini';

type PhasesMiniByIdsReturnType = UseQueryOptions<PhaseMini>[];

const usePhasesMiniByIds = (phaseIds: string[]) => {
  const queries = phaseIds.map((phaseId) => ({
    queryKey: phasesMiniKeys.item({ id: phaseId }),
    queryFn: () => fetchPhaseMini(phaseId),
  }));

  return useQueries<PhasesMiniByIdsReturnType>({ queries });
};

export default usePhasesMiniByIds;
