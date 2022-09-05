import { useState, useEffect } from 'react';
import {
  insightsCategoryStream,
  IInsightsCategoryData,
} from '../services/insightsCategories';
import { isNilOrError } from 'utils/helperUtils';

const useInsightsCategory = (viewId: string, id: string) => {
  const [insightsCategory, setInsightsCategory] = useState<
    IInsightsCategoryData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsCategoryStream(
      viewId,
      id
    ).observable.subscribe((insightsCategory) => {
      isNilOrError(insightsCategory)
        ? setInsightsCategory(insightsCategory)
        : setInsightsCategory(insightsCategory.data);
    });

    return () => subscription.unsubscribe();
  }, [viewId, id]);

  return insightsCategory;
};

export default useInsightsCategory;
