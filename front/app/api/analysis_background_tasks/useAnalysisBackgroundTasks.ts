import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import backgroundTasksKeys from './keys';
import { IBackgroundTasks, BackgroundTasksKeys } from './types';
import tagsKeys from 'api/analysis_tags/keys';
import taggingKeys from 'api/analysis_taggings/keys';
import insightsKeys from 'api/analysis_insights/keys';

const fetchBackgroundTasks = (analysisId: string) => {
  return fetcher<IBackgroundTasks>({
    path: `/analyses/${analysisId}/background_tasks`,
    action: 'get',
  });
};

const useAnalysisBackgroundTasks = (analysisId: string) => {
  const queryClient = useQueryClient();
  return useQuery<
    IBackgroundTasks,
    CLErrors,
    IBackgroundTasks,
    BackgroundTasksKeys
  >({
    queryKey: backgroundTasksKeys.list({ analysisId }),
    queryFn: () => fetchBackgroundTasks(analysisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taggingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: insightsKeys.lists() });
    },
    // Refetch every 2 seconds when tasks are active
    refetchInterval: (data) => {
      const activeTask = data?.data.find((task) => {
        const { state } = task.attributes;
        return state === 'queued' || state === 'in_progress';
      });
      return activeTask ? 2000 : false;
    },
    keepPreviousData: false,
  });
};

export default useAnalysisBackgroundTasks;
