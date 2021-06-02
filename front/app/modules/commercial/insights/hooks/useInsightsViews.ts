import { useState, useEffect } from 'react';
import {
  insightsViewsStream,
  IInsightsViewData,
} from '../services/insightsViews';

const useInsightsViews = () => {
  const [insightsViews, setInsightsViews] = useState<
    IInsightsViewData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsViewsStream().observable.subscribe(
      (insightsViews) => {
        setInsightsViews(insightsViews.data);
      }
    );

    return () => subscription.unsubscribe();
  });

  return insightsViews;
};

export default useInsightsViews;
