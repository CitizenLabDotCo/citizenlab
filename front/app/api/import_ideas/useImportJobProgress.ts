import { useRef } from 'react';

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

  return useQuery<IJobs | undefined, CLErrors>({
    queryKey: importJobKeys.list({ phaseId }),
    queryFn: async () => {
      const jobs = await fetchImportJobs(phaseId);
      const progress = jobs?.data[0]?.attributes.progress ?? null;

      // Only refetch the imported ideas once the job has actually moved on.
      if (progress !== null && progress !== lastProgressRef.current) {
        lastProgressRef.current = progress;
        queryClient.invalidateQueries({
          queryKey: importedIdeasKeys.lists(),
        });
      }

      return jobs;
    },
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
};

export default useImportJobProgress;
