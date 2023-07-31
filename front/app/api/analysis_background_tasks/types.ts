import { Keys } from 'utils/cl-react-query/types';
import backgroundTasksKeys from './keys';

export type BackgroundTasksKeys = Keys<typeof backgroundTasksKeys>;

type SharedAttributes = {
  type: string;
  progress: number | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  ended_at: string | null;
  state: 'queued' | 'in_progress' | 'succeeded' | 'failed';
};
type AutoTaggingAttributes = SharedAttributes & {
  type: 'auto_tagging_task';
  auto_tagging_method: 'controversial';
};

type SummarizingAttributes = SharedAttributes & {
  type: 'summarizing_task';
};

export interface IBackgroundTaskData {
  id: string;
  type: 'analysis_background_task';
  attributes: AutoTaggingAttributes | SummarizingAttributes;
}

export interface IBackgroundTasks {
  data: IBackgroundTaskData[];
}

export interface IBackgroundTask {
  data: IBackgroundTaskData;
}
