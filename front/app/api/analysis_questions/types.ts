import { Keys } from 'utils/cl-react-query/types';
import questionsKeys from './keys';
import { IInputsFilterParams } from 'api/analysis_inputs/types';

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

export interface IQuestion {
  data: IQuestionData;
}

export interface IQuestionAdd {
  analysisId: string;
  filters: IInputsFilterParams;
  question: string;
}
