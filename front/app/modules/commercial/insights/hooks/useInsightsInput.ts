import { useState, useEffect } from 'react';
import {
  insightsInputStream,
  IInsightsInputData,
} from '../services/insightsInputs';

const useInsightsViews = (viewId: string, inputId: string) => {
  const [insightsViews, setInsightsViews] = useState<
    IInsightsInputData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsInputStream(
      viewId,
      inputId
    ).observable.subscribe((insightsViews) => {
      setInsightsViews(insightsViews.data);
    });

    return () => subscription.unsubscribe();
  });

  return insightsViews;
};

export default useInsightsViews;
