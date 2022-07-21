// utils
import { indices } from 'utils/helperUtils';
import { roundPercentages } from 'utils/math';
import { FormValues } from '../utils';
import { forEachBin } from '../../../utils';

// typings
import { IUserCustomFieldOptionData } from 'modules/commercial/user_custom_fields/services/userCustomFieldOptions';
import { Localize } from 'hooks/useLocalize';
import { Bins } from '../../../services/referenceDistribution';

/*
 * Takes a thousand-formatted locale string in the US format (e.g. 1,000,000)
 * Returns null is value is empty string, which is equivalent to the field being empty
 * Returns undefined if the value is invalid
 * Returns numeric value if the value is valid
 */
export const parsePopulationValue = (value: string) => {
  if (value === '') {
    return null;
  }

  if (isInvalid(value)) {
    return undefined;
  }

  const numericValue = asNumber(value);

  if (numericValue === 0) {
    return undefined;
  }

  return numericValue;
};

const validValueRegex = /^\d[\d,]*$/;
const isInvalid = (value: string) =>
  !validValueRegex.test(value) || value.length > 11;
const asNumber = (value: string) => parseInt(value.replace(/,/g, ''), 10);

export const getPercentages = (
  formValues: FormValues
): Record<string, string> => {
  if (areAllOptionsEmpty(formValues)) {
    return Object.keys(formValues).reduce(
      (acc, optionId) => ({
        ...acc,
        [optionId]: 'xx%',
      }),
      {}
    );
  }

  const nonEmptyEntries = Object.entries(formValues).filter(([_, value]) => {
    return value !== null;
  });

  const percentages = roundPercentages(
    nonEmptyEntries.map(([_, value]) => value) as number[],
    1
  );

  const percentagesObject = nonEmptyEntries.reduce(
    (acc, [optionId], i) => ({
      ...acc,
      [optionId]: percentages[i],
    }),
    {}
  );

  return Object.keys(formValues).reduce((acc, optionId) => {
    return {
      ...acc,
      [optionId]:
        optionId in percentagesObject
          ? `${percentagesObject[optionId]}%`
          : undefined,
    };
  }, {});
};

export const formatUserCustomFieldOptions = (
  userCustomFieldOptions: IUserCustomFieldOptionData[],
  localize: Localize
) =>
  userCustomFieldOptions.map((userCustomFieldOption) => ({
    id: userCustomFieldOption.id,
    label: localize(userCustomFieldOption.attributes.title_multiloc),
  }));

export const formatBins = (bins: Bins, andOverText: string) =>
  forEachBin(bins).map(({ lowerBound, upperBound, binId }) => ({
    id: binId,
    label: upperBound === null
      ? `${lowerBound} ${andOverText}`
      : binId
  }))

const areAllOptionsEmpty = (formValues: FormValues) => {
  return Object.values(formValues).every((formValue) => formValue === null);
};
