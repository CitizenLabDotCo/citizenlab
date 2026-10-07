import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IJobs } from 'api/jobs/types';

import fetcher from 'utils/cl-react-query/fetcher';

import projectGenerationJobKeys from './keys';
import {
  isProjectGenerationInProgress,
  PROJECT_GENERATION_JOB_TYPE,
} from './util';

const fetchProjectGenerationJobs = (projectId: string) =>
  fetcher<IJobs>({
    path: '/jobs',
    action: 'get',
    queryParams: {
      context_type: 'Project',
      context_id: projectId,
      root_job_type: PROJECT_GENERATION_JOB_TYPE,
    },
  });

// Polls the trackers of the project generation jobs of the project. The newest
// one (data[0]) is the relevant one. Because the job state lives on the server,
// reopening the workspace picks up a running generation.
const useProjectGenerationJob = (projectId: string) => {
  return useQuery<IJobs, CLErrors>({
    queryKey: projectGenerationJobKeys.list({ projectId }),
    queryFn: () => fetchProjectGenerationJobs(projectId),
    refetchInterval: ({ state }) =>
      isProjectGenerationInProgress(state.data?.data[0]) ? 2000 : false,
  });
};

export default useProjectGenerationJob;
