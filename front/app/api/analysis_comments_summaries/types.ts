import { Keys } from 'utils/cl-react-query/types';

import summariesKeys from './keys';

export type SummariesKeys = Keys<typeof summariesKeys>;

export interface ICommentsSummaryParams {
  analysisId: string;
  inputId: string;
}

export interface ICommentsSummaryData {
  id: string;
  type: 'comments_summary';
  attributes: {
    summary: string | null;
    comments_count: number;
    accuracy: number | null;
    created_at: string;
    updated_at: string;
    generated_at: string | null;
    /** How many comments are new since the time this summary was first generated? */
    missing_comments_count: number;
  };
  relationships: {
    background_task: {
      data: {
        id: string;
        type: 'background_task';
      };
    };
  };
}

export interface ICommentsSummary {
  data: ICommentsSummaryData;
}

export interface ICommentsSummaryGenerate {
  analysisId: string;
  inputId: string;
}
