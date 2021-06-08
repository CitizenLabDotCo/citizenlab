import { useState, useEffect } from 'react';
import {
  insightsInputsStream,
  IInsightsInputData,
} from '../services/insightsInputs';

type QueryParameters = { category: string };

const useInsightsViews = (
  viewId: string,
  queryParameters?: QueryParameters
) => {
  const [insightsViews, setInsightsViews] = useState<
    IInsightsInputData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsInputsStream(viewId, {
      queryParameters,
    }).observable.subscribe((insightsViews) => {
      setInsightsViews(insightsViews.data);
    });

    return () => subscription.unsubscribe();
  });

  return insightsViews;
};

export default useInsightsViews;
