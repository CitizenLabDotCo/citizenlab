// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { IUserCustomFieldOptionData } from 'modules/commercial/user_custom_fields/services/userCustomFieldOptions';
import { IReferenceDistributionData } from '../../../services/referenceDistribution';
import { FormValues } from './';

export function getInitialValues(
  customFieldOptions: IUserCustomFieldOptionData[],
  referenceDataUploaded: boolean,
  referenceDistribution: IReferenceDistributionData | NilOrError
): FormValues | null {
  if (referenceDataUploaded) {
    if (isNilOrError(referenceDistribution)) return null;

    return getInitialValuesFromDistribution(
      customFieldOptions,
      referenceDistribution
    );
  }

  return getEmptyInitialValues(customFieldOptions);
}

function getInitialValuesFromDistribution(
  customFieldOptions: IUserCustomFieldOptionData[],
  referenceDistribution: IReferenceDistributionData
): FormValues {
  const { distribution } = referenceDistribution.attributes;

  return customFieldOptions.reduce((acc, { id }) => {
    const referenceDistributionValue = distribution[id];

    return {
      ...acc,
      [id]: referenceDistributionValue
        ? { enabled: true, population: referenceDistributionValue.count }
        : { enabled: false, population: undefined },
    };
  }, {});
}

function getEmptyInitialValues(
  customFieldOptions: IUserCustomFieldOptionData[]
): FormValues {
  return customFieldOptions.reduce(
    (acc, { id }) => ({
      ...acc,
      [id]: { enabled: true, population: undefined },
    }),
    {}
  );
}
