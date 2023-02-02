import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';

const networkKeys = {
  network: (viewId: string) =>
    [{ type: 'network', entity: 'detail', viewId }] as const,
  tasks: (viewId: string) =>
    [{ type: 'text_network_analysis_task', entity: 'list', viewId }] as const,
};

type NetworkKeys = ReturnType<typeof networkKeys[keyof typeof networkKeys]>;

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

const fetchTasks = (viewId: string) =>
  fetcher<IInsightsTextNetworkAnalysisTasks>({
    path: `/insights/views/${viewId}/tasks/text_network_analysis`,
    action: 'get',
  });

const fetchNetwork = (viewId: string) =>
  fetcher<IInsightsNetwork>({
    path: `/insights/views/${viewId}/network`,
    action: 'get',
  });

export const useNetwork = (viewId: string) => {
  const { data: tasks } = useQuery<
    IInsightsTextNetworkAnalysisTasks,
    CLErrors,
    IInsightsTextNetworkAnalysisTasks,
    NetworkKeys
  >({
    queryKey: networkKeys.tasks(viewId),
    queryFn: () => fetchTasks(viewId),
    // add condition to stop the polling
  });

  return useQuery<IInsightsNetwork, CLErrors, IInsightsNetwork, NetworkKeys>({
    queryKey: networkKeys.network(viewId),
    queryFn: () => fetchNetwork(viewId),
    enabled: tasks && tasks.data.length === 0,
  });
};
