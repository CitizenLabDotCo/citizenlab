import { useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import {
  IInsightsInputData,
  insightsInputStream,
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
      isNilOrError(insightsInput)
        ? setInsightsInput(insightsInput)
        : setInsightsInput(insightsInput.data);
    });

    return () => subscription.unsubscribe();
  }, [viewId, inputId]);

  return insightsInput;
};

export default useInsightsInput;
