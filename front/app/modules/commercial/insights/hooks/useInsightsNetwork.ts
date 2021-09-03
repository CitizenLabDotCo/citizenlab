import { useState, useEffect } from 'react';
import {
  insightsNetworkStream,
  IInsightsNetworkData,
} from '../services/insightsNetwork';

const useInsightsNetwork = (viewId: string) => {
  const [insightsNetwork, setInsightsNetwork] = useState<
    IInsightsNetworkData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsNetworkStream(viewId).observable.subscribe(
      (insightsNetwork) => {
        setInsightsNetwork(insightsNetwork.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [viewId]);

  return insightsNetwork;
};

export default useInsightsNetwork;
