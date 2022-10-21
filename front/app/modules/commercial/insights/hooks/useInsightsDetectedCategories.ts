import { useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import {
  IInsightsDetectedCategoriesData,
  insightsDetectedCategoriesStream,
} from '../services/insightsDetectCategories';

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
