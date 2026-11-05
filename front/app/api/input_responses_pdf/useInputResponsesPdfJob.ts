import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IJobs } from 'api/jobs/types';

import fetcher from 'utils/cl-react-query/fetcher';

import inputResponsesPdfJobKeys from './keys';
import { isPdfExportInProgress } from './util';

export const PDF_EXPORT_JOB_TYPE = 'Export::Pdf::InputResponsesJob';

const fetchPdfExportJobs = async (
  phaseId: string
): Promise<IJobs | undefined> => {
  return fetcher<IJobs>({
    path: '/jobs',
    action: 'get',
    queryParams: {
      context_type: 'Phase',
      context_id: phaseId,
      root_job_type: PDF_EXPORT_JOB_TYPE,
    },
  });
};

// Polls the tracker of the responses PDF export job of the phase (the newest
// tracker, data[0], is the relevant one). Polling stops automatically once no
// job is in progress, and resumes when the export mutation invalidates the
// query. Because the progress lives on the server, closing and reopening the
// modal (or reloading the page) picks up an ongoing export.
const useInputResponsesPdfJob = (phaseId: string) => {
  return useQuery<IJobs | undefined, CLErrors>({
    queryKey: inputResponsesPdfJobKeys.list({ phaseId }),
    queryFn: () => fetchPdfExportJobs(phaseId),
    refetchInterval: ({ state }) => {
      const data = state.data;

      if (!data || data.data.length === 0) {
        return false;
      }

      // Poll only for the newest tracker (all the UI reads), and treat stale
      // trackers as done: an orphaned tracker must not keep the poll running
      // forever. 1s so progress is actually observed — collection only takes
      // seconds.
      return isPdfExportInProgress(data.data[0]) ? 1000 : false;
    },
  });
};

export default useInputResponsesPdfJob;
