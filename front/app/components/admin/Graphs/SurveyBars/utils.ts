import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import { Localize } from 'hooks/useLocalize';

import { roundPercentages, sum } from 'utils/math';

import { BarType, Option } from './typings';

export const parseQuestion = (
  result: ResultUngrouped | ResultGrouped,
  colorScheme: string[],
  localize: Localize,
  noAnswerCopy: string
): Option[] => {
  if (result.grouped) {
    // TODO
    return [];
  }

  const { multilocs, answers } = result;
  if (!multilocs) throw new Error('Multilocs are missing');

  const optionPercentages = roundPercentages(
    answers.map(({ count }) => count),
    1
  );

  return answers.map(({ answer }, i) => {
    const label =
      answer === null
        ? noAnswerCopy
        : localize(multilocs.answer[answer].title_multiloc);

    const percentage = optionPercentages[i];

    return {
      label,
      percentage: 1,
      bars: [
        {
          type: 'single',
          percentage,
          color: colorScheme[0],
        },
      ],
    };
  });
};

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
