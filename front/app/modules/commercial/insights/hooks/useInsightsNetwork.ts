import { useState, useEffect } from 'react';
import {
  insightsNetworkStream,
  IInsightsNetwork,
} from '../services/insightsNetwork';

import { interval } from 'rxjs';
import { takeWhile, finalize } from 'rxjs/operators';

import streams from 'utils/streams';

import { insightsTextNetworkAnalysisTasksStream } from 'modules/commercial/insights/services/insightsTextNetworkAnalysisTasks';

const pollingStream = interval(3000);
export const queryParameters = { max_nb_nodes: 100, max_density: 0.06 };

const useInsightsNetwork = (viewId: string) => {
  const [loading, setLoading] = useState(true);
  const [insightsNetwork, setInsightsNetwork] = useState<
    IInsightsNetwork | undefined | null | Error
  >();

  useEffect(() => {
    const subscription = insightsNetworkStream(viewId, {
      queryParameters,
    }).observable.subscribe((insightsNetwork) => {
      if (!loading) {
        setInsightsNetwork(insightsNetwork);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [viewId, loading]);

  useEffect(() => {
    // Refetch pending tasks at an interval
    const subscription = pollingStream.subscribe(() => {
      streams.fetchAllWith({
        partialApiEndpoint: [
          `insights/views/${viewId}/tasks/text_network_analysis`,
        ],
      });
    });
    const streamSubscription = insightsTextNetworkAnalysisTasksStream(viewId)
      .observable.pipe(
        // Poll while there are pending tasks
        takeWhile((response) => {
          return response.data.length > 0;
        }),
        // Refetch network when there are no pending tasks
        finalize(() => {
          subscription.unsubscribe();
          setLoading(false);
        })
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      streamSubscription.unsubscribe();
    };
  }, [viewId]);

  return { loading, network: insightsNetwork };
};

export default useInsightsNetwork;
