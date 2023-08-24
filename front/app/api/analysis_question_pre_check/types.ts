import { IInputsFilterParams } from 'api/analysis_inputs/types';

export interface IQuestionPreCheckData {
  id: string;
  type: 'question_pre_check';
  attributes: {
    /** Number between 0 and 1 to indicate how accurate we estimate the answer
     * to be. Can be null if unknown */
    accuracy: number | null;
    impossible_reason: 'too_many_inputs' | null;
  };
}

export interface IQuestionPreCheck {
  data: IQuestionPreCheckData;
}

export interface IQuestionPreCheckAdd {
  analysisId: string;
  filters: IInputsFilterParams;
}
