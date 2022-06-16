import { useState, useEffect } from 'react';

// services
import {
  referenceDistributionStream,
  IReferenceDistributionData,
  IReferenceDistribution,
} from '../services/referenceDistribution';
import {
  userCustomFieldStream,
  IUserCustomField,
} from 'modules/commercial/user_custom_fields//services/userCustomFields';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

function useReferenceDistribution(customFieldId: string) {
  const [referenceDistribution, setReferenceDistribution] = useState<
    IReferenceDistributionData | NilOrError
  >();
  const [referenceDataUploaded, setReferenceDataUploaded] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    const observable = userCustomFieldStream(customFieldId).observable;

    const subscription = observable.subscribe(
      (userCustomField: IUserCustomField | NilOrError) => {
        if (isNilOrError(userCustomField)) {
          setReferenceDataUploaded(false);
          return;
        }

        setReferenceDataUploaded(
          !!userCustomField.data.relationships?.current_ref_distribution.data
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [customFieldId]);

  useEffect(() => {
    if (!referenceDataUploaded) {
      setReferenceDistribution(null);
      return;
    }

    const observable = referenceDistributionStream(customFieldId).observable;
    const subscription = observable.subscribe(
      (referenceDistribution: IReferenceDistribution | NilOrError) => {
        isNilOrError(referenceDistribution)
          ? setReferenceDistribution(referenceDistribution)
          : setReferenceDistribution(referenceDistribution.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [customFieldId, referenceDataUploaded]);

  return { referenceDistribution, referenceDataUploaded };
}

export default useReferenceDistribution;
