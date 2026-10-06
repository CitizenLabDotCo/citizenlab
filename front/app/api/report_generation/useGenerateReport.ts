import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IJob } from 'api/jobs/types';

import fetcher from 'utils/cl-react-query/fetcher';

import reportGenerationKeys from './keys';
import { GenerationContext } from './useReportGenerationJob';

type GenerateParams = {
  reportId: string;
  context: GenerationContext;
};

// Starts the background composition job (409 if one is already running).
// Track it with useReportGenerationJob.
const generateReport = ({ reportId }: GenerateParams) =>
  fetcher<IJob>({
    path: `/reports/${reportId}/generate`,
    action: 'post',
    body: {},
  });

const useGenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation<IJob, CLErrors, GenerateParams>({
    mutationFn: generateReport,
    onSettled: (_data, _error, { context }) => {
      // Kicks the poll into action — also on a 409, to show the running job.
      queryClient.invalidateQueries({
        queryKey: reportGenerationKeys.list(context),
      });
    },
  });
};

export default useGenerateReport;
