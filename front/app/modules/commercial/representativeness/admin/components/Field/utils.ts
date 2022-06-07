import { formatThousands } from '../ChartCard/utils';

export const parsePopulationValue = (value: string) => {
  if (isInvalid(value)) return null;

  return formatThousands(asNumber(value));
};

const validValueRegex = /\d[\d\,]*$/;
const isInvalid = (value: string) => validValueRegex.test(value);
const asNumber = (value: string) => parseInt(value.replace(',', ''));
