import { useState, useEffect } from 'react';
import { insightsViewStream, IInsightsView } from '../services/insightsViews';

const useInsightsView = (id: string) => {
  const [insightsView, setInsightsView] = useState<
    IInsightsView | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsViewStream(id).observable.subscribe(
      (insightsView) => {
        setInsightsView(insightsView);
      }
    );

    return () => subscription.unsubscribe();
  }, [id]);

  return insightsView;
};

export default useInsightsView;
