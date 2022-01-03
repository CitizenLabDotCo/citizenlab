import { useState, useEffect, useRef } from 'react';
import {
  insightsInputsCountStream,
  IInsightsInputsCount,
} from '../services/insightsInputsCount';
import { isEqual } from 'lodash-es';

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

  const previousViewId = useRef<string>();
  const previousQueryParameters = useRef<Partial<QueryParameters>>();

  useEffect(() => {
    if (
      viewId === previousViewId.current &&
      isEqual(queryParameters, previousQueryParameters.current)
    ) {
      return;
    }

    previousViewId.current = viewId;
    previousQueryParameters.current = queryParameters;

    const subscription = insightsInputsCountStream(viewId, {
      queryParameters,
    }).observable.subscribe((insightsInputsCount) => {
      setInsightsInputsCount(insightsInputsCount);
    });

    return () => subscription.unsubscribe();
  }, [viewId, queryParameters]);

  return insightsInputsCount;
};

export default useInsightsInputsCount;
