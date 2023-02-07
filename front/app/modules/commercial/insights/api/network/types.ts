import networkKeys from './keys';

export type NetworkKeys = ReturnType<
  typeof networkKeys[keyof typeof networkKeys]
>;

export interface IInsightsTextNetworkAnalysisTasksData {
  id: string;
  type: 'text_network_analysis_task';
  attributes: {
    created_at: string;
  };
}

export interface IInsightsTextNetworkAnalysisTasks {
  data: IInsightsTextNetworkAnalysisTasksData[];
}

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
  weight: number;
}

export type IInsightsNetworkData = {
  id: string;
  type: 'network';
  attributes: {
    nodes: IInsightsNetworkNode[];
    links: IInsightsNetworkLink[];
  };
};
