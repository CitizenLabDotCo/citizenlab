import { useEffect, useRef } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IJobs } from 'api/jobs/types';

import fetcher from 'utils/cl-react-query/fetcher';

import { importedIdeasKeys, importJobKeys } from './keys';

const IMPORT_JOB_TYPE = 'BulkImportIdeas::IdeaImportJob';

const fetchImportJobs = async (phaseId: string): Promise<IJobs | undefined> => {
  return fetcher<IJobs>({
    path: '/jobs',
    action: 'get',
    queryParams: {
      context_type: 'Phase',
      context_id: phaseId,
      root_job_type: IMPORT_JOB_TYPE,
    },
  });
};

const useImportJobProgress = (phaseId: string) => {
  const queryClient = useQueryClient();
  const lastProgressRef = useRef<number | null>(null);

  const result = useQuery<IJobs | undefined, CLErrors>({
    queryKey: importJobKeys.list({ phaseId }),
    queryFn: () => fetchImportJobs(phaseId),
    refetchInterval: ({ state }) => {
      const data = state.data;

      if (!data || data.data.length === 0) {
        return false;
      }

      const hasInProgressJob = data.data.some(
        (job) => job.attributes.completed_at === null
      );
      return hasInProgressJob ? 5000 : false;
    },
  });

  const currentProgress = result.data?.data[0]?.attributes.progress ?? null;

  // Invalidate the imported ideas list query if the progress has changed since the last fetch
  useEffect(() => {
    if (
      currentProgress !== null &&
      currentProgress !== lastProgressRef.current
    ) {
      lastProgressRef.current = currentProgress;
      queryClient.invalidateQueries({
        queryKey: importedIdeasKeys.lists(),
      });
    }
  }, [currentProgress, queryClient]);

  return result;
};

export default useImportJobProgress;
