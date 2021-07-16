import { useState, useEffect } from 'react';
import {
  insightsInputStream,
  IInsightsInputData,
} from '../services/insightsInputs';

const useInsightsInput = (viewId: string, inputId: string) => {
  const [insightsInput, setInsightsInput] = useState<
    IInsightsInputData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = insightsInputStream(
      viewId,
      inputId
    ).observable.subscribe((insightsInput) => {
      setInsightsInput(insightsInput.data);
    });

    return () => subscription.unsubscribe();
  }, [viewId, inputId]);

  return insightsInput;
};

export default useInsightsInput;
