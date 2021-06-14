import { useState, useEffect } from 'react';
import {
  insightsViewStream,
  IInsightsViewData,
} from '../services/insightsViews';

const useInsightsView = (id: string) => {
  const [insightsView, setInsightsView] = useState<
    IInsightsViewData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsViewStream(id).observable.subscribe(
      (insightsView) => {
        setInsightsView(insightsView.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [id]);

  return insightsView;
};

export default useInsightsView;
