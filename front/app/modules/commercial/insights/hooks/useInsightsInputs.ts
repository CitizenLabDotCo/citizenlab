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

  const category = queryParameters?.category;

  useEffect(() => {
    const subscription = insightsInputsStream(viewId, {
      queryParameters,
    }).observable.subscribe((insightsViews) => {
      setInsightsViews(insightsViews.data);
    });

    return () => subscription.unsubscribe();
  }, [viewId, category]);

  return insightsViews;
};

export default useInsightsViews;
