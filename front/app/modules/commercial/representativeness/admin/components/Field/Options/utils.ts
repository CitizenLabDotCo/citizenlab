// utils
import { sum, percentage } from 'utils/math';

// typings
import { FormValues } from '../utils';

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

  return asNumber(value);
};

const validValueRegex = /^\d[\d\,]*$/;
const isInvalid = (value: string) =>
  !validValueRegex.test(value) || value.length > 11;
const asNumber = (value: string) => parseInt(value.replace(/\,/g, ''));

export const parsePercentage = (
  value: number | null,
  formValues: FormValues
) => {
  const enteredPopulationValues = Object.keys(formValues)
    .map((optionId) => formValues[optionId])
    .filter((population) => population !== null) as number[];

  if (enteredPopulationValues.length === 0) return 'xx%';

  if (value === null) return undefined;
  if (value === 0) return '0%';

  const totalEnteredPopulation = sum(enteredPopulationValues);

  return `${percentage(value, totalEnteredPopulation)}%`;
};
