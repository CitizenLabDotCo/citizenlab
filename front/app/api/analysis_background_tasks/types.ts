import { Keys } from 'utils/cl-react-query/types';
import backgroundTasksKeys from './keys';

export type BackgroundTasksKeys = Keys<typeof backgroundTasksKeys>;

export type AutoTaggingMethod =
  | 'custom'
  | 'language'
  | 'platform_topic'
  | 'nlp_topic'
  | 'sentiment'
  | 'controversial'
  | 'label_classification'
  | 'few_shot_classification';

export type TagType =
  | 'custom'
  | 'language'
  | 'platform_topic'
  | 'nlp_topic'
  | 'sentiment'
  | 'controversial';

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
  auto_tagging_method: AutoTaggingMethod;
};

type SummarizingAttributes = SharedAttributes & {
  type: 'summarization_task';
};

export interface IBackgroundTaskData {
  id: string;
  type: 'background_task';
  attributes: AutoTaggingAttributes | SummarizingAttributes;
}

export interface IBackgroundTasks {
  data: IBackgroundTaskData[];
}

export interface IBackgroundTask {
  data: IBackgroundTaskData;
}
