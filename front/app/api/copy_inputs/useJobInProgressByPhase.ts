import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import jobsKeys from './keys';
import { IJobs } from './types';

const fetchInProgressPhaseJobs = async (
  phaseId: string
): Promise<IJobs | undefined> => {
  return fetcher<IJobs>({
    path: '/jobs',
    action: 'get',
    queryParams: {
      context_type: 'Phase',
      context_id: phaseId,
      completed: false,
    },
  });
};

const useJobInProgressByPhase = (phaseId: string) =>
  useQuery<IJobs | undefined, CLErrors>({
    queryKey: jobsKeys.list({ phaseId }),
    queryFn: () => fetchInProgressPhaseJobs(phaseId),
    keepPreviousData: true,
  });

export default useJobInProgressByPhase;
