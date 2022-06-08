import { formatThousands } from '../ChartCard/utils';

export const parsePopulationValue = (value: string) => {
  if (value === '') return '';
  if (isInvalid(value)) return null;

  return formatThousands(asNumber(value));
};

const validValueRegex = /^\d[\d\,]*$/;
const isInvalid = (value: string) =>
  !validValueRegex.test(value) || value.length > 11;
const asNumber = (value: string) => parseInt(value.replace(/\,/g, ''));
