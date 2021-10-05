import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

const getInsightsTextNetworkAnalysisTasksEndpoint = (viewId: string) =>
  `insights/views/${viewId}/tasks/text_network_analysis`;

export interface IInsightsTextNetworkAnalysisTasksData {
  id: string;
  type: string;
  attributes: {
    created_at: string;
  };
  relationships?: {
    categories: {
      data: IRelationship[];
    };
    inputs: {
      data: IRelationship[];
    };
  };
}

export interface IInsightsTextNetworkAnalysisTasks {
  data: IInsightsTextNetworkAnalysisTasksData[];
}

export function insightsTextNetworkAnalysisTasksStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsTextNetworkAnalysisTasks>({
    apiEndpoint: `${API_PATH}/${getInsightsTextNetworkAnalysisTasksEndpoint(
      insightsViewId
    )}`,
    ...streamParams,
    cacheStream: false,
  });
}
