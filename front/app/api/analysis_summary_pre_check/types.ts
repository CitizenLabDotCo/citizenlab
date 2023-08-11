import { IInputsFilterParams } from 'api/analysis_inputs/types';

export interface ISummaryPreCheckParams {
  analysisId: string;
}

export interface ISummaryPreCheckParam {
  id: string;
  type: 'summary_pre_check';
  attributes: {
    accuracy: 'low' | 'medium' | 'high' | null;
    impossible_reason: 'too_many_inputs' | null;
  };
}

export interface ISummaryPreCheck {
  data: ISummaryPreCheckParam;
}

export interface ISummaryPreCheckAdd {
  analysisId: string;
  filters: IInputsFilterParams;
}
