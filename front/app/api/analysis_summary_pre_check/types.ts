import { IInputsFilterParams } from 'api/analysis_inputs/types';

export interface ISummaryPreCheckData {
  id: string;
  type: 'summary_pre_check';
  attributes: {
    /** Number between 0 and 1 to indicate how accurate we estimate the summary
     * to be. Can be null if unknown */
    accuracy: number | null;
    impossible_reason: 'too_many_inputs' | null;
  };
}

export interface ISummaryPreCheck {
  data: ISummaryPreCheckData;
}

export interface ISummaryPreCheckAdd {
  analysisId: string;
  filters: IInputsFilterParams;
}
