import { useState, useEffect } from 'react';
import {
  insightsInputsCountStream,
  IInsightsInputsCount,
} from '../services/insightsInputsCount';

type QueryParameters = {
  category: string;
  search: string;
};

const useInsightsCategories = (
  viewId: string,
  queryParameters?: Partial<QueryParameters>
) => {
  const [insightsCategories, setInsightsCategories] = useState<
    IInsightsInputsCount | undefined | null | Error
  >(undefined);

  const category = queryParameters?.category;
  const search = queryParameters?.search;

  useEffect(() => {
    const subscription = insightsInputsCountStream(viewId, {
      queryParameters: {
        category,
        search,
      },
    }).observable.subscribe((insightsCategories) => {
      setInsightsCategories(insightsCategories);
    });

    return () => subscription.unsubscribe();
  }, [viewId, category, search]);

  return insightsCategories;
};

export default useInsightsCategories;
