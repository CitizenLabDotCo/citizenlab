import { useRef } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IJobs } from 'api/copy_inputs/types';

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

  return useQuery<IJobs | undefined, CLErrors>({
    queryKey: importJobKeys.list({ phaseId }),
    queryFn: () => fetchImportJobs(phaseId),
    onSuccess: (data) => {
      const currentProgress = data?.data[0]?.attributes.progress ?? null;

      // Invalidate the imported ideas list query if the progress has changed since the last fetch
      if (
        currentProgress !== null &&
        currentProgress !== lastProgressRef.current
      ) {
        lastProgressRef.current = currentProgress;
        queryClient.invalidateQueries({
          queryKey: importedIdeasKeys.lists(),
        });
      }
    },
    keepPreviousData: true,
    refetchInterval: (data) => {
      if (!data || data.data.length === 0) {
        return false;
      }

      const hasInProgressJob = data.data.some(
        (job) => job.attributes.completed_at === null
      );
      return hasInProgressJob ? 5000 : false;
    },
  });
};

export default useImportJobProgress;
