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
