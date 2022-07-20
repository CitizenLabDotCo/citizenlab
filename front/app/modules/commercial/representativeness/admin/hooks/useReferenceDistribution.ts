import { useState, useEffect } from 'react';

// services
import {
  referenceDistributionStream,
  TReferenceDistributionData,
  IReferenceDistribution,
} from '../services/referenceDistribution';
import {
  userCustomFieldStream,
  IUserCustomField,
} from 'modules/commercial/user_custom_fields//services/userCustomFields';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

function useReferenceDistribution(userCustomFieldId: string) {
  const [referenceDistribution, setReferenceDistribution] = useState<
    TReferenceDistributionData | NilOrError
  >();
  const [referenceDataUploaded, setReferenceDataUploaded] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    const observable = userCustomFieldStream(userCustomFieldId).observable;

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
  }, [userCustomFieldId]);

  useEffect(() => {
    if (!referenceDataUploaded) {
      setReferenceDistribution(null);
      return;
    }

    const observable =
      referenceDistributionStream(userCustomFieldId).observable;
    const subscription = observable.subscribe(
      (referenceDistribution: IReferenceDistribution | NilOrError) => {
        isNilOrError(referenceDistribution)
          ? setReferenceDistribution(referenceDistribution)
          : setReferenceDistribution(referenceDistribution.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [userCustomFieldId, referenceDataUploaded]);

  return { referenceDistribution, referenceDataUploaded };
}

export default useReferenceDistribution;
