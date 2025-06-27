import { colors } from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import { Localize } from 'hooks/useLocalize';

import { roundPercentage } from 'utils/math';

import { BarType, Answer } from './typings';

export const parseQuestionResult = (
  result: ResultUngrouped | ResultGrouped,
  colorScheme: string[],
  localize: Localize,
  noAnswerCopy: string
): Answer[] => {
  if (result.grouped) {
    const { multilocs, answers, totalPickCount } = result;

    const colorSchemeMap = constructColorSchemeMap(result.legend, colorScheme);

    return answers.map(({ answer, count, groups }) => {
      const label =
        answer === null
          ? noAnswerCopy
          : localize(multilocs.answer[answer].title_multiloc);

      const image = answer ? multilocs.answer[answer].image : undefined;

      return {
        label,
        logicFilterId: null,
        logic: {},
        image,
        count,
        percentage: roundPercentage(count, totalPickCount, 1),
        bars:
          groups.length === 0
            ? [
                {
                  type: 'single',
                  count: 0,
                  percentage: 0,
                  color: EMPTY_COLOR,
                },
              ]
            : groups.map(({ group, count }, groupIndex) => {
                const type = getType(groupIndex, groups.length);

                return {
                  type,
                  count,
                  percentage: roundPercentage(count, totalPickCount, 1),
                  color: colorSchemeMap.get(group) ?? EMPTY_COLOR,
                };
              }),
      };
    });
  }

  const {
    multilocs,
    answers,
    logic,
    inputType,
    totalPickCount,
    totalResponseCount,
  } = result;
  if (!multilocs) throw new Error('Multilocs are missing');

  // Don't return 'No answer' if everyone answered
  const filteredAnswers = answers?.filter(
    ({ count, answer }) => !(answer === null && count === 0)
  );

  return (
    filteredAnswers?.map(({ count, answer }) => {
      const label =
        answer === null
          ? noAnswerCopy
          : localize(multilocs.answer[answer].title_multiloc);

      const image = answer ? multilocs.answer[answer].image : undefined;
      const percentage =
        // When we show results of a multi-select question,
        // we use the percentage of total responses (totalResponseCount) per option
        // rather than percentage of total options selected (totalPickCount).
        inputType === 'multiselect'
          ? roundPercentage(count, totalResponseCount, 1)
          : roundPercentage(count, totalPickCount, 1);

      const logicAnswerKey = answer === null ? 'no_answer' : answer;
      const logicForAnswer = logic?.answer?.[logicAnswerKey];
      const logicFilterId = logic?.answer?.[logicAnswerKey]?.id || null;

      return {
        label,
        logicFilterId,
        logic: logicForAnswer,
        image,
        count,
        percentage,
        bars: [
          {
            type: 'single',
            percentage,
            count,
            color: colorScheme[0],
          },
        ],
      };
    }) || []
  );
};

export const EMPTY_COLOR = colors.coolGrey300;

const constructColorSchemeMap = (
  legend: (string | null)[],
  colorScheme: string[]
) => {
  return legend.reduce((acc, value, i) => {
    if (value === null) {
      acc.set(null, EMPTY_COLOR);
    } else {
      acc.set(value, colorScheme[i % colorScheme.length]);
    }

    return acc;
  }, new Map<string | null, string>());
};

export const getType = (index: number, length: number) => {
  if (length === 1) return 'single';
  if (index === 0) return 'first';
  if (index === length - 1) return 'last';

  return 'middle';
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

export const measureText = (str: string, fontSize: number) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;

  context.font = `${fontSize}px Public Sans`;
  const metrics = context.measureText(str);

  return metrics.width;
};
