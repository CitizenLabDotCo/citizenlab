import { useState, useEffect } from 'react';
import {
  insightsInputsCountStream,
  IInsightsInputsCount,
} from '../services/insightsInputsCount';

export type QueryParameters = {
  category: string;
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
    }).observable.subscribe((insightsInputsCount) => {
      setInsightsInputsCount(insightsInputsCount);
    });

    return () => subscription.unsubscribe();
  }, [viewId, category, search, processed]);

  return insightsInputsCount;
};

export default useInsightsInputsCount;
