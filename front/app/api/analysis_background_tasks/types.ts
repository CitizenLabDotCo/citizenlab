import { Keys } from 'utils/cl-react-query/types';
import backgroundTasksKeys from './keys';

export type BackgroundTasksKeys = Keys<typeof backgroundTasksKeys>;

export interface IBackgroundTaskData {
  id: string;
  type: 'analysis_background_task';
  attributes: {
    progress: number | null;
    type: 'auto_tagging' | 'summarizing';
    auto_tagging_method: string;
    created_at: string;
    ended_at: string;
    state: 'queued' | 'in_progress' | 'succeeded' | 'failed';
  };
}

export interface IBackgroundTasks {
  data: IBackgroundTaskData[];
}

export interface IBackgroundTask {
  data: IBackgroundTaskData;
}
