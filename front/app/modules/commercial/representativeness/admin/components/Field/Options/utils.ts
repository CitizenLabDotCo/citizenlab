// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { IUserCustomFieldOptionData } from 'modules/commercial/user_custom_fields/services/userCustomFieldOptions';
import { IReferenceDistributionData } from '../../../services/referenceDistribution';
import { FormValues } from './';

/*
 * Takes a thousand-formatted locale string in the US format (e.g. 1,000,000)
 * Returns undefined is value is empty string, which is equivalent to the field being empty
 * Returns null if the value is invalid
 * Returns numeric value if the value is valid
 */
export const parsePopulationValue = (value: string) => {
  if (value === '') {
    return undefined;
  }

  if (isInvalid(value)) {
    return null;
  }

  return asNumber(value);
};

const validValueRegex = /^\d[\d\,]*$/;
const isInvalid = (value: string) =>
  !validValueRegex.test(value) || value.length > 11;
const asNumber = (value: string) => parseInt(value.replace(/\,/g, ''));

export function getInitialValues(
  userCustomFieldOptions: IUserCustomFieldOptionData[],
  referenceDataUploaded: boolean,
  referenceDistribution: IReferenceDistributionData | NilOrError
): FormValues | null {
  if (referenceDataUploaded) {
    if (isNilOrError(referenceDistribution)) return null;

    return getInitialValuesFromDistribution(
      userCustomFieldOptions,
      referenceDistribution
    );
  }

  return getEmptyInitialValues(userCustomFieldOptions);
}

function getInitialValuesFromDistribution(
  userCustomFieldOptions: IUserCustomFieldOptionData[],
  referenceDistribution: IReferenceDistributionData
): FormValues {
  const { distribution } = referenceDistribution.attributes;

  return userCustomFieldOptions.reduce((acc, { id }) => {
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
  userCustomFieldOptions: IUserCustomFieldOptionData[]
): FormValues {
  return userCustomFieldOptions.reduce(
    (acc, { id }) => ({
      ...acc,
      [id]: { enabled: true, population: undefined },
    }),
    {}
  );
}
