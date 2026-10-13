export type FeedbackPromptKey = 'project_setup_ease' | 'return_findability';

export type FeedbackPromptUiVersion =
  | 'project_backoffice_v1'
  | 'project_backoffice_v2';

export interface IFeedbackPromptData {
  id: string;
  type: 'feedback_prompt';
  attributes: {
    key: FeedbackPromptKey;
    status: 'pending' | 'shown' | 'answered' | 'dismissed';
  };
}

export interface IFeedbackPrompt {
  data: IFeedbackPromptData;
}

export interface IFeedbackPromptAnswer {
  id: string;
  score: number;
  comment?: string;
}
