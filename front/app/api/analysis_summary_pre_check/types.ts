import { IInputsFilterParams } from 'api/analysis_inputs/types';

export interface ISummaryPreCheckData {
  id: string;
  type: 'summary_pre_check';
  attributes: {
    accuracy: 'low' | 'medium' | 'high' | null;
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
