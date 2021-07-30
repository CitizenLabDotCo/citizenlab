import { useState, useEffect } from 'react';
import {
  insightsInputsCountStream,
  IInsightsInputsCount,
} from '../services/insightsInputsCount';

type QueryParameters = {
  category: string;
  search: string;
  processed: boolean;
};

const useInsightsInputsCount = (
  viewId: string,
  queryParameters?: Partial<QueryParameters>
) => {
  const [insightsCategories, setInsightsCategories] = useState<
    IInsightsInputsCount | undefined | null | Error
  >(undefined);

  const category = queryParameters?.category;
  const search = queryParameters?.search;
  const processed = queryParameters?.processed;

  useEffect(() => {
    const subscription = insightsInputsCountStream(viewId, {
      queryParameters: {
        category,
        search,
        processed,
      },
    }).observable.subscribe((insightsCategories) => {
      setInsightsCategories(insightsCategories);
    });

    return () => subscription.unsubscribe();
  }, [viewId, category, search, processed]);

  return insightsCategories;
};

export default useInsightsInputsCount;
