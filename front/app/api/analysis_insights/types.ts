import { IInputsFilterParams } from 'api/analysis_inputs/types';

import { Keys } from 'utils/cl-react-query/types';

import insightsKeys from './keys';

export type InsightsKeys = Keys<typeof insightsKeys>;

export interface IInsightsParams {
  analysisId?: string;
}

export interface IInsightData {
  id: string;
  type: 'insight';

  relationships: {
    background_task: {
      data: {
        id: string;
        type: 'background_task';
      };
    };
    insightable: {
      data: {
        id: string;
        type: 'summary' | 'analysis_question';
      };
    };
  };
}

// The insights index endpoint side-loads each insightable (summary /
// analysis_question) and its background_task via JSON:API `included`. We only
// model the `filters` we read off summaries and questions; background_task
// entries simply won't carry it.
export interface IIncludedInsightable {
  id: string;
  type: 'summary' | 'analysis_question' | 'background_task';
  attributes?: {
    filters?: IInputsFilterParams;
  };
}

export interface IInsights {
  data: IInsightData[];
  included?: IIncludedInsightable[];
}

export interface IInsight {
  data: IInsightData;
}
