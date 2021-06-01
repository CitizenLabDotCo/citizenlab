import { useState, useEffect } from 'react';
import {
  insightsInputsStream,
  IInsightsInputData,
} from '../services/insightsInputs';

const useInsightsViews = (viewId: string) => {
  const [insightsViews, setInsightsViews] = useState<
    IInsightsInputData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsInputsStream(viewId).observable.subscribe(
      (insightsViews) => {
        setInsightsViews(insightsViews.data);
      }
    );

    return () => subscription.unsubscribe();
  });

  return insightsViews;
};

export default useInsightsViews;
