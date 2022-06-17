// utils
import { sum, percentage } from 'utils/math';

// typings
import { FormValues } from '../utils';

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

export const parsePercentage = (
  value: number | undefined,
  formValues: FormValues
) => {
  const populationValues = Object.keys(formValues)
    .map((optionId) => formValues[optionId].population)
    .filter((population) => population !== undefined) as number[];

  if (populationValues.length === 0) return 'xx%';

  if (value === undefined) return undefined;
  if (value === 0) return '0%';

  const totalFilledOutPopulation = sum(populationValues);

  return `${percentage(value, totalFilledOutPopulation)}%`;
};
