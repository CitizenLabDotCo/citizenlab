import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import jobsKeys from './keys';
import { IJobs } from './types';

const fetchLatestJobForPhase = async (
  phaseId: string
): Promise<IJobs | undefined> => {
  return fetcher<IJobs>({
    path: '/jobs',
    action: 'get',
    queryParams: {
      context_type: 'Phase',
      context_id: phaseId,
    },
  });
};

const useJobProgressByPhase = (phaseId: string) =>
  useQuery<IJobs | undefined, CLErrors>({
    queryKey: jobsKeys.list({ phaseId }),
    queryFn: () => fetchLatestJobForPhase(phaseId),
    keepPreviousData: true,
  });

export default useJobProgressByPhase;
