import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IJobs } from 'api/jobs/types';

import fetcher from 'utils/cl-react-query/fetcher';

import reportGenerationKeys from './keys';
import { isReportGenerationInProgress } from './util';

export const REPORT_GENERATION_JOB_TYPE = 'ReportBuilder::GenerateReportJob';

// A run is tracked against what the report is about: the phase for a phase report,
// the project for a project report. Callers poll by whichever they have.
export type GenerationContext = {
  type: 'Phase' | 'Project';
  id: string;
};

const fetchReportGenerationJobs = (
  context: GenerationContext
): Promise<IJobs> =>
  fetcher<IJobs>({
    path: '/jobs',
    action: 'get',
    queryParams: {
      context_type: context.type,
      context_id: context.id,
      root_job_type: REPORT_GENERATION_JOB_TYPE,
    },
  });

// Polls the tracker of the report composition job (the newest tracker, data[0], is
// the relevant one). Polling stops once no job is in progress, and resumes when the
// generate mutation invalidates the query. Because the progress lives on the server,
// reloading the page picks up an ongoing run.
const useReportGenerationJob = (
  context: GenerationContext,
  { enabled }: { enabled: boolean }
) =>
  useQuery<IJobs, CLErrors>({
    queryKey: reportGenerationKeys.list(context),
    queryFn: () => fetchReportGenerationJobs(context),
    enabled,
    refetchInterval: ({ state }) => {
      const data = state.data;
      if (!data || data.data.length === 0) return false;

      // A composition is minutes of model calls, so poll slowly.
      return isReportGenerationInProgress(data.data[0]) ? 3000 : false;
    },
  });

export default useReportGenerationJob;
