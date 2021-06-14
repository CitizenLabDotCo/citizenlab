import { useState, useEffect } from 'react';
import {
  insightsInputsStream,
  IInsightsInputData,
} from '../services/insightsInputs';

type QueryParameters = { category?: string; search?: string };

const useInsightsInputs = (
  viewId: string,
  queryParameters?: QueryParameters
) => {
  const [insightsInputs, setInsightsInputs] = useState<
    IInsightsInputData[] | undefined | null | Error
  >(undefined);

  const category = queryParameters?.category;
  const search = queryParameters?.search;

  useEffect(() => {
    const subscription = insightsInputsStream(viewId, {
      queryParameters,
    }).observable.subscribe((insightsInputs) => {
      setInsightsInputs(insightsInputs.data);
    });

    return () => subscription.unsubscribe();
  }, [viewId, category, search]);

  return insightsInputs;
};

export default useInsightsInputs;
