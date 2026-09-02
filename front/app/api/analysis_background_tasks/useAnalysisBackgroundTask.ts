import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import insightsKeys from 'api/analysis_insights/keys';

import useOnQueryFetched from 'hooks/useOnQueryFetched';

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
  const result = useQuery<
    IBackgroundTask,
    CLErrors,
    IBackgroundTask,
    BackgroundTasksKeys
  >({
    queryKey: backgroundTasksKeys.item({ id: backgroundTaskId }),
    queryFn: () => fetchBackgroundTask(analysisId, backgroundTaskId),
    enabled: !!backgroundTaskId && !!analysisId,
    // Refetch every 5 seconds when task is active
    refetchInterval: ({ state }) => {
      const activeTask =
        state.data?.data.attributes.state === 'queued' ||
        state.data?.data.attributes.state === 'in_progress';
      return activeTask && pollingEnabled ? 5000 : false;
    },
  });

  // Refresh the insight text after every poll. This must only run after the
  // task's own fetch: the insights response side-loads this very task, which
  // `fetcher` writes into the cache, and reacting to that write would refetch
  // insights in an endless loop (TAN-8535).
  useOnQueryFetched(result, () => {
    queryClient.invalidateQueries({
      queryKey: insightsKeys.list({ analysisId }),
    });
  });

  return result;
};

export default useAnalysisBackgroundTask;
