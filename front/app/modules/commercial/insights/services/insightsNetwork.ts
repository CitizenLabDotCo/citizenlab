import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const getInsightsInputsEndpoint = (viewId: string) =>
  `insights/views/${viewId}/network`;

export interface IInsightsNetwork {
  data: IInsightsNetworkData;
}

export type IInsightsNetworkData = {
  id: string;
  type: 'network';
  attributes: {
    nodes: {
      id?: string;
      name?: string;
      val?: number;
      cluster_id?: string | null;
      color?: string;
    };
    links: { target: string; source: string };
  };
};

export function insightsNetworkStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsNetwork>({
    apiEndpoint: `${API_PATH}/${getInsightsInputsEndpoint(insightsViewId)}`,
    ...streamParams,
  });
}
