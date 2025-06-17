import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import ideasKeys from 'api/ideas/keys';

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

const useJobInProgressByPhase = (phaseId: string) => {
  const queryClient = useQueryClient();
  return useQuery<IJobs | undefined, CLErrors>({
    queryKey: jobsKeys.list({ phaseId }),
    queryFn: () => fetchInProgressPhaseJobs(phaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        // Ideally, we should only invalidate the ideas list for the current phase,
        // but since the ideas list is not filtered by phase, we invalidate all ideas for now.
        queryKey: ideasKeys.lists(),
      });
    },
    keepPreviousData: true,
    refetchInterval: (data) => {
      // Stop polling if data is undefined or if its "data" property is an empty array.
      if (!data || data.data.length === 0) {
        return false;
      }

      // Otherwise, if there are jobs, refetch every 5 seconds.
      return 5000;
    },
  });
};

export default useJobInProgressByPhase;
