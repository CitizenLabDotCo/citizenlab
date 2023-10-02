import { Keys } from 'utils/cl-react-query/types';
import insightsKeys from './keys';

export type InsightsKeys = Keys<typeof insightsKeys>;

export interface IInsightsParams {
  analysisId: string;
  bookmarked?: boolean;
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

export interface IInsights {
  data: IInsightData[];
}

export interface IInsight {
  data: IInsightData;
}
