import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import phasesKeys from './keys';
import { IPhase, PhasesKeys } from './types';

export const fetchPhase = ({
  phaseId,
}: {
  phaseId: string | undefined | null;
}) =>
  fetcher<IPhase>({
    path: `/phases/${phaseId}`,
    action: 'get',
  });

const usePhase = (phaseId: string | undefined | null) => {
  return useQuery<IPhase, CLErrors, IPhase, PhasesKeys>({
    queryKey: phasesKeys.item({ phaseId }),
    queryFn: () => fetchPhase({ phaseId }),
    enabled: !!phaseId,
  });
};

export default usePhase;
