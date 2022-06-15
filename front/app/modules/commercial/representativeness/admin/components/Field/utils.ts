export const parsePopulationValue = (value: string) => {
  if (value === '') {
    return { formattedValue: '', numericValue: null };
  }

  if (isInvalid(value)) {
    return { formattedValue: null, numericValue: null };
  }

  const numericValue = asNumber(value);
  const formattedValue = numericValue.toLocaleString();

  return { numericValue, formattedValue };
};

const validValueRegex = /^\d[\d\,]*$/;
const isInvalid = (value: string) =>
  !validValueRegex.test(value) || value.length > 11;
const asNumber = (value: string) => parseInt(value.replace(/\,/g, ''));
