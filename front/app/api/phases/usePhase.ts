import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import phasesKeys from './keys';
import { IPhase, PhasesKeys } from './types';

const fetchPhase = ({ phaseId }: { phaseId: string | undefined }) =>
  fetcher<IPhase>({
    path: `/phases/${phaseId}`,
    action: 'get',
  });

const usePhases = (phaseId: string | undefined) => {
  return useQuery<IPhase, CLErrors, IPhase, PhasesKeys>({
    queryKey: phasesKeys.item({ phaseId }),
    queryFn: () => fetchPhase({ phaseId }),
    enabled: !!phaseId,
  });
};

export default usePhases;
