import { isEqual } from 'lodash-es';

import { ICustomFieldOptionData } from 'api/custom_field_options/types';
import {
  Bins,
  TUploadDistribution,
  IBinnedDistribution,
} from 'api/reference_distribution/types';
import { RemoteFormValues } from 'api/reference_distribution/useReferenceDistributionData';

import { forEachBin } from './bins';

// EXPORTS
export type FormValues = Record<string, number | null>;

export const getInitialValues = (
  userCustomFieldOptions: ICustomFieldOptionData[],
  referenceDataUploaded: boolean,
  remoteFormValues?: RemoteFormValues
): FormValues | null => {
  if (referenceDataUploaded) {
    return { ...remoteFormValues };
  }

  return getInitialEmptyValues(userCustomFieldOptions);
};

export const isFormValid = (formValues: FormValues) => {
  if (isEmptyObject(formValues)) {
    return true;
  }

  const allOptionsFilledOut = areAllOptionsFilledOut(formValues);
  const numberOfOptions = Object.keys(formValues).length;

  return allOptionsFilledOut && numberOfOptions > 1;
};

export const getSubmitAction = (
  formValues: FormValues,
  remoteFormValues?: RemoteFormValues
) => {
  if (!remoteFormValues) {
    if (!isEmptyObject(formValues)) return 'create';
    return null;
  }

  if (isEqual(formValues, remoteFormValues)) {
    return null;
  }

  if (isEmptyObject(formValues)) {
    return 'delete';
  }

  return 'replace';
};

export type Status = 'saved' | 'complete' | 'incomplete';

export const getStatus = (
  formValues: FormValues,
  remoteFormValues: RemoteFormValues | undefined,
  touched: boolean,
  binsSet?: boolean
): Status | null => {
  if (binsSet === false) return null;

  if (isSaved(formValues, remoteFormValues, touched)) {
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

export const parseFormValues = (
  formValues: FormValues,
  bins?: Bins
): TUploadDistribution | null => {
  if (!isFormValid(formValues)) return null;

  return bins
    ? convertFormValuesToBinnedDistribution(formValues, bins)
    : ({ ...formValues } as TUploadDistribution);
};

export const isSubmittingAllowed = (
  formValues: FormValues,
  touched: boolean,
  referenceDataUploaded: boolean
) => {
  if (!referenceDataUploaded && isEmptyObject(formValues)) {
    return false;
  }

  return touched && isFormValid(formValues);
};

export const convertBinsToFormValues = (
  bins: Bins,
  formValues: FormValues | null
) =>
  forEachBin(bins).reduce(
    (acc, { binId }) => ({
      ...acc,
      [binId]:
        formValues !== null && binId in formValues ? formValues[binId] : null,
    }),
    {}
  );

export const isEmptyObject = (formValues: FormValues) => {
  return Object.keys(formValues).length === 0;
};

// UTILS
const getInitialEmptyValues = (
  userCustomFieldOptions: ICustomFieldOptionData[]
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

const isSaved = (
  formValues: FormValues,
  remoteFormValues: RemoteFormValues | undefined,
  touched: boolean
) => {
  if (touched) return false;

  if (!remoteFormValues) {
    return isEmptyObject(formValues);
  }

  return isEqual(formValues, remoteFormValues);
};

const isComplete = (formValues: FormValues, touched: boolean) => {
  return touched && !isEmptyObject(formValues) && isFormValid(formValues);
};

const isIncomplete = (formValues: FormValues, touched: boolean) => {
  return touched && !isEmptyObject(formValues) && !isFormValid(formValues);
};

const convertFormValuesToBinnedDistribution = (
  formValues: FormValues,
  bins: Bins
): IBinnedDistribution => {
  const counts = forEachBin(bins).map(
    ({ binId }) => formValues[binId]
  ) as number[];

  return {
    bins,
    counts,
  };
};
