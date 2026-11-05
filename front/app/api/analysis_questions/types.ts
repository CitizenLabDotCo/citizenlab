import { IRelationship } from 'typings';

import { IInputsFilterParams } from 'api/analysis_inputs/types';

import { Keys } from 'utils/cl-react-query/types';

import questionsKeys from './keys';

export type QuestionsKeys = Keys<typeof questionsKeys>;

export interface IQuestionParams {
  analysisId: string;
  id: string;
}

export interface IQuestionData {
  id: string;
  type: 'analysis_question';
  attributes: {
    filters: IInputsFilterParams;
    question: string;
    answer: string | null;
    /** Number between 0 and 1 to indicate how accurate we estimate the answer
     * to be. Can be null if unsure or not known yet */
    accuracy: number | null;
    created_at: string;
    updated_at: string;
    generated_at: string;
    missing_inputs_count: number;
    custom_field_ids: {
      main_custom_field_id: string | null;
      additional_custom_field_ids?: string[];
    };
  };
  relationships: {
    background_task: {
      data: {
        id: string;
        type: 'background_task';
      };
    };
    files?: {
      data: IRelationship[];
    };
  };
}

export interface IQuestion {
  data: IQuestionData;
}

export interface IQuestionAdd {
  analysisId: string;
  filters: IInputsFilterParams;
  question: string;
  fileIds?: string[];
}
