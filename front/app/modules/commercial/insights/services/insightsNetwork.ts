import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const getInsightsNetworkEndpoint = (viewId: string) =>
  `insights/views/${viewId}/network`;

export interface IInsightsNetwork {
  data: IInsightsNetworkData;
}

export interface IInsightsNetworkNode {
  id: string;
  name: string;
  val: number;
  cluster_id: string | null;
  color: string;
  color_index: number;
}

export interface IInsightsNetworkLink {
  target: string;
  source: string;
}

export type IInsightsNetworkData = {
  id: string;
  type: 'network';
  attributes: {
    nodes: IInsightsNetworkNode[];
    links: IInsightsNetworkLink[];
  };
};

export function insightsNetworkStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsNetwork>({
    apiEndpoint: `${API_PATH}/${getInsightsNetworkEndpoint(insightsViewId)}`,
    ...streamParams,
  });
}
