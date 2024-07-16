import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import insightsKeys from 'api/analysis_insights/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import backgroundTasksKeys from './keys';
import { IBackgroundTask, BackgroundTasksKeys } from './types';

const fetchBackgroundTask = (analysisId?: string, id?: string) =>
  fetcher<IBackgroundTask>({
    path: `/analyses/${analysisId}/background_tasks/${id}`,
    action: 'get',
  });

const useAnalysisBackgroundTask = (
  analysisId?: string,
  backgroundTaskId?: string,
  pollingEnabled?: boolean
) => {
  const queryClient = useQueryClient();
  return useQuery<
    IBackgroundTask,
    CLErrors,
    IBackgroundTask,
    BackgroundTasksKeys
  >({
    queryKey: backgroundTasksKeys.item({ id: backgroundTaskId }),
    queryFn: () => fetchBackgroundTask(analysisId, backgroundTaskId),
    enabled: !!backgroundTaskId && !!analysisId,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: insightsKeys.list({ analysisId }),
      });
    },
    // Refetch every 5 seconds when task is active
    refetchInterval: (data) => {
      const activeTask =
        data?.data.attributes.state === 'queued' ||
        data?.data.attributes.state === 'in_progress';
      return activeTask && pollingEnabled ? 5000 : false;
    },
  });
};

export default useAnalysisBackgroundTask;
