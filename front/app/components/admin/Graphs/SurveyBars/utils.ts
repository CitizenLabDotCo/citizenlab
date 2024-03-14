import { roundPercentages, sum } from 'utils/math';

import { BarType } from '../ProgressBars2/typings';

export const getType = (index: number, length: number) => {
  if (length === 1) return 'single';
  if (index === 0) return 'first';
  if (index === length - 1) return 'last';

  return 'middle';
};

export const getRoundedPercentages = (values: number[], total: number) => {
  const valuesSum = sum(values);
  const remainder = total - valuesSum;

  if (remainder < 0) {
    throw new Error('Total is smaller than the sum of the values');
  }

  const valuesWithRemainder = [...values, remainder];
  const roundedPercentages = roundPercentages(valuesWithRemainder, 1);

  return roundedPercentages.slice(0, values.length);
};

export const getBorderRadius = (type: BarType) => {
  switch (type) {
    case 'first':
      return '3px 3px 0 0';
    case 'middle':
      return '0';
    case 'last':
      return '0 0 3px 3px';
    case 'single':
      return '3px';
  }
};
