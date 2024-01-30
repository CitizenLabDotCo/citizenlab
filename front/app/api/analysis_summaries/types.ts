import { Keys } from 'utils/cl-react-query/types';
import summariesKeys from './keys';
import { IInputsFilterParams } from 'api/analysis_inputs/types';

export type SummariesKeys = Keys<typeof summariesKeys>;

export interface ISummaryParams {
  analysisId: string;
  id: string;
}

export interface ISummaryData {
  id: string;
  type: 'summary';
  attributes: {
    filters: IInputsFilterParams;
    summary: string | null;
    /** Number between 0 and 1 to indicate how accurate we estimate the summary
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

export interface ISummary {
  data: ISummaryData;
}

export interface ISummaryAdd {
  analysisId: string;
  filters: IInputsFilterParams;
}
