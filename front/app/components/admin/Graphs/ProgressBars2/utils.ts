import { roundPercentages, sum } from 'utils/math';
import { BarType } from './typings';

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

export const noZeroes = (number: number) => number !== 0;

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

export const filterZeroes = ({
  percentages,
  colorScheme,
}: {
  percentages: number[];
  colorScheme: string[];
}) => {
  if (percentages.length !== colorScheme.length) {
    throw new Error(
      'Percentages and colorScheme arrays should have the same length'
    );
  }

  const nonZeroPercentages: number[] = [];
  const nonZeroColorScheme: string[] = [];

  for (let i = 0; i < percentages.length; i++) {
    const percentage = percentages[i];
    if (percentage === 0) continue;

    nonZeroPercentages.push(percentage);
    nonZeroColorScheme.push(colorScheme[i]);
  }

  return { nonZeroPercentages, nonZeroColorScheme };
};
