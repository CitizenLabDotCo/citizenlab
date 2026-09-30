import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IJobs } from 'api/jobs/types';

import fetcher from 'utils/cl-react-query/fetcher';

import surveyGenerationJobKeys from './keys';
import {
  isSurveyGenerationInProgress,
  SURVEY_GENERATION_JOB_TYPE,
} from './util';

const fetchSurveyGenerationJobs = (phaseId: string) =>
  fetcher<IJobs>({
    path: '/jobs',
    action: 'get',
    queryParams: {
      context_type: 'Phase',
      context_id: phaseId,
      root_job_type: SURVEY_GENERATION_JOB_TYPE,
    },
  });

// Polls the trackers of the survey generation jobs of the phase. The newest one
// (data[0]) is the relevant one. Because the job state lives on the server,
// reopening the form builder picks up a running generation.
const useSurveyGenerationJob = (phaseId: string) => {
  return useQuery<IJobs, CLErrors>({
    queryKey: surveyGenerationJobKeys.list({ phaseId }),
    queryFn: () => fetchSurveyGenerationJobs(phaseId),
    refetchInterval: ({ state }) =>
      isSurveyGenerationInProgress(state.data?.data[0]) ? 2000 : false,
  });
};

export default useSurveyGenerationJob;
