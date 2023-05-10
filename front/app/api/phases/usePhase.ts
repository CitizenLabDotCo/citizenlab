import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import phasesKeys from './keys';
import { IPhase, PhasesKeys } from './types';

const fetchPhase = ({ phaseId }: { phaseId: string }) =>
  fetcher<IPhase>({
    path: `/phases/${phaseId}`,
    action: 'get',
  });

const usePhases = (phaseId) => {
  return useQuery<IPhase, CLErrors, IPhase, PhasesKeys>({
    queryKey: phasesKeys.item({ phaseId }),
    queryFn: () => fetchPhase({ phaseId }),
  });
};

export default usePhases;
