// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { IUserCustomFieldOptionData } from 'modules/commercial/user_custom_fields/services/userCustomFieldOptions';
import {
  IReferenceDistributionData,
  TDistribution,
  TUploadDistribution,
} from '../../services/referenceDistribution';

// EXPORTS
export type FormValues = Record<string, number | null>;

export const getInitialValues = (
  userCustomFieldOptions: IUserCustomFieldOptionData[],
  referenceDataUploaded: boolean,
  referenceDistribution: IReferenceDistributionData | NilOrError
): FormValues | null => {
  if (referenceDataUploaded) {
    // If reference data has been uploaded, but the distribution
    // is nil or error, we are still waiting for the data to sync
    // Hence we return null and don't render anything until
    // the data has been synced
    if (isNilOrError(referenceDistribution)) return null;

    return getInitialValuesFromDistribution(
      userCustomFieldOptions,
      referenceDistribution
    );
  }

  return getInitialEmptyValues(userCustomFieldOptions);
};

export const isFormValid = (formValues: FormValues) => {
  if (areAllOptionsDisabled(formValues)) {
    return true;
  }

  const allOptionsFilledOut = areAllOptionsFilledOut(formValues);

  const numberOfOptionsFilledOut = Object.values(formValues).filter(
    (formValue) => formValue !== null
  ).length;

  return allOptionsFilledOut && numberOfOptionsFilledOut > 1;
};

export const getSubmitAction = (
  formValues: FormValues,
  referenceDistribution: IReferenceDistributionData | NilOrError
) => {
  if (isNilOrError(referenceDistribution)) {
    if (!areAllOptionsDisabled(formValues)) return 'create';
    return null;
  }

  if (hasNoChanges(formValues, referenceDistribution)) {
    return null;
  }

  if (areAllOptionsDisabled(formValues)) {
    return 'delete';
  }

  return 'replace';
};

export type Status = 'saved' | 'complete' | 'incomplete';

export const getStatus = (
  formValues: FormValues,
  referenceDistribution: IReferenceDistributionData | NilOrError,
  touched: boolean
): Status | null => {
  if (isSaved(formValues, referenceDistribution, touched)) {
    return 'saved';
  }

  if (isComplete(formValues, touched)) {
    return 'complete';
  }

  if (isIncomplete(formValues, touched)) {
    return 'incomplete';
  }

  return null;
};

export const parseFormValues = (formValues: FormValues) => {
  if (!isFormValid(formValues)) return null;
  return formValues as TUploadDistribution;
};

export const isSubmittingAllowed = (
  formValues: FormValues,
  touched: boolean,
  referenceDataUploaded: boolean
) => {
  if (!referenceDataUploaded && areAllOptionsDisabled(formValues)) {
    return false;
  }

  return touched && isFormValid(formValues);
};

// HELPERS
const getInitialValuesFromDistribution = (
  userCustomFieldOptions: IUserCustomFieldOptionData[],
  referenceDistribution: IReferenceDistributionData
): FormValues => {
  const { distribution } = referenceDistribution.attributes;

  return userCustomFieldOptions.reduce((acc, { id }) => {
    const referenceDistributionValue = distribution[id];
    if (!referenceDistributionValue) return acc;

    return {
      ...acc,
      [id]: referenceDistributionValue.count,
    };
  }, {});
};

const getInitialEmptyValues = (
  userCustomFieldOptions: IUserCustomFieldOptionData[]
): FormValues => {
  return userCustomFieldOptions.reduce((acc, { id }) => {
    return {
      ...acc,
      [id]: null,
    };
  }, {});
};

const areAllOptionsFilledOut = (formValues: FormValues) => {
  return Object.values(formValues).every((formValue) => {
    return formValue !== null;
  });
};

const areAllOptionsDisabled = (formValues: FormValues) => {
  return Object.keys(formValues).length === 0;
};

const hasNoChanges = (
  formValues: FormValues,
  referenceDistribution: IReferenceDistributionData
) => {
  const { distribution } = referenceDistribution.attributes;

  if (!sameNumberOfKeys(formValues, distribution)) {
    return false;
  }

  const noChanges = Object.keys(formValues).every((optionId) => {
    const population = formValues[optionId];
    const savedPopulation = distribution[optionId]?.count;

    return savedPopulation === population;
  });

  return noChanges;
};

const isSaved = (
  formValues: FormValues,
  referenceDistribution: IReferenceDistributionData | NilOrError,
  touched: boolean
) => {
  if (touched) return false;

  if (isNilOrError(referenceDistribution)) {
    if (areAllOptionsDisabled(formValues)) return true;
    return false;
  }

  return hasNoChanges(formValues, referenceDistribution);
};

const isComplete = (formValues: FormValues, touched: boolean) => {
  return (
    touched && !areAllOptionsDisabled(formValues) && isFormValid(formValues)
  );
};

const isIncomplete = (formValues: FormValues, touched: boolean) => {
  return (
    touched && !areAllOptionsDisabled(formValues) && !isFormValid(formValues)
  );
};

const sameNumberOfKeys = (
  formValues: FormValues,
  distribution: TDistribution
) => {
  return Object.keys(distribution).length === Object.keys(formValues).length;
};
