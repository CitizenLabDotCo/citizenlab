import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IBackgroundTask, BackgroundTasksKeys } from './types';
import backgroundTasksKeys from './keys';

const fetchBackgroundTask = (analysisId: string, id?: string) =>
  fetcher<IBackgroundTask>({
    path: `/analyses/${analysisId}/background_tasks/${id}`,
    action: 'get',
  });

const useAnalysisBackgroundTask = (
  analysisId: string,
  backgroundTaskId?: string
) => {
  return useQuery<
    IBackgroundTask,
    CLErrors,
    IBackgroundTask,
    BackgroundTasksKeys
  >({
    queryKey: backgroundTasksKeys.item({ id: backgroundTaskId }),
    queryFn: () => fetchBackgroundTask(analysisId, backgroundTaskId),
    enabled: !!backgroundTaskId,
  });
};

export default useAnalysisBackgroundTask;
