import { Keys } from 'utils/cl-react-query/types';
import summariesKeys from './keys';
import { IInputsFilterParams } from 'api/analysis_inputs/types';

export type SummariesKeys = Keys<typeof summariesKeys>;

export interface ISummaryParams {
  analysisId: string;
}

export interface ISummaryParam {
  id: string;
  type: 'summary';
  attributes: {
    filters: IInputsFilterParams;
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

export interface ISummaries {
  data: ISummaryParam[];
}

export interface ISummary {
  data: ISummaryParam;
}

export interface ISummaryAdd {
  analysisId: string;
  filters: IInputsFilterParams;
}
