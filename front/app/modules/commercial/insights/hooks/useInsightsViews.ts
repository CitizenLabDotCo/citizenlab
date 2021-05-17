import { useState, useEffect } from 'react';
import {
  insightsViewsStream,
  IInsightsViewData,
} from '../services/insightsViews';

export default function useInsightsViews() {
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
}
