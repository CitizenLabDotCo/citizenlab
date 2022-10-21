import { useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import {
  IInsightsCategoryData,
  insightsCategoriesStream,
} from '../services/insightsCategories';

const useInsightsCategories = (viewId: string) => {
  const [insightsCategories, setInsightsCategories] = useState<
    IInsightsCategoryData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsCategoriesStream(viewId).observable.subscribe(
      (insightsCategories) => {
        isNilOrError(insightsCategories)
          ? setInsightsCategories(insightsCategories)
          : setInsightsCategories(insightsCategories.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [viewId]);

  return insightsCategories;
};

export default useInsightsCategories;
