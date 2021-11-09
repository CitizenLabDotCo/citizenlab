import { useState, useEffect } from 'react';
import {
  insightsInputsCountStream,
  IInsightsInputsCount,
} from '../services/insightsInputsCount';

export type QueryParameters = {
  categories: string[];
  search: string;
  processed: boolean;
};

const useInsightsInputsCount = (
  viewId: string,
  queryParameters?: Partial<QueryParameters>
) => {
  const [insightsInputsCount, setInsightsInputsCount] = useState<
    IInsightsInputsCount | undefined | null | Error
  >(undefined);

  const categories = queryParameters?.categories;
  const search = queryParameters?.search;
  const processed = queryParameters?.processed;

  useEffect(() => {
    const subscription = insightsInputsCountStream(viewId, {
      queryParameters: {
        categories,
        search,
        processed,
      },
    }).observable.subscribe((insightsInputsCount) => {
      setInsightsInputsCount(insightsInputsCount);
    });

    return () => subscription.unsubscribe();
  }, [viewId, categories, search, processed]);

  return insightsInputsCount;
};

export default useInsightsInputsCount;
