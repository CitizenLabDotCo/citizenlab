import { useState, useEffect } from 'react';

// services
import {
  referenceDistributionStream,
  IReferenceDistributionData,
  IReferenceDistribution,
} from '../services/referenceDistribution';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

function useReferenceDistribution(customFieldId: string) {
  const [referenceDistribution, setReferenceDistribution] = useState<
    IReferenceDistributionData | NilOrError
  >();

  useEffect(() => {
    const observable = referenceDistributionStream(customFieldId).observable;
    const subscription = observable.subscribe(
      (referenceDistribution: IReferenceDistribution | NilOrError) => {
        isNilOrError(referenceDistribution)
          ? setReferenceDistribution(referenceDistribution)
          : setReferenceDistribution(referenceDistribution.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [customFieldId]);

  return referenceDistribution;
}

export default useReferenceDistribution;
