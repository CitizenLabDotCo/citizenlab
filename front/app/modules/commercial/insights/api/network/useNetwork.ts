import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import networkKeys from './keys';
import {
  IInsightsNetwork,
  IInsightsTextNetworkAnalysisTasks,
  NetworkKeys,
} from './types';

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

const useNetwork = (viewId: string) => {
  const [tasks, setTasks] = useState<
    IInsightsTextNetworkAnalysisTasks | undefined
  >();

  useQuery<
    IInsightsTextNetworkAnalysisTasks,
    CLErrors,
    IInsightsTextNetworkAnalysisTasks,
    NetworkKeys
  >({
    queryKey: networkKeys.tasks(viewId),
    queryFn: async () => {
      const response = await fetchTasks(viewId);
      setTasks(response);
      return response;
    },
    enabled: tasks && tasks.data.length > 0,
    keepPreviousData: false,
    refetchInterval: 1000,
  });

  return useQuery<IInsightsNetwork, CLErrors, IInsightsNetwork, NetworkKeys>({
    queryKey: networkKeys.network(viewId),
    queryFn: () => fetchNetwork(viewId),
    enabled: tasks && tasks.data.length === 0 ? true : false,
    retry: false,
  });
};

export default useNetwork;
