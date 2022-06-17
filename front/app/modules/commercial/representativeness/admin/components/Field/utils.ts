// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { IUserCustomFieldOptionData } from 'modules/commercial/user_custom_fields/services/userCustomFieldOptions';
import { IReferenceDistributionData } from '../../services/referenceDistribution';

interface OptionValues {
  enabled: boolean;
  population?: number;
}

export type FormValues = Record<string, OptionValues>;

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

export function isSubmittingAllowed(formValues: FormValues) {
  const anyOptionInvalid = Object.keys(formValues).some((optionId) => {
    const { enabled, population } = formValues[optionId];
    return enabled && population === undefined;
  });

  return !anyOptionInvalid;
}
