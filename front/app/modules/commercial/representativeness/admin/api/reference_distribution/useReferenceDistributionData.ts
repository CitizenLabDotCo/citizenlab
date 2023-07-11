// services
import {
  TReferenceDistributionData,
  IBinnedDistribution,
  TCategoricalDistribution,
} from './types';

// utils
import { forEachBin } from '../../utils/bins';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';
import useReferenceDistribution from './useReferenceDistribution';

/*
 * This is an intermediate data structure that is able to represent
 * both 'categorical' and 'binned' reference distributions. This
 * makes it easier to deal with different types of distributions
 * in the same interface (i.e. the 'Field' component)
 */
export type RemoteFormValues = Record<string, number>;

function useReferenceDistributionData(userCustomFieldId: string) {
  const { data: userCustomField, isFetched: isFetchedCustomField } =
    useUserCustomField(userCustomFieldId);

  const {
    data: referenceDistribution,
    isFetched: isFetchedReferenceDistribution,
  } = useReferenceDistribution({
    id: userCustomFieldId,
  });

  const referenceDataUploaded =
    !!userCustomField?.data.relationships?.current_ref_distribution.data;

  return {
    isFetchedReferenceDistributionData:
      isFetchedCustomField || isFetchedReferenceDistribution,
    referenceDistribution: referenceDistribution?.data,
    referenceDataUploaded,
    remoteFormValues: referenceDistribution
      ? getRemoteFormValues(referenceDistribution.data)
      : undefined,
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

export default useReferenceDistributionData;
