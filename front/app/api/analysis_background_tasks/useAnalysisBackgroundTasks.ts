import { useEffect } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import commentsSummariesKeys from 'api/analysis_comments_summaries/keys';
import insightsKeys from 'api/analysis_insights/keys';
import taggingKeys from 'api/analysis_taggings/keys';
import tagsKeys from 'api/analysis_tags/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import backgroundTasksKeys from './keys';
import { IBackgroundTasks, BackgroundTasksKeys } from './types';

const fetchBackgroundTasks = (analysisId?: string) => {
  return fetcher<IBackgroundTasks>({
    path: `/analyses/${analysisId}/background_tasks`,
    action: 'get',
  });
};

const useAnalysisBackgroundTasks = (analysisId?: string) => {
  const queryClient = useQueryClient();
  const result = useQuery<
    IBackgroundTasks,
    CLErrors,
    IBackgroundTasks,
    BackgroundTasksKeys
  >({
    queryKey: backgroundTasksKeys.list({ analysisId }),
    queryFn: () => fetchBackgroundTasks(analysisId),
    // Refetch every 2 seconds when tasks are active
    refetchInterval: ({ state }) => {
      const activeTask = state.data?.data.find((task) => {
        return (
          task.attributes.state === 'queued' ||
          task.attributes.state === 'in_progress'
        );
      });
      return activeTask ? 2000 : false;
    },
    placeholderData: undefined,
    enabled: !!analysisId,
  });

  const { isSuccess, dataUpdatedAt } = result;

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taggingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: insightsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: commentsSummariesKeys.all() });
    }
  }, [isSuccess, dataUpdatedAt, queryClient]);

  return result;
};

export default useAnalysisBackgroundTasks;
