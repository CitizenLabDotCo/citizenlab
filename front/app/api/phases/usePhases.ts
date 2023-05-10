import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import phasesKeys from './keys';
import { IPhases, PhaseKeys } from './types';

const fetchPhases = ({ projectId }: { projectId: string }) =>
  fetcher<IPhases>({
    path: `/projects/${projectId}/phases`,
    action: 'get',
  });

const usePhases = (projectId) => {
  return useQuery<IPhases, CLErrors, IPhases, PhaseKeys>({
    queryKey: phasesKeys.list({ projectId }),
    queryFn: () => fetchPhases({ projectId }),
  });
};

export default usePhases;
