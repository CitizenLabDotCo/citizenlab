import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import backgroundTasksKeys from './keys';
import { IBackgroundTasks, BackgroundTasksKeys } from './types';
import tagsKeys from 'api/analysis_tags/keys';
import taggingKeys from 'api/analysis_taggings/keys';

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
    },
    // Refetch every 5 seconds when tasks are active
    refetchInterval: (data) => {
      const activeTask = data?.data.find((task) => {
        const { updated_at, state } = task.attributes;
        // Updated in the last 2 minutes?
        const up_date = Date.parse(updated_at);
        const now = Date.now();
        const recently_updated = now - up_date < 2 * 60 * 1000;

        return (
          state === 'queued' || state === 'in_progress' || recently_updated
        );
      });
      return activeTask ? 5000 : false;
    },
    keepPreviousData: false,
  });
};

export default useAnalysisBackgroundTasks;
