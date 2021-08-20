import { useState, useEffect } from 'react';
import {
  insightsDetectedCategoriesStream,
  IInsightsDetectedCategoriesData,
} from '../services/insightsDetectCategories';

const useInsightsDetectedCategories = (viewId: string) => {
  const [detectedCategories, setDetectedCategories] = useState<
    IInsightsDetectedCategoriesData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsDetectedCategoriesStream(
      viewId
    ).observable.subscribe((detectedCategories) => {
      setDetectedCategories(detectedCategories.data);
    });

    return () => subscription.unsubscribe();
  }, [viewId]);

  return detectedCategories;
};

export default useInsightsDetectedCategories;
