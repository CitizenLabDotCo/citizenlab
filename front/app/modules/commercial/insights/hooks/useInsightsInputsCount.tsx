import { useState, useEffect } from 'react';
import {
  insightsInputsCountStream,
  IInsightsInputsCount,
} from '../services/insightsInputsCount';

export type QueryParameters = {
  categories: string[];
  keywords: string[];
  search: string;
  processed: boolean;
};

const useInsightsInputsCount = (
  viewId: string,
  queryParameters: Partial<QueryParameters> = {}
) => {
  const [insightsInputsCount, setInsightsInputsCount] = useState<
    IInsightsInputsCount | undefined | null | Error
  >(undefined);

  const stringifiedQueryParameters = JSON.stringify(queryParameters);

  useEffect(() => {
    const subscription = insightsInputsCountStream(viewId, {
      queryParameters: JSON.parse(stringifiedQueryParameters),
    }).observable.subscribe((insightsInputsCount) => {
      setInsightsInputsCount(insightsInputsCount);
    });

    return () => subscription.unsubscribe();
  }, [viewId, stringifiedQueryParameters]);

  return insightsInputsCount;
};

export default useInsightsInputsCount;
