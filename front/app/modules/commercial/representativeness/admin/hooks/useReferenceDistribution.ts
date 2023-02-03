import { useState, useEffect } from 'react';

// services
import {
  referenceDistributionStream,
  TReferenceDistributionData,
  IReferenceDistribution,
  IBinnedDistribution,
  TCategoricalDistribution,
} from '../services/referenceDistribution';
import {
  userCustomFieldStream,
  IUserCustomField,
} from 'services/userCustomFields';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { forEachBin } from '../utils/bins';

/*
 * This is an intermediate data structure that is able to represent
 * both 'categorical' and 'binned' reference distributions. This
 * makes it easier to deal with different types of distributions
 * in the same interface (i.e. the 'Field' component)
 */
export type RemoteFormValues = Record<string, number>;

function useReferenceDistribution(userCustomFieldId: string) {
  const [referenceDistribution, setReferenceDistribution] = useState<
    TReferenceDistributionData | NilOrError
  >();
  const [referenceDataUploaded, setReferenceDataUploaded] = useState<
    boolean | undefined
  >();
  const [remoteFormValues, setRemoteFormValues] = useState<
    RemoteFormValues | undefined
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
        if (!isNilOrError(referenceDistribution)) {
          const distributionData = referenceDistribution.data;

          setReferenceDistribution(distributionData);
          setRemoteFormValues(getRemoteFormValues(distributionData));
        } else {
          setReferenceDistribution(referenceDistribution);
          setRemoteFormValues(undefined);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [userCustomFieldId, referenceDataUploaded]);

  return {
    referenceDistribution,
    referenceDataUploaded,
    remoteFormValues,
  };
}

export const getRemoteFormValues = ({
  type,
  attributes: { distribution },
}: TReferenceDistributionData) => {
  if (type === 'binned_distribution') {
    return convertBinsToRemoteFormValues(distribution as IBinnedDistribution);
  }
  return convertCategoriesToRemoteFormValues(
    distribution as TCategoricalDistribution
  );
};

const convertBinsToRemoteFormValues = ({
  bins,
  counts,
}: IBinnedDistribution): RemoteFormValues => {
  return forEachBin(bins).reduce(
    (acc, { binId }, i) => ({
      ...acc,
      [binId]: counts[i],
    }),
    {}
  );
};

const convertCategoriesToRemoteFormValues = (
  distribution: TCategoricalDistribution
): RemoteFormValues =>
  Object.keys(distribution).reduce(
    (acc, key) => ({ ...acc, [key]: distribution[key].count }),
    {}
  );

export default useReferenceDistribution;
