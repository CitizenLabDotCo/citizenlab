import { useState, useEffect } from 'react';
import {
  insightsDetectedCategoriesStream,
  IInsightsDetectedCategoriesData,
} from '../services/insightsDetectCategories';
import { isNilOrError } from 'utils/helperUtils';

const useInsightsDetectedCategories = (viewId: string) => {
  const [detectedCategories, setDetectedCategories] = useState<
    IInsightsDetectedCategoriesData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsDetectedCategoriesStream(
      viewId
    ).observable.subscribe((detectedCategories) => {
      isNilOrError(detectedCategories)
        ? setDetectedCategories(detectedCategories)
        : setDetectedCategories(detectedCategories.data);
    });

    return () => subscription.unsubscribe();
  }, [viewId]);

  return detectedCategories;
};

export default useInsightsDetectedCategories;
