import { useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import {
  IInsightsViewData,
  insightsViewsStream,
} from '../services/insightsViews';

const useInsightsViews = () => {
  const [insightsViews, setInsightsViews] = useState<
    IInsightsViewData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsViewsStream().observable.subscribe(
      (insightsViews) => {
        isNilOrError(insightsViews)
          ? setInsightsViews(insightsViews)
          : setInsightsViews(insightsViews.data);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return insightsViews;
};

export default useInsightsViews;
